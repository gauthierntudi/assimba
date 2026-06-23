import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { smsTestGuard } from '../middleware/smsTestGuard.js';
import {
  getOrangeAccessToken,
  getOrangeDeliveryInfo,
  getOrangeSmsPublicConfig,
  listOrangeContracts,
  listOrangeStatistics,
  sendOrangeSms,
  subscribeOrangeDeliveryReceipt,
} from '../services/orange-sms.service.js';
import { listOrangeDeliveryReceipts } from '../services/orange-sms-dr.store.js';

const router = Router();

router.use(smsTestGuard);

router.get(
  '/config',
  asyncHandler(async (_req, res) => {
    res.json({ success: true, config: getOrangeSmsPublicConfig() });
  }),
);

router.post(
  '/token',
  asyncHandler(async (_req, res) => {
    const token = await getOrangeAccessToken();
    res.json({
      success: true,
      tokenType: token.tokenType,
      expiresIn: token.expiresIn,
      accessTokenPreview: `${token.accessToken.slice(0, 12)}…`,
    });
  }),
);

router.post(
  '/send',
  asyncHandler(async (req, res) => {
    const to = String(req.body?.to ?? '').trim();
    const message = String(req.body?.message ?? '').trim();
    const senderName = String(req.body?.senderName ?? '').trim();

    if (!to || !message) {
      res.status(400).json({ success: false, message: 'Destinataire et message requis.' });
      return;
    }

    const result = await sendOrangeSms({ to, message, senderName: senderName || undefined });

    res.status(result.ok ? 200 : result.status).json({
      success: result.ok,
      status: result.status,
      resourceId: result.resourceId,
      recipientWarnings: result.recipientWarnings,
      deliveryNote: result.deliveryNote,
      request: result.request,
      response: result.response,
    });
  }),
);

router.get(
  '/delivery-receipts',
  asyncHandler(async (_req, res) => {
    res.json({ success: true, receipts: listOrangeDeliveryReceipts() });
  }),
);

router.get(
  '/delivery-status/:resourceId',
  asyncHandler(async (req, res) => {
    const resourceId = String(req.params.resourceId ?? '').trim();
    if (!resourceId) {
      res.status(400).json({ success: false, message: 'resourceId requis.' });
      return;
    }

    const result = await getOrangeDeliveryInfo(resourceId);
    res.status(result.ok ? 200 : result.status).json({
      success: result.ok,
      status: result.status,
      response: result.response,
    });
  }),
);

router.post(
  '/subscribe',
  asyncHandler(async (req, res) => {
    const notifyUrl = String(req.body?.notifyUrl ?? '').trim();

    if (!notifyUrl) {
      res.status(400).json({ success: false, message: 'notifyUrl requis.' });
      return;
    }

    const result = await subscribeOrangeDeliveryReceipt(notifyUrl);

    res.status(result.ok ? 200 : result.status).json({
      success: result.ok,
      status: result.status,
      request: result.request,
      response: result.response,
    });
  }),
);

router.get(
  '/contracts',
  asyncHandler(async (req, res) => {
    const country = String(req.query.country ?? 'COD').trim() || 'COD';
    const result = await listOrangeContracts(country);

    res.status(result.ok ? 200 : result.status).json({
      success: result.ok,
      status: result.status,
      response: result.response,
    });
  }),
);

router.get(
  '/statistics',
  asyncHandler(async (req, res) => {
    const country = String(req.query.country ?? 'COD').trim() || 'COD';
    const result = await listOrangeStatistics(country);

    res.status(result.ok ? 200 : result.status).json({
      success: result.ok,
      status: result.status,
      response: result.response,
    });
  }),
);

export default router;
