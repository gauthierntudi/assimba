export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { checkPhone } = await import('../_dist/services/supporter.service.js');
    const phone = String((req.body as { phone?: string })?.phone ?? '').trim();

    if (!phone) {
      res.status(400).json({ success: false, message: 'Numéro de téléphone manquant' });
      return;
    }

    res.status(200).json(await checkPhone(phone));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
