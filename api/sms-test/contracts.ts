import { assertSmsTestRequest } from '../_lib/smsTestGuard.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  if (!assertSmsTestRequest(req, res)) {
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { listOrangeContracts } = await import('../_dist/services/orange-sms.service.js');
    const country = String(req.query?.country ?? 'COD').trim() || 'COD';
    const result = await listOrangeContracts(country);

    res.status(result.ok ? 200 : result.status).json({
      success: result.ok,
      status: result.status,
      response: result.response,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
