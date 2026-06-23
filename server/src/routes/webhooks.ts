import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { handleFlexpayCallback } from '../services/flexpay.service.js';
import { storeOrangeDeliveryReceipt } from '../services/orange-sms-dr.store.js';

const router = Router();

router.post(
  '/flexpay',
  asyncHandler(async (req, res) => {
    const result = await handleFlexpayCallback(req.body ?? {});
    res.json(result);
  }),
);

router.post(
  '/orange-sms-dr',
  asyncHandler(async (req, res) => {
    const entry = storeOrangeDeliveryReceipt(req.body ?? {});
    console.log('[orange-sms-dr]', entry);
    res.status(200).json({ success: true, received: true });
  }),
);

export default router;
