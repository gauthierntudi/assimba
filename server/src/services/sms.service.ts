import { env } from '../config/env.js';
import { toFlexpayPhone } from '../utils/phone.js';

export type SmsProvider = 'TWILIO' | 'UNIKRON';

export function resolveSmsProvider(): SmsProvider {
  return env.sms.distribution === 'UNIKRON' ? 'UNIKRON' : 'TWILIO';
}

function toTwilioE164(phone: string): string {
  const digits = toFlexpayPhone(phone);
  return digits ? `+${digits}` : phone.trim();
}

function normalizeUnikronNumbers(numbers: string): string {
  const parts = numbers.split(',').map((part) => part.trim());
  const out: string[] = [];

  for (const part of parts) {
    if (!part) continue;
    let digits = part.replace(/\D+/g, '');
    if (digits.startsWith('00')) {
      digits = digits.slice(2);
    }
    if (digits) out.push(digits);
  }

  return out.join(',');
}

async function sendTwilioSMS(phone: string, message: string): Promise<boolean> {
  const { twilioSid, twilioToken, twilioFrom } = env.sms;
  if (!twilioSid || !twilioToken || !twilioFrom || twilioFrom === '+1234567890') {
    console.error(`[sms:twilio] Credentials missing. Cannot send SMS to ${phone}.`);
    return false;
  }

  const to = toTwilioE164(phone);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
  const body = new URLSearchParams({
    From: twilioFrom,
    To: to,
    Body: message,
  });

  const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    console.error(
      `[sms:twilio] Failed (${response.status}) to ${to}: ${await response.text()}`,
    );
    return false;
  }

  return true;
}

async function sendUnikronSMS(phone: string, message: string): Promise<boolean> {
  const appKey = env.sms.unikronAppKey.trim();
  let sender = env.sms.unikronSender.trim() || 'UNIKRON';

  if (!appKey) {
    console.error(`[sms:unikron] AppKey missing. Cannot send SMS to ${phone}.`);
    return false;
  }

  if (sender.length > 11) {
    sender = sender.slice(0, 11);
  }

  const normalizedNumber = normalizeUnikronNumbers(phone);
  if (!normalizedNumber) {
    console.error(`[sms:unikron] Number invalid. Cannot send SMS to ${phone}.`);
    return false;
  }

  const response = await fetch('https://unikron.site/api/v2/sms/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${appKey}`,
    },
    body: JSON.stringify({
      number: normalizedNumber,
      text: message,
      sender,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    console.error(
      `[sms:unikron] Failed (${response.status}) to ${normalizedNumber}: ${await response.text()}`,
    );
    return false;
  }

  const decoded = (await response.json()) as {
    status?: string;
    message?: string;
    results?: Array<{ status?: string; error?: unknown }>;
  };

  if (decoded.status && decoded.status !== 'processed') {
    console.error(`[sms:unikron] Unexpected response: ${decoded.message ?? 'Unknown response'}`);
    return false;
  }

  const first = decoded.results?.[0];
  if (!first) return true;

  if (first.error) {
    console.error(`[sms:unikron] Error for ${phone}: ${JSON.stringify(first.error)}`);
    return false;
  }

  return !first.status || first.status.toUpperCase() === 'SUBMITTED';
}

export async function sendMemberSMS(
  phone: string,
  memberNumber: string,
  name: string,
  cardDownloadUrl?: string,
): Promise<boolean> {
  const message = cardDownloadUrl
    ? `Félicitations ${name} ! Votre inscription est validée. FAN ID (Numéro membre) : ${memberNumber}. Téléchargez votre carte : ${cardDownloadUrl}`
    : `Félicitations ${name} ! Votre inscription est validée. FAN ID (Numéro membre) : ${memberNumber}. Merci de votre soutien !`;

  const provider = resolveSmsProvider();
  console.log(`[sms] provider=${provider} to=${toFlexpayPhone(phone) || phone}`);

  if (provider === 'UNIKRON') {
    return sendUnikronSMS(phone, message);
  }

  return sendTwilioSMS(phone, message);
}
