export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { handleFlexpayCallback } = await import('../_dist/services/flexpay.service.js');
    res.status(200).json(await handleFlexpayCallback((req.body ?? {}) as Record<string, unknown>));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
