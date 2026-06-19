import { env } from '../config/env.js';

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
    console.error(`Twilio credentials missing. Cannot send SMS to ${phone}.`);
    return false;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
  const body = new URLSearchParams({
    From: twilioFrom,
    To: phone,
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
    console.error(`Twilio SMS failed with code ${response.status}: ${await response.text()}`);
    return false;
  }

  return true;
}

async function sendUnikronSMS(phone: string, message: string): Promise<boolean> {
  const appKey = env.sms.unikronAppKey.trim();
  let sender = env.sms.unikronSender.trim() || 'UNIKRON';

  if (!appKey) {
    console.error(`Unikron AppKey missing. Cannot send SMS to ${phone}.`);
    return false;
  }

  if (sender.length > 11) {
    sender = sender.slice(0, 11);
  }

  const normalizedNumber = normalizeUnikronNumbers(phone);
  if (!normalizedNumber) {
    console.error(`Unikron number invalid. Cannot send SMS to ${phone}.`);
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
    console.error(`Unikron SMS failed with code ${response.status}: ${await response.text()}`);
    return false;
  }

  const decoded = (await response.json()) as {
    status?: string;
    message?: string;
    results?: Array<{ status?: string; error?: unknown }>;
  };

  if (decoded.status && decoded.status !== 'processed') {
    console.error(`Unikron SMS unexpected response: ${decoded.message ?? 'Unknown response'}`);
    return false;
  }

  const first = decoded.results?.[0];
  if (!first) return true;

  if (first.error) {
    console.error(`Unikron SMS error for ${phone}: ${JSON.stringify(first.error)}`);
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

  if (env.sms.distribution === 'UNIKRON') {
    return sendUnikronSMS(phone, message);
  }

  return sendTwilioSMS(phone, message);
}
