import '../_lib/setup.js';
import { initiatePayment } from '../_dist/services/flexpay.service.js';
import { bodyRecord, methodNotAllowed, type ApiRequest, type ApiResponse } from '../_lib/http.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  const result = await initiatePayment(bodyRecord(req));
  res.status(200).json(result);
}
