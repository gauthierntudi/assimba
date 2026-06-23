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
    const { getOrangeSmsPublicConfig } = await import('../_dist/services/orange-sms.service.js');
    res.status(200).json({ success: true, config: getOrangeSmsPublicConfig() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
