export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { parseBodyToSupporter, upsertSupporter } = await import(
      '../_dist/services/supporter.service.js'
    );
    const body = (req.body ?? {}) as Record<string, unknown>;
    const input = parseBodyToSupporter(body);

    if (!input.phone) {
      res.status(400).json({
        success: false,
        message: 'Numéro de téléphone manquant pour la sauvegarde.',
      });
      return;
    }

    await upsertSupporter(input);
    res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
