const STEP_LABELS = ['Identité', 'Vérification', 'Récapitulatif', 'Membre', 'Profil'];
const STEP_LABELS_SHORT = ['Identité', 'Vérif.', 'Récap.', 'Membre', 'Profil'];

type ProgressStepperProps = {
  currentStep: number;
};

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const progress = (currentStep / STEP_LABELS.length) * 100;

  return (
    <div className="progress-wrap">
      <div className="progress-labels">
        {STEP_LABELS.map((label, index) => {
          const step = index + 1;
          const className = [
            step === currentStep ? 'active' : '',
            step < currentStep ? 'done' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <span key={label} className={className || undefined}>
              <span className="progress-label-long">{label}</span>
              <span className="progress-label-short">{STEP_LABELS_SHORT[index]}</span>
            </span>
          );
        })}
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="step-dots">
        {STEP_LABELS.map((_, index) => {
          const step = index + 1;
          const className = [
            'dot',
            step === currentStep ? 'active' : '',
            step < currentStep ? 'done' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={step} className={className}>
              {step}
            </div>
          );
        })}
      </div>
    </div>
  );
}
