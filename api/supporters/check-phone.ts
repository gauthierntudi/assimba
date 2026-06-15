import '../_lib/setup.js';
import { checkPhone } from '../_dist/services/supporter.service.js';
import { bodyRecord, methodNotAllowed, type ApiRequest, type ApiResponse } from '../_lib/http.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  const phone = String(bodyRecord(req).phone ?? '').trim();

  if (!phone) {
    res.status(400).json({ success: false, message: 'Numéro de téléphone manquant' });
    return;
  }

  const result = await checkPhone(phone);
  res.status(200).json(result);
}
