import { getMemberPriceUsd } from '../config/appSettings';

export const CDF_PER_USD_FALLBACK = 2500;

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
  memberType: 'simple' | 'premium',
  currency: 'CDF' | 'USD',
): string {
  const base = MEMBER_TYPE_OPTIONS.find((o) => o.value === memberType)?.label ?? '';
  const amount = formatPriceAmount(memberType, currency);
  return `${base} (${amount})`;
}

export function formatPriceAmount(
  memberType: 'simple' | 'premium',
  currency: 'CDF' | 'USD',
): string {
  const usd = getMemberPriceUsd(memberType);

  if (currency === 'USD') {
    return `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(usd)} USD`;
  }

  const cdf = usd * CDF_PER_USD_FALLBACK;
  return `${new Intl.NumberFormat('fr-FR').format(cdf)} FC`;
}

export function formatDisplayPrice(
  memberType: 'simple' | 'premium',
  currency: 'CDF' | 'USD',
): string {
  const usd = getMemberPriceUsd(memberType);

  if (currency === 'USD') {
    return `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(usd)} USD`;
  }

  const cdf = usd * CDF_PER_USD_FALLBACK;
  return `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cdf)} CDF`;
}
