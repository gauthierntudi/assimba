import './_lib/setup.js';
import { prisma } from '../server/dist/lib/prisma.js';
import type { ApiRequest, ApiResponse } from './_lib/http.js';

export default async function handler(_req: ApiRequest, res: ApiResponse) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ok: true, service: 'simba-api' });
  } catch {
    res.status(503).json({ ok: false, service: 'simba-api', database: 'unavailable' });
  }
}
