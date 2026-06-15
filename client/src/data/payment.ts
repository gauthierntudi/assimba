export const MEMBER_PRICES_CDF = {
  simple: 2500,
  premium: 12500,
} as const;

export const USD_RATE_FALLBACK = 2500;

export const MEMBER_TYPE_OPTIONS = [
  { value: 'simple', label: 'Membre Simple' },
  { value: 'premium', label: 'Membre Premium' },
] as const;

export const CURRENCY_OPTIONS = [
  { value: 'CDF', label: 'Francs Congolais (CDF)' },
  { value: 'USD', label: 'Dollars Américains (USD)' },
] as const;

export const PAYMENT_TYPE_OPTIONS = [
  { value: '1', label: 'Mobile Money' },
  { value: '2', label: 'Carte Bancaire' },
] as const;

export function formatMemberOptionLabel(
  memberType: keyof typeof MEMBER_PRICES_CDF,
  currency: 'CDF' | 'USD',
): string {
  const base = MEMBER_TYPE_OPTIONS.find((o) => o.value === memberType)?.label ?? '';
  const amount = formatPriceAmount(memberType, currency);
  return `${base} (${amount})`;
}

export function formatPriceAmount(
  memberType: keyof typeof MEMBER_PRICES_CDF,
  currency: 'CDF' | 'USD',
): string {
  const cdf = MEMBER_PRICES_CDF[memberType];

  if (currency === 'CDF') {
    return `${new Intl.NumberFormat('fr-FR').format(cdf)} FC`;
  }

  const usd = cdf / USD_RATE_FALLBACK;
  return `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(usd)} USD`;
}

export function formatDisplayPrice(
  memberType: keyof typeof MEMBER_PRICES_CDF,
  currency: 'CDF' | 'USD',
): string {
  const cdf = MEMBER_PRICES_CDF[memberType];

  if (currency === 'CDF') {
    return `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cdf)} CDF`;
  }

  const usd = cdf / USD_RATE_FALLBACK;
  return `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(usd)} USD`;
}
