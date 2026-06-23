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
    const { subscribeOrangeDeliveryReceipt } = await import(
      '../_dist/services/orange-sms.service.js'
    );

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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
