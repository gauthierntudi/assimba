const MEMBER_PRICES_CDF = {
  simple: 2500,
  premium: 12500,
} as const;

export type MemberType = keyof typeof MEMBER_PRICES_CDF;
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
  const baseAmountCdf = MEMBER_PRICES_CDF[type];
  const usdRate = (await fetchUsdRateFromCdf()) ?? 1 / 2500;

  if (currencyChoice === 'USD') {
    return {
      amount: Math.round(baseAmountCdf * usdRate * 100) / 100,
      currency: 'USD',
      amountUsdEquivalent: Math.round(baseAmountCdf * usdRate * 100) / 100,
      baseAmountCdf,
    };
  }

  return {
    amount: baseAmountCdf,
    currency: 'CDF',
    amountUsdEquivalent: Math.round(baseAmountCdf * usdRate * 100) / 100,
    baseAmountCdf,
  };
}
