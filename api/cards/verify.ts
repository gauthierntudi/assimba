export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { verifyCardByToken } = await import('../_dist/services/card.service.js');

    const token = String(req.query?.token ?? '').trim();

    if (!token) {
      res.status(400).json({ success: false, message: 'Jeton de vérification requis.' });
      return;
    }

    const card = await verifyCardByToken(token);

    if (!card) {
      res.status(404).json({
        success: false,
        message: 'Carte non reconnue ou accès non autorisé.',
      });
      return;
    }

    res.status(200).json({ success: true, card });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
