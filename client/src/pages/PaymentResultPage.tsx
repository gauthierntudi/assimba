import { DESKTOP_MEDIA_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import type { PaymentResultData } from '../types/paymentResult';
import { PaymentResultDesktop } from './PaymentResultDesktop';
import { PaymentResultMobile } from './PaymentResultMobile';

type PaymentResultPageProps = {
  result: PaymentResultData;
  onRetry?: () => void;
  onDownloadCard?: () => void;
};

export function PaymentResultPage({ result, onRetry, onDownloadCard }: PaymentResultPageProps) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);

  if (isDesktop) {
    return (
      <PaymentResultDesktop
        result={result}
        onRetry={onRetry}
        onDownloadCard={onDownloadCard}
      />
    );
  }

  return (
    <PaymentResultMobile result={result} onRetry={onRetry} onDownloadCard={onDownloadCard} />
  );
}
