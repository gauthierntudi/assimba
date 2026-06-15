import '../_lib/setup.js';
import {
  parseBodyToSupporter,
  upsertSupporter,
} from '../../server/dist/services/supporter.service.js';
import { bodyRecord, methodNotAllowed, type ApiRequest, type ApiResponse } from '../_lib/http.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
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
}
