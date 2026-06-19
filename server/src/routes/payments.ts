import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { checkPaymentStatus, initiatePayment } from '../services/flexpay.service.js';

const router = Router();

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const result = await initiatePayment(req.body);
    res.json(result);
  }),
);

router.get(
  '/status',
  asyncHandler(async (req, res) => {
    const order = String(req.query.order ?? req.query.ref ?? '').trim();

    if (!order) {
      res.status(400).json({ success: false, message: 'Order number missing' });
      return;
    }

    const result = await checkPaymentStatus(order);
    res.json(result);
  }),
);

export default router;
