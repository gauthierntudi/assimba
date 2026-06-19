import { env, flexpayCallbackUrl } from '../config/env.js';
import { buildInvoiceReference } from '../utils/payload.js';
import { isValidFlexpayDrcPhone, toFlexpayPhone } from '../utils/phone.js';
import { calculatePricing } from './pricing.service.js';
import { buildCardLinksForSupporter } from './card-token.service.js';
import {
  attachFlexpayOrderNumber,
  markPaymentAttemptFailed,
  markPaymentAttemptPaid,
  startPaymentAttempt,
} from './purchase.service.js';
import { upsertSupporter, parseBodyToSupporter } from './supporter.service.js';
import { prisma } from '../lib/prisma.js';

type FlexpayMobileResponse = {
  code?: string;
  orderNumber?: string;
  message?: string;
};

type FlexpayCheckResponse = {
  code?: string;
  transaction?: { status?: string };
};

async function buildPaidStatusResponse(paymentKey: string) {
  const { finalizeRegistration } = await import('./registration.service.js');
  const memberNumber = await finalizeRegistration(paymentKey);

  if (!memberNumber) {
    return { success: true as const, status: 'paid' as const };
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      OR: [{ flexpayReference: paymentKey }, { reference: paymentKey }],
    },
    select: { supporterId: true },
  });

  if (!invoice) {
    return {
      success: true as const,
      status: 'paid' as const,
      memberNumber,
    };
  }

  const links = buildCardLinksForSupporter(invoice.supporterId, memberNumber);

  return {
    success: true as const,
    status: 'paid' as const,
    memberNumber,
    cardDownloadToken: links.token,
    cardDownloadUrl: `/api/cards/download?token=${encodeURIComponent(links.token)}`,
    cardDownloadPageUrl: links.cardDownloadPageUrl,
  };
}

function pickPaymentPhone(body: Record<string, unknown>): string {
  return String(body.payment_phone_full ?? body.paymentPhone ?? '').trim();
}

function pickPaymentType(body: Record<string, unknown>): string {
  return String(body.payment_type ?? body.paymentType ?? '1');
}

function pickCurrency(body: Record<string, unknown>): string {
  return String(body.currency ?? 'CDF');
}

