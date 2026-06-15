import { useEffect } from 'react';
import { PaymentResultView } from '../components/payment/PaymentResultView';
import type { PaymentResultData } from '../types/paymentResult';
import '../styles/payment-result-desktop.css';

type PaymentResultDesktopProps = {
  result: PaymentResultData;
  onRetry?: () => void;
  onDownloadCard?: () => void;
};

export function PaymentResultDesktop({ result, onRetry, onDownloadCard }: PaymentResultDesktopProps) {
  useEffect(() => {
    document.body.classList.add('payment-result-desktop-active');
    return () => document.body.classList.remove('payment-result-desktop-active');
  }, []);

  return (
    <div className="payment-result-desktop-screen">
      <aside className="payment-result-desktop-aside" aria-hidden="true">
        <div className="payment-result-desktop-aside__photo" />
        <div className="payment-result-desktop-aside__veil" />
      </aside>

      <main className="payment-result-desktop-main">
        <div className="payment-result-desktop-card">
          <PaymentResultView result={result} onRetry={onRetry} onDownloadCard={onDownloadCard} />
        </div>
      </main>
    </div>
  );
}
