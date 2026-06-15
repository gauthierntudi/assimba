import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const monorepoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);

dotenv.config({ path: path.join(monorepoRoot, '.env') });

function normalizeFlexpayToken(value: string | undefined): string {
  const raw = (value ?? '').trim().replace(/^['"]|['"]$/g, '');
  if (!raw) return '';
  return raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  appUrl: (process.env.APP_URL ?? 'http://localhost:4000').replace(/\/$/, ''),
  webUrl: (process.env.WEB_URL ?? 'http://localhost:5173').replace(/\/$/, ''),
  databaseUrl: process.env.DATABASE_URL,
  flexpay: {
    merchant: process.env.FLEXPAY_MERCHANT ?? process.env.marchand ?? 'ISSIFORUM',
    token: normalizeFlexpayToken(process.env.FLEXPAY_TOKEN ?? process.env.token),
    mobileApiUrl:
      process.env.FLEXPAY_MOBILE_API_URL ??
      'https://backend.flexpay.cd/api/rest/v1/paymentService',
    cardApiUrl:
      process.env.FLEXPAY_CARD_API_URL ?? 'https://cardpayment.flexpay.cd/v1/pay',
    checkApiUrl:
      process.env.FLEXPAY_CHECK_API_URL ?? 'https://backend.flexpay.cd/api/rest/v1/check',
  },
  sms: {
    distribution: (process.env.SMS_DISTRIBUTION ?? 'TWILIO').toUpperCase(),
    twilioSid: process.env.TWILIO_SID ?? '',
    twilioToken: process.env.TWILIO_TOKEN ?? '',
    twilioFrom: process.env.TWILIO_FROM ?? '',
    unikronAppKey: process.env.UNIKRON_APP_KEY ?? process.env.TOKEN_UNIKRON_SMS ?? '',
    unikronSender: process.env.UNIKRON_SENDER ?? 'UNIKRON',
  },
} as const;

export const flexpayCallbackUrl = `${env.appUrl}/api/webhooks/flexpay`;
