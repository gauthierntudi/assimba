export function assertSmsTestRequest(req, res): boolean {
  const enabled = String(process.env.SMS_TEST_ENABLED ?? '').trim().toLowerCase();
  const isEnabled = ['true', '1', 'yes', 'on'].includes(enabled);

  if (!isEnabled) {
    res.status(404).json({ success: false, message: 'Page de test SMS désactivée.' });
    return false;
  }

  const expectedPageKey = String(process.env.SMS_TEST_PAGE_KEY ?? '').trim();
  if (expectedPageKey) {
    const headerKey = String(req.headers['x-sms-test-page-key'] ?? '').trim();
    const bodyKey =
      typeof req.body?.pageKey === 'string'
        ? req.body.pageKey.trim()
        : String(req.query?.pageKey ?? '').trim();
    const provided = headerKey || bodyKey;

    if (provided !== expectedPageKey) {
      res.status(401).json({ success: false, message: 'Clé d’accès page de test invalide.' });
      return false;
    }
  }

  return true;
}
