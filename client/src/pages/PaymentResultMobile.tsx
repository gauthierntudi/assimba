import { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import type { PaymentResultData } from '../types/paymentResult';
import '../styles/payment-result.css';

type PaymentResultMobileProps = {
  result: PaymentResultData;
  onRetry?: () => void;
  onDownloadCard?: () => void;
};

const SUCCESS_MESSAGE = (
  <>
    Votre inscription a été effectuée avec succès.
    <br />
    Bienvenue dans la famille
    <br />
    AS Simba Kamikazes !
  </>
);

const DEFAULT_FAILURE_MESSAGE = (
  <>
    La transaction a été refusée, annulée
    <br />
    ou votre solde est insuffisant.
  </>
);

export function PaymentResultMobile({ result, onRetry, onDownloadCard }: PaymentResultMobileProps) {
  const isSuccess = result.status === 'success';

  useEffect(() => {
    document.body.classList.add('payment-result-active');
    return () => document.body.classList.remove('payment-result-active');
  }, []);

  const handleDownloadCard = () => {
    if (result.cardDownloadUrl) {
      window.open(result.cardDownloadUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    onDownloadCard?.();
  };

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
          <main className="payment-result-main">
            <div
              className={`payment-result-icon${isSuccess ? '' : ' payment-result-icon--failed'}`}
              aria-hidden="true"
            >
              {isSuccess ? (
                <Check className="payment-result-icon__glyph" strokeWidth={3} />
              ) : (
                <X className="payment-result-icon__glyph" strokeWidth={3} />
              )}
            </div>

            <h1 className="payment-result-title">
              {isSuccess ? 'BIENVENUE!' : 'ÉCHEC'}
            </h1>

            <p className="payment-result-message">
              {isSuccess
                ? SUCCESS_MESSAGE
                : result.message ?? DEFAULT_FAILURE_MESSAGE}
            </p>

            {isSuccess && result.orderNumber && (
              <p className="payment-result-reference">
                Référence : <strong>{result.orderNumber}</strong>
              </p>
            )}
          </main>

          <div className="payment-result-actions">
            {isSuccess ? (
              <button
                type="button"
                className="payment-result-btn"
                onClick={handleDownloadCard}
              >
                Télécharger ma carte
              </button>
            ) : (
              <button type="button" className="payment-result-btn" onClick={onRetry}>
                Réessayer
              </button>
            )}
          </div>

          <footer className="payment-result-footer">
            <a href="#" className="payment-result-footer__link">
              Conditions d&apos;utilisation
            </a>
            <span className="payment-result-footer__credit">Powered by Aksys Digital</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
