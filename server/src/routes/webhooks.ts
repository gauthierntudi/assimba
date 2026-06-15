import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { handleFlexpayCallback } from '../services/flexpay.service.js';

const router = Router();

router.post(
  '/flexpay',
  asyncHandler(async (req, res) => {
    const result = await handleFlexpayCallback(req.body ?? {});
    res.json(result);
  }),
);

export default router;
