import { useEffect } from 'react';
import { PaymentResultView } from '../components/payment/PaymentResultView';
import type { PaymentResultData } from '../types/paymentResult';
import '../styles/payment-result.css';

type PaymentResultMobileProps = {
  result: PaymentResultData;
  onRetry?: () => void;
  onDownloadCard?: () => void;
};

export function PaymentResultMobile({ result, onRetry, onDownloadCard }: PaymentResultMobileProps) {
  useEffect(() => {
    document.body.classList.add('payment-result-active');
    return () => document.body.classList.remove('payment-result-active');
  }, []);

  return (
    <div className="payment-result-screen">
      <div className="payment-result-frame">
        <div className="payment-result-bg" aria-hidden="true">
          <div className="payment-result-bg__red" />
          <div className="payment-result-bg__photo" />
          <div className="payment-result-bg__orb payment-result-bg__orb--top" />
          <div className="payment-result-bg__orb payment-result-bg__orb--bottom" />
          <div className="payment-result-bg__stripes">
            {[
              { left: 26, top: -40, opacity: 0.08 },
              { left: 82, top: 30, opacity: 0.1 },
              { left: 138, top: -40, opacity: 0.12 },
              { left: 194, top: 30, opacity: 0.08 },
              { left: 250, top: -40, opacity: 0.1 },
              { left: 306, top: 30, opacity: 0.12 },
              { left: 362, top: -40, opacity: 0.08 },
            ].map((stripe) => (
              <span
                key={`${stripe.left}-${stripe.top}`}
                className="payment-result-bg__stripe"
                style={{
                  left: `${stripe.left}px`,
                  top: `${stripe.top}px`,
                  opacity: stripe.opacity,
                }}
              />
            ))}
          </div>
          <div className="payment-result-bg__veil" />
        </div>

        <div className="payment-result-content">
          <PaymentResultView result={result} onRetry={onRetry} onDownloadCard={onDownloadCard} />
        </div>
      </div>
    </div>
  );
}
