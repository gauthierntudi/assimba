import { env } from '../config/env.js';

const ORANGE_TOKEN_URL = 'https://api.orange.com/oauth/v3/token';
const ORANGE_API_BASE = 'https://api.orange.com';

type OrangeTokenCache = {
  value: string;
  expiresAt: number;
};

let tokenCache: OrangeTokenCache | null = null;

function getOrangeBasicAuth(): string {
  if (env.orangeSms.basicAuth) {
    return env.orangeSms.basicAuth;
  }

  if (env.orangeSms.clientId && env.orangeSms.clientSecret) {
    const encoded = Buffer.from(
      `${env.orangeSms.clientId}:${env.orangeSms.clientSecret}`,
    ).toString('base64');
    return `Basic ${encoded}`;
  }

  throw new Error(
    'SMS_TEST_KEY (Basic …) ou ORANGE_SMS_CLIENT_ID + ORANGE_SMS_CLIENT_SECRET requis.',
  );
}

function assertOrangeConfigured(): void {
  getOrangeBasicAuth();
  if (!env.orangeSms.senderAddress) {
    throw new Error('ORANGE_SMS_SENDER_ADDRESS est requis.');
  }
}

export function toOrangeTelAddress(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (!digits) {
    throw new Error('Numéro de téléphone invalide.');
  }

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0')) {
    digits = `243${digits.slice(1)}`;
  }

  if (!digits.startsWith('243')) {
    digits = `243${digits}`;
  }

  return `tel:+${digits}`;
}

/** Sender contractuel Orange — ne pas réécrire comme un mobile (ex. 2430000 pour COD). */
export function toOrangeSenderAddress(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('tel:')) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    throw new Error('Sender address invalide.');
  }

  return `tel:+${digits}`;
}

const DRC_MOBILE_PREFIXES = ['81', '82', '84', '85', '89', '90', '91', '97', '98', '99'];

export function validateDrcRecipient(phone: string): string[] {
  const warnings: string[] = [];
  const digits = phone.replace(/\D/g, '').replace(/^00/, '');
  let normalized = digits;

  if (normalized.startsWith('0')) {
    normalized = `243${normalized.slice(1)}`;
  } else if (!normalized.startsWith('243')) {
    normalized = `243${normalized}`;
  }

  const national = normalized.startsWith('243') ? normalized.slice(3) : normalized;

  if (national.length !== 9) {
    warnings.push(
      `Le numéro RDC doit avoir 9 chiffres après 243 (ex. 0812345678 → tel:+243812345678). Reçu : tel:+${normalized}.`,
    );
  } else if (!DRC_MOBILE_PREFIXES.some((prefix) => national.startsWith(prefix))) {
    warnings.push(
      `Préfixe inhabituel pour la RDC (${national.slice(0, 2)}…). Vérifiez que c’est un mobile actif.`,
    );
  }

  return warnings;
}

function extractResourceId(response: unknown): string | null {
  const resourceUrl = (
    response as {
      outboundSMSMessageRequest?: { resourceURL?: string };
    }
  )?.outboundSMSMessageRequest?.resourceURL;

  if (!resourceUrl) {
    return null;
  }

  const parts = resourceUrl.split('/');
  return parts[parts.length - 1] ?? null;
}

function encodeSenderPath(senderAddress: string): string {
  return encodeURIComponent(senderAddress);
}

export async function getOrangeAccessToken(): Promise<{
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}> {
  assertOrangeConfigured();

  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return {
      accessToken: tokenCache.value,
      expiresIn: Math.floor((tokenCache.expiresAt - Date.now()) / 1000),
      tokenType: 'Bearer',
    };
  }

  const response = await fetch(ORANGE_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: getOrangeBasicAuth(),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(15_000),
  });

  const payload = (await response.json().catch(() => null)) as
    | { access_token?: string; expires_in?: number; token_type?: string; error?: string }
    | null;

  if (!response.ok || !payload?.access_token) {
    throw new Error(
      payload?.error ??
        `Échec OAuth Orange (${response.status}): ${JSON.stringify(payload ?? {})}`,
    );
  }

  const expiresIn = Number(payload.expires_in ?? 3600);
  tokenCache = {
    value: payload.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return {
    accessToken: payload.access_token,
    expiresIn,
    tokenType: payload.token_type ?? 'Bearer',
  };
}

