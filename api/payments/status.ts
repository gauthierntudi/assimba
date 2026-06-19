export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { checkPaymentStatus } = await import('../_dist/services/flexpay.service.js');
    const order = String(req.query?.order ?? req.query?.ref ?? '').trim();

    if (!order) {
      res.status(400).json({ success: false, message: 'Order number missing' });
      return;
    }

    res.status(200).json(await checkPaymentStatus(order));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
