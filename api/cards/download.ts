export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { getCardDownloadByFanId, getCardDownloadByOrder, getCardDownloadByToken } = await import(
      '../_dist/services/card.service.js'
    );

    const token = String(req.query?.token ?? '').trim();
    const order = String(req.query?.order ?? req.query?.ref ?? '').trim();
    const fanId = String(req.query?.fanId ?? req.query?.memberNumber ?? '').trim();

    const result = token
      ? await getCardDownloadByToken(token)
      : fanId
        ? await getCardDownloadByFanId(fanId)
        : order
          ? await getCardDownloadByOrder(order)
          : null;

    if (!result) {
      res.status(404).json({ success: false, message: 'Carte introuvable ou accès non autorisé.' });
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