export async function sendOrangeSms(input: {
  to: string;
  message: string;
  senderName?: string;
}) {
  const token = await getOrangeAccessToken();
  const senderAddress = toOrangeSenderAddress(env.orangeSms.senderAddress);
  const recipientAddress = toOrangeTelAddress(input.to);
  const senderName = input.senderName?.trim() || undefined;
  const recipientWarnings = validateDrcRecipient(input.to);

  const body = {
    outboundSMSMessageRequest: {
      address: recipientAddress,
      senderAddress,
      ...(senderName ? { senderName } : {}),
      outboundSMSTextMessage: {
        message: input.message.slice(0, 160),
      },
    },
  };

  const response = await fetch(
    `${ORANGE_API_BASE}/smsmessaging/v1/outbound/${encodeSenderPath(senderAddress)}/requests`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    },
  );

  const payload = await response.json().catch(() => null);
  const resourceId = extractResourceId(payload);
  const accepted = response.status === 201;

  return {
    ok: accepted,
    status: response.status,
    request: body,
    response: payload,
    resourceId,
    recipientWarnings,
    deliveryNote:
      accepted
        ? '201 = accepté par Orange, pas encore livré. Consultez les DR ou le statut de livraison.'
        : undefined,
  };
}

export async function getOrangeDeliveryInfo(resourceId: string) {
  const token = await getOrangeAccessToken();
  const senderAddress = toOrangeSenderAddress(env.orangeSms.senderAddress);

  const response = await fetch(
    `${ORANGE_API_BASE}/smsmessaging/v1/outbound/${encodeSenderPath(senderAddress)}/requests/${encodeURIComponent(resourceId)}/deliveryInfos`,
    {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
    },
  );

  const payload = await response.json().catch(() => null);

  return {
    ok: response.ok,
    status: response.status,
    response: payload,
  };
}

export async function subscribeOrangeDeliveryReceipt(notifyUrl: string) {
  const token = await getOrangeAccessToken();
  const senderAddress = toOrangeSenderAddress(env.orangeSms.senderAddress);

  const body = {
    deliveryReceiptSubscription: {
      callbackReference: {
        notifyURL: notifyUrl,
      },
    },
  };

  const response = await fetch(
    `${ORANGE_API_BASE}/smsmessaging/v1/outbound/${encodeSenderPath(senderAddress)}/subscriptions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    },
  );

  const payload = await response.json().catch(() => null);

  return {
    ok: response.ok,
    status: response.status,
    request: body,
    response: payload,
  };
}

export async function listOrangeContracts(country = 'COD') {
  const token = await getOrangeAccessToken();

  const response = await fetch(
    `${ORANGE_API_BASE}/sms/admin/v1/contracts?country=${encodeURIComponent(country)}`,
    {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
    },
  );

  const payload = await response.json().catch(() => null);

  return {
    ok: response.ok,
    status: response.status,
    response: payload,
  };
}

export async function listOrangeStatistics(country = 'COD') {
  const token = await getOrangeAccessToken();

  const response = await fetch(
    `${ORANGE_API_BASE}/sms/admin/v1/statistics?country=${encodeURIComponent(country)}`,
    {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
    },
  );

  const payload = await response.json().catch(() => null);

  return {
    ok: response.ok,
    status: response.status,
    response: payload,
  };
}

export function getOrangeSmsPublicConfig() {
  const senderAddress = env.orangeSms.senderAddress
    ? toOrangeSenderAddress(env.orangeSms.senderAddress)
    : null;

  return {
    enabled: env.smsTest.enabled,
    requiresPageKey: Boolean(env.smsTest.pageKey),
    senderAddress,
    senderName: env.orangeSms.senderName || null,
    hasCredentials: Boolean(
      env.orangeSms.basicAuth ||
        (env.orangeSms.clientId && env.orangeSms.clientSecret),
    ),
    defaultNotifyUrl: `${env.appUrl}/api/webhooks/orange-sms-dr`,
    recommendedSenderForCod: 'tel:+2430000',
    deliveryReceiptNote:
      'HTTP 201 = message accepté. La livraison réelle arrive via DR (webhook HTTPS public).',
  };
}
