import { Prisma } from '@prisma/client';
import { env, flexpayCallbackUrl } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { buildInvoiceReference } from '../utils/payload.js';
import { isValidFlexpayDrcPhone, toFlexpayPhone } from '../utils/phone.js';
import { calculatePricing } from './pricing.service.js';
import { upsertSupporter, parseBodyToSupporter } from './supporter.service.js';

type FlexpayMobileResponse = {
  code?: string;
  orderNumber?: string;
  message?: string;
};

type FlexpayCheckResponse = {
  code?: string;
  transaction?: { status?: string };
};

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
  const flexpayRef = buildInvoiceReference(supporterId);

  const invoice = await prisma.invoice.create({
    data: {
      supporterId,
      reference: flexpayRef,
      flexpayReference: flexpayRef,
      amount: new Prisma.Decimal(String(pricing.amount)),
      currency: pricing.currency,
      paymentType,
      paymentPhone: paymentPhone || null,
      status: 'pending',
    },
  });

  const description = `Inscription Supporter: ${input.firstname} ${input.lastname}`;

  if (paymentType === '1') {
    const flexpayPhone = toFlexpayPhone(paymentPhone || input.phone);

    if (!isValidFlexpayDrcPhone(flexpayPhone)) {
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
      return {
        success: false as const,
        message: `Erreur API FlexPay (HTTP ${response.status})`,
        raw,
      };
    }

    const result = JSON.parse(raw) as FlexpayMobileResponse;

    if (String(result.code) === '0' && result.orderNumber) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          flexpayReference: result.orderNumber,
          paymentPhone: flexpayPhone,
        },
      });

      return {
        success: true as const,
        is_redirect: false as const,
        message: 'Transaction envoyée avec succès. Veuillez valider le push message',
        orderNumber: result.orderNumber,
      };
    }

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

  return { success: false as const, message: 'Type de paiement invalide' };
}

export async function checkPaymentStatus(orderNumber: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { flexpayReference: orderNumber },
    select: { status: true },
  });

  if (invoice?.status === 'paid') {
    const { finalizeRegistration } = await import('./registration.service.js');
    await finalizeRegistration(orderNumber);
    return { success: true as const, status: 'paid' as const };
  }

  const checkUrl = `${env.flexpay.checkApiUrl}/${encodeURIComponent(orderNumber)}`;
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
        await prisma.invoice.updateMany({
          where: { flexpayReference: orderNumber },
          data: { status: 'paid' },
        });

        const { finalizeRegistration } = await import('./registration.service.js');
        await finalizeRegistration(orderNumber);

        return { success: true as const, status: 'paid' as const };
      }

      if (String(txStatus) === '1') {
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

    await prisma.invoice.updateMany({
      where: { flexpayReference: orderNumber },
      data: { status: 'paid' },
    });

    const { finalizeRegistration } = await import('./registration.service.js');
    await finalizeRegistration(orderNumber);

    return {
      status: 'received' as const,
      message: 'Facture mise à jour et notification envoyée',
    };
  }

  return { status: 'ignored' as const };
}
