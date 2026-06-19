import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getCardDownloadByFanId, getCardDownloadByOrder, getCardDownloadByToken } from '../services/card.service.js';

const router = Router();

router.post(
  '/download-by-fan-id',
  asyncHandler(async (req, res) => {
    const fanId = String(req.body?.fanId ?? req.body?.memberNumber ?? '').trim();

    if (!fanId) {
      res.status(400).json({ success: false, message: 'Numéro membre requis.' });
      return;
    }

    const result = await getCardDownloadByFanId(fanId);

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Aucune carte trouvée pour ce FAN ID. Vérifiez votre numéro ou finalisez votre paiement.',
      });
      return;
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(result.buffer);
  }),
);

router.get(
  '/download',
  asyncHandler(async (req, res) => {
    const token = String(req.query.token ?? '').trim();
    const order = String(req.query.order ?? '').trim();
    const fanId = String(req.query.fanId ?? req.query.memberNumber ?? '').trim();

    const result = token
      ? await getCardDownloadByToken(token)
      : fanId
        ? await getCardDownloadByFanId(fanId)
        : order
          ? await getCardDownloadByOrder(order)
          : null;

    if (!result) {
      res.status(404).json({ success: false, message: 'Carte introuvable ou accès non autorisé.' });
      return;
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(result.buffer);
  }),
);

export default router;