export async function initiatePayment(body: Record<string, unknown>) {
  const input = parseBodyToSupporter(body);

  if (!input.firstname || !input.lastname) {
    return { success: false as const, message: 'Nom et Prénom obligatoires' };
  }

  if (!input.phone) {
    return { success: false as const, message: 'Numéro de téléphone manquant.' };
  }

  const paymentType = pickPaymentType(body);
  const currencyChoice = pickCurrency(body);
  const memberType = input.memberType ?? 'simple';
  const pricing = await calculatePricing(memberType, currencyChoice);
  const paymentPhone = pickPaymentPhone(body);

  if (paymentType === '2' && memberType !== 'premium') {
    return {
      success: false as const,
      message: "La carte bancaire est disponible uniquement pour l'adhésion Premium.",
    };
  }

  if (paymentType === '2' && pricing.amountUsdEquivalent < 2) {
    return {
      success: false as const,
      message: "La carte bancaire est disponible uniquement pour un montant d'au moins 2 USD.",
    };
  }

  const supporterId = await upsertSupporter(input, { includeMemberType: true });

  const existingInvoice = await prisma.invoice.findUnique({
    where: { supporterId },
    select: { status: true },
  });

  if (existingInvoice?.status === 'paid') {
    return {
      success: false as const,
      message: 'Ce numéro est déjà utilisé.',
    };
  }

  const flexpayRef = buildInvoiceReference(supporterId);

  await startPaymentAttempt({
    supporterId,
    reference: flexpayRef,
    amount: pricing.amount,
    currency: pricing.currency,
    paymentType,
    paymentPhone: paymentPhone || null,
  });

  const description = `Inscription Supporter: ${input.firstname} ${input.lastname}`;

  if (paymentType === '1') {
    const flexpayPhone = toFlexpayPhone(paymentPhone || input.phone);

    if (!isValidFlexpayDrcPhone(flexpayPhone)) {
      await markPaymentAttemptFailed(
        flexpayRef,
        'Numéro Mobile Money invalide. Utilisez un numéro RDC actif (ex. 0812345678).',
      );
      return {
        success: false as const,
        message:
          'Numéro Mobile Money invalide. Utilisez un numéro RDC actif (ex. 0812345678).',
      };
    }

    const basePayload: Record<string, string> = {
      merchant: env.flexpay.merchant,
      type: paymentType,
      reference: flexpayRef,
      phone: flexpayPhone,
      amount: String(pricing.amount),
      currency: pricing.currency,
      callbackUrl: flexpayCallbackUrl,
      description,
    };

    const response = await fetch(env.flexpay.mobileApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: env.flexpay.token,
      },
      body: JSON.stringify(basePayload),
      signal: AbortSignal.timeout(30_000),
    });

    const raw = await response.text();

    if (!response.ok) {
      await markPaymentAttemptFailed(flexpayRef, `Erreur API FlexPay (HTTP ${response.status})`);
      return {
        success: false as const,
        message: `Erreur API FlexPay (HTTP ${response.status})`,
        raw,
      };
    }

    const result = JSON.parse(raw) as FlexpayMobileResponse;

    if (String(result.code) === '0' && result.orderNumber) {
      await attachFlexpayOrderNumber(flexpayRef, result.orderNumber, flexpayPhone);

      return {
        success: true as const,
        is_redirect: false as const,
        message: 'Transaction envoyée avec succès. Veuillez valider le push message',
        orderNumber: result.orderNumber,
      };
    }

    await markPaymentAttemptFailed(
      flexpayRef,
      result.message ?? 'Erreur inconnue de FlexPay lors du lancement mobile',
    );

    return {
      success: false as const,
      message: result.message ?? 'Erreur inconnue de FlexPay lors du lancement mobile',
      raw,
    };
  }

  if (paymentType === '2') {
    const returnBaseUrl = `${env.webUrl}/?ref=${encodeURIComponent(flexpayRef)}`;
    const cardToken = env.flexpay.token.trim();

    const cardParams: Record<string, string> = {
      merchant: env.flexpay.merchant,
      reference: flexpayRef,
      amount: String(pricing.amount),
      currency: pricing.currency,
      description: "Frais d'inscription Supporter",
      authorization: cardToken,
      Authorization: cardToken,
      token: cardToken,
      callback_url: flexpayCallbackUrl,
      approve_url: `${returnBaseUrl}&status=success`,
      cancel_url: `${returnBaseUrl}&status=cancel`,
      decline_url: `${returnBaseUrl}&status=decline`,
      home_url: env.webUrl,
    };

    return {
      success: true as const,
      is_redirect: true as const,
      url: env.flexpay.cardApiUrl,
      params: cardParams,
    };
  }

  await markPaymentAttemptFailed(flexpayRef, 'Type de paiement invalide');
  return { success: false as const, message: 'Type de paiement invalide' };
}

export async function checkPaymentStatus(paymentKey: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      OR: [{ flexpayReference: paymentKey }, { reference: paymentKey }],
    },
    select: { status: true, flexpayReference: true, reference: true },
  });

  if (invoice?.status === 'paid') {
    return buildPaidStatusResponse(invoice.flexpayReference ?? invoice.reference ?? paymentKey);
  }

  const lookupKey = invoice?.flexpayReference ?? paymentKey;
  const checkUrl = `${env.flexpay.checkApiUrl}/${encodeURIComponent(lookupKey)}`;
  const response = await fetch(checkUrl, {
    headers: {
      Authorization: env.flexpay.token,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (response.ok) {
    const data = (await response.json()) as FlexpayCheckResponse;

    if (String(data.code) === '0' && data.transaction) {
      const txStatus = data.transaction.status;

      if (String(txStatus) === '0') {
        await markPaymentAttemptPaid(lookupKey);
        return buildPaidStatusResponse(lookupKey);
      }

      if (String(txStatus) === '1') {
        const attempt = await prisma.purchaseHistory.findFirst({
          where: {
            OR: [{ flexpayReference: lookupKey }, { reference: lookupKey }],
          },
          select: { reference: true },
        });

        if (attempt?.reference) {
          await markPaymentAttemptFailed(
            attempt.reference,
            'Transaction échouée ou annulée par le client.',
          );
        }

        return {
          success: true as const,
          status: 'failed' as const,
          message: 'Transaction échouée ou annulée par le client.',
        };
      }
    }
  }

  return { success: true as const, status: 'pending' as const };
}

export async function handleFlexpayCallback(payload: Record<string, unknown>) {
  if (payload.code === '0' || payload.code === 0) {
    const orderNumber = String(payload.orderNumber ?? '');
    if (!orderNumber) {
      return { status: 'ignored' as const };
    }

    await markPaymentAttemptPaid(orderNumber);

    const { finalizeRegistration } = await import('./registration.service.js');
    await finalizeRegistration(orderNumber);

    return {
      status: 'received' as const,
      message: 'Facture mise à jour et notification envoyée',
    };
  }

  return { status: 'ignored' as const };
}
