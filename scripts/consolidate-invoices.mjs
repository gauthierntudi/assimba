/**
 * Avant db:push — supprime les factures en double (1 supporter = 1 facture conservée).
 * Garde: paid > pending > failed, puis la plus récente.
 *
 * Usage: node scripts/consolidate-invoices.mjs
 */
import './load-env.mjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const statusRank = (status) => {
  if (status === 'paid') return 3;
  if (status === 'pending') return 2;
  return 1;
};

async function main() {
  const invoices = await prisma.$queryRaw`
    SELECT id, supporter_id AS "supporterId", status, created_at AS "createdAt"
    FROM invoices
    ORDER BY supporter_id ASC, created_at DESC
  `;

  if (!invoices.length) {
    console.log('Aucune facture à consolider.');
    return;
  }

  const bySupporter = new Map();
  for (const invoice of invoices) {
    const list = bySupporter.get(invoice.supporterId) ?? [];
    list.push(invoice);
    bySupporter.set(invoice.supporterId, list);
  }

  let removed = 0;

  for (const rows of bySupporter.values()) {
    if (rows.length <= 1) continue;

    const sorted = [...rows].sort((a, b) => {
      const rankDiff = statusRank(b.status) - statusRank(a.status);
      if (rankDiff !== 0) return rankDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    for (const duplicate of sorted.slice(1)) {
      await prisma.$executeRaw`DELETE FROM invoices WHERE id = ${duplicate.id}`;
      removed += 1;
    }
  }

  console.log(`Consolidation terminée: ${removed} facture(s) en double supprimée(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
