import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export type PaymentAttemptInput = {
  supporterId: number;
  reference: string;
  amount: number;
  currency: string;
  paymentType: string;
  paymentPhone: string | null;
};

const attemptData = (input: PaymentAttemptInput) => ({
  supporterId: input.supporterId,
  reference: input.reference,
  flexpayReference: input.reference,
  amount: new Prisma.Decimal(String(input.amount)),
  currency: input.currency,
  paymentType: input.paymentType,
  paymentPhone: input.paymentPhone,
  status: 'pending',
});

export async function startPaymentAttempt(input: PaymentAttemptInput) {
  const data = attemptData(input);

  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchaseHistory.create({ data });
    await tx.invoice.upsert({
      where: { supporterId: input.supporterId },
      create: data,
      update: data,
    });
    return purchase;
  });
}

export async function attachFlexpayOrderNumber(
  reference: string,
  orderNumber: string,
  paymentPhone?: string,
) {
  const attempt = await prisma.purchaseHistory.findUnique({
    where: { reference },
    select: { supporterId: true },
  });

  if (!attempt) {
    return;
  }

  const update = {
    flexpayReference: orderNumber,
    ...(paymentPhone ? { paymentPhone } : {}),
  };

  await prisma.$transaction([
    prisma.purchaseHistory.update({
      where: { reference },
      data: update,
    }),
    prisma.invoice.update({
      where: { supporterId: attempt.supporterId },
      data: update,
    }),
  ]);
}

export async function markPaymentAttemptFailed(reference: string, message?: string) {
  const attempt = await prisma.purchaseHistory.findUnique({
    where: { reference },
    select: { supporterId: true },
  });

  if (!attempt) {
    return;
  }

  const historyData = {
    status: 'failed',
    providerMessage: message ?? null,
  };

  await prisma.$transaction([
    prisma.purchaseHistory.update({
      where: { reference },
      data: historyData,
    }),
    prisma.invoice.update({
      where: { supporterId: attempt.supporterId },
      data: { status: 'failed' },
    }),
  ]);
}

export async function markPaymentAttemptPaid(flexpayReference: string) {
  const attempt = await prisma.purchaseHistory.findFirst({
    where: { flexpayReference },
    select: { id: true, supporterId: true, status: true },
  });

  if (!attempt || attempt.status === 'paid') {
    return attempt?.supporterId ?? null;
  }

  await prisma.$transaction([
    prisma.purchaseHistory.update({
      where: { id: attempt.id },
      data: { status: 'paid', providerMessage: null },
    }),
    prisma.invoice.update({
      where: { supporterId: attempt.supporterId },
      data: { status: 'paid', flexpayReference },
    }),
  ]);

  return attempt.supporterId;
}

export async function getInvoiceStatusByFlexpayReference(flexpayReference: string) {
  return prisma.invoice.findFirst({
    where: { flexpayReference },
    select: { status: true, supporterId: true },
  });
}
