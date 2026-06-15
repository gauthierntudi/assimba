import '../_lib/setup.js';
import { checkPaymentStatus } from '../../server/dist/services/flexpay.service.js';
import { methodNotAllowed, queryString, type ApiRequest, type ApiResponse } from '../_lib/http.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res);
    return;
  }

  const order = queryString(req.query, 'order');

  if (!order) {
    res.status(400).json({ success: false, message: 'Order number missing' });
    return;
  }

  const result = await checkPaymentStatus(order);
  res.status(200).json(result);
}
