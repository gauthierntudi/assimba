import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { checkPhone, parseBodyToSupporter, upsertSupporter } from '../services/supporter.service.js';

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
    const input = parseBodyToSupporter(req.body);

    if (!input.phone) {
      res.status(400).json({
        success: false,
        message: 'Numéro de téléphone manquant pour la sauvegarde.',
      });
      return;
    }

    await upsertSupporter(input);
    res.json({ success: true });
  }),
);

export default router;
