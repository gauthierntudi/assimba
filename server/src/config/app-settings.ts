function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === '') {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

function parsePriceEnv(value: string | undefined, defaultValue: number): number {
  if (value === undefined || value.trim() === '') {
    return defaultValue;
  }

  const parsed = Number.parseFloat(value.trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

export const appSettings = {
  profilSocialEnabled: parseBooleanEnv(process.env.PROFIL_SOCIAL, false),
  priceSimpleUsd: parsePriceEnv(process.env.PRICE_SIMPLE, 1),
  pricePremiumUsd: parsePriceEnv(
    process.env.PRICE_PREMIUM ?? process.env.PRICE_PRIMIUM,
    2,
  ),
} as const;

export function getMemberPriceUsd(memberType: string): number {
  return memberType === 'premium' ? appSettings.pricePremiumUsd : appSettings.priceSimpleUsd;
}
