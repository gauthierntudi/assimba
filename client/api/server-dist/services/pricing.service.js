const MEMBER_PRICES_CDF = {
    simple: 2500,
    premium: 12500,
};
async function fetchUsdRateFromCdf() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/CDF', {
            signal: AbortSignal.timeout(3000),
        });
        if (!response.ok)
            return null;
        const data = (await response.json());
        return typeof data.rates?.USD === 'number' ? data.rates.USD : null;
    }
    catch {
        return null;
    }
}
export async function calculatePricing(memberType, currencyChoice) {
    const type = memberType === 'premium' ? 'premium' : 'simple';
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
