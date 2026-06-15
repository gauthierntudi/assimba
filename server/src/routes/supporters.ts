import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { checkPhone, parseBodyToSupporter, upsertSupporter } from '../services/supporter.service.js';
import { prisma } from '../lib/prisma.js';
import { mergeSupporterInput } from '../utils/payload.js';
import { phoneLookupVariants } from '../utils/phone.js';

const router = Router();

router.post(
  '/check-phone',
  asyncHandler(async (req, res) => {
    const phone = String(req.body.phone ?? '').trim();

    if (!phone) {
      res.status(400).json({ success: false, message: 'Numéro de téléphone manquant' });
      return;
    }

    const result = await checkPhone(phone);
    res.json(result);
  }),
);

router.post(
  '/draft',
  asyncHandler(async (req, res) => {
    const parsed = parseBodyToSupporter(req.body);

    if (!parsed.phone) {
      res.status(400).json({
        success: false,
        message: 'Numéro de téléphone manquant pour la sauvegarde.',
      });
      return;
    }

    const existing = await prisma.supporter.findFirst({
      where: { phone: { in: phoneLookupVariants(parsed.phone) } },
    });

    const input = existing ? mergeSupporterInput(existing, parsed) : parsed;
    await upsertSupporter(input);
    res.json({ success: true });
  }),
);

export default router;
