export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { storeOrangeDeliveryReceipt } = await import(
      '../_dist/services/orange-sms-dr.store.js'
    );

    const entry = storeOrangeDeliveryReceipt(req.body ?? {});
    console.log('[orange-sms-dr]', entry);

    res.status(200).json({ success: true, received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
