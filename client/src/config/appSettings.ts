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
  profilSocialEnabled: parseBooleanEnv(import.meta.env.PROFIL_SOCIAL, false),
  priceSimpleUsd: parsePriceEnv(import.meta.env.PRICE_SIMPLE, 1),
  pricePremiumUsd: parsePriceEnv(
    import.meta.env.PRICE_PREMIUM ?? import.meta.env.PRICE_PRIMIUM,
    2,
  ),
} as const;

export function getMemberPriceUsd(memberType: 'simple' | 'premium'): number {
  return memberType === 'premium' ? appSettings.pricePremiumUsd : appSettings.priceSimpleUsd;
}
