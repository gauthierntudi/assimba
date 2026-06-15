/**
 * Après db:push — copie les factures actuelles vers historical_purchases si absentes.
 *
 * Usage: node scripts/backfill-historical-purchases.mjs
 */
import './load-env.mjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const invoices = await prisma.invoice.findMany();

  let created = 0;

  for (const invoice of invoices) {
    const reference = invoice.reference ?? `LEGACY-${invoice.id}`;
    const exists = await prisma.purchaseHistory.findUnique({ where: { reference } });
    if (exists) continue;

    await prisma.purchaseHistory.create({
      data: {
        supporterId: invoice.supporterId,
        reference,
        flexpayReference: invoice.flexpayReference,
        amount: invoice.amount,
        currency: invoice.currency,
        paymentType: invoice.paymentType,
        paymentPhone: invoice.paymentPhone,
        status: invoice.status,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
      },
    });
    created += 1;
  }

  console.log(`Backfill terminé: ${created} entrée(s) ajoutée(s) dans historical_purchases.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
