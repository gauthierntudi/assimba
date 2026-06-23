import { getMemberPriceUsd } from '../config/app-settings.js';

const CDF_PER_USD_FALLBACK = 2500;

export type MemberType = 'simple' | 'premium';
export type CurrencyChoice = 'CDF' | 'USD';

export type PricingResult = {
  amount: number;
  currency: CurrencyChoice;
  amountUsdEquivalent: number;
  baseAmountCdf: number;
};

async function fetchUsdRateFromCdf(): Promise<number | null> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/CDF', {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { rates?: { USD?: number } };
    return typeof data.rates?.USD === 'number' ? data.rates.USD : null;
  } catch {
    return null;
  }
}

export async function calculatePricing(
  memberType: string,
  currencyChoice: string,
): Promise<PricingResult> {
  const type: MemberType = memberType === 'premium' ? 'premium' : 'simple';
  const baseAmountUsd = getMemberPriceUsd(type);
  const usdRate = (await fetchUsdRateFromCdf()) ?? 1 / CDF_PER_USD_FALLBACK;
  const baseAmountCdf = Math.round(baseAmountUsd / usdRate);

  if (currencyChoice === 'USD') {
    return {
      amount: baseAmountUsd,
      currency: 'USD',
      amountUsdEquivalent: baseAmountUsd,
      baseAmountCdf,
    };
  }

  return {
    amount: baseAmountCdf,
    currency: 'CDF',
    amountUsdEquivalent: baseAmountUsd,
    baseAmountCdf,
  };
}
