export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { getCardDownloadByFanId } = await import('../_dist/services/card.service.js');

    const fanId = String(req.body?.fanId ?? req.body?.memberNumber ?? '').trim();

    if (!fanId) {
      res.status(400).json({ success: false, message: 'Numéro membre requis.' });
      return;
    }

    const result = await getCardDownloadByFanId(fanId);

    if (!result) {
      res.status(404).json({
        success: false,
        message:
          'Aucune carte trouvée pour ce FAN ID. Vérifiez votre numéro ou finalisez votre paiement.',
      });
      return;
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.status(200).send(result.buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
