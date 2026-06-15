type RegistrationLoadingOverlayProps = {
  loading: { title: string; description: string };
  onCancelPayment: () => void;
  onDismiss: () => void;
};

export function RegistrationLoadingOverlay({
  loading,
  onCancelPayment,
  onDismiss,
}: RegistrationLoadingOverlayProps) {
  const isPaymentPolling = loading.title === 'Validation en attente...';

  return (
    <div className="reg-mobile__overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="reg-mobile__overlay-card">
        <div className="reg-mobile__overlay-spinner" aria-hidden="true" />
        <h2>{loading.title}</h2>
        <p>{loading.description}</p>
        {isPaymentPolling ? (
          <button type="button" className="reg-mobile__overlay-cancel" onClick={onCancelPayment}>
            Annuler
          </button>
        ) : (
          <button type="button" className="reg-mobile__overlay-cancel" onClick={onDismiss}>
            Fermer
          </button>
        )}
      </div>
    </div>
  );
}
