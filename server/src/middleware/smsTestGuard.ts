import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

export function smsTestGuard(req: Request, res: Response, next: NextFunction): void {
  if (!env.smsTest.enabled) {
    res.status(404).json({ success: false, message: 'Page de test SMS désactivée.' });
    return;
  }

  if (env.smsTest.pageKey) {
    const headerKey = String(req.headers['x-sms-test-page-key'] ?? '').trim();
    const bodyKey =
      typeof req.body?.pageKey === 'string'
        ? req.body.pageKey.trim()
        : String(req.query.pageKey ?? '').trim();
    const provided = headerKey || bodyKey;

    if (provided !== env.smsTest.pageKey) {
      res.status(401).json({ success: false, message: 'Clé d’accès page de test invalide.' });
      return;
    }
  }

  next();
}
