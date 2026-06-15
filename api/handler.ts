import './_lib/setup.js';
import { checkPaymentStatus, handleFlexpayCallback, initiatePayment } from './_dist/services/flexpay.service.js';
import {
  checkPhone,
  parseBodyToSupporter,
  upsertSupporter,
} from './_dist/services/supporter.service.js';
import { bodyRecord, methodNotAllowed, queryString, type ApiRequest, type ApiResponse } from './_lib/http.js';

function pathname(req: ApiRequest): string {
  const raw = req.url ?? '/api';
  if (raw.startsWith('/')) return raw.split('?')[0] ?? raw;
  return new URL(raw, 'http://localhost').pathname;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const path = pathname(req);

  try {
    if (path === '/api/health') {
      res.status(200).json({ ok: true, service: 'simba-api' });
      return;
    }

    if (path === '/api/supporters/check-phone') {
      if (req.method !== 'POST') {
        methodNotAllowed(res);
        return;
      }

      const phone = String(bodyRecord(req).phone ?? '').trim();
      if (!phone) {
        res.status(400).json({ success: false, message: 'Numéro de téléphone manquant' });
        return;
      }

      res.status(200).json(await checkPhone(phone));
      return;
    }

    if (path === '/api/supporters/draft') {
      if (req.method !== 'POST') {
        methodNotAllowed(res);
        return;
      }

      const input = parseBodyToSupporter(bodyRecord(req));
      if (!input.phone) {
        res.status(400).json({
          success: false,
          message: 'Numéro de téléphone manquant pour la sauvegarde.',
        });
        return;
      }

      await upsertSupporter(input);
      res.status(200).json({ success: true });
      return;
    }

    if (path === '/api/payments') {
      if (req.method !== 'POST') {
        methodNotAllowed(res);
        return;
      }

      res.status(200).json(await initiatePayment(bodyRecord(req)));
      return;
    }

    if (path === '/api/payments/status') {
      if (req.method !== 'GET') {
        methodNotAllowed(res);
        return;
      }

      const order = queryString(req.query, 'order');
      if (!order) {
        res.status(400).json({ success: false, message: 'Order number missing' });
        return;
      }

      res.status(200).json(await checkPaymentStatus(order));
      return;
    }

    if (path === '/api/webhooks/flexpay') {
      if (req.method !== 'POST') {
        methodNotAllowed(res);
        return;
      }

      res.status(200).json(await handleFlexpayCallback(bodyRecord(req)));
      return;
    }

    res.status(404).json({ success: false, message: 'Route not found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
