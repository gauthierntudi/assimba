import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`API ready on http://localhost:${env.port}`);
  if (!env.flexpay.token) {
    console.warn('FLEXPAY_TOKEN manquant — les paiements FlexPay échoueront.');
  }
});
