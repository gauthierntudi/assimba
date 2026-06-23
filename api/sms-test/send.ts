import { assertSmsTestRequest } from '../_lib/smsTestGuard.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  if (!assertSmsTestRequest(req, res)) {
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { sendOrangeSms } = await import('../_dist/services/orange-sms.service.js');

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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
