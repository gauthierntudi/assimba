const TOTAL_STEPS = 6;

type MobileStepDotsProps = {
  currentStep: number;
};

export function MobileStepDots({ currentStep }: MobileStepDotsProps) {
  return (
    <div className="reg-mobile__dots" aria-label={`Étape ${currentStep} sur ${TOTAL_STEPS}`}>
      {Array.from({ length: TOTAL_STEPS }, (_, index) => {
        const step = index + 1;
        const className = [
          'reg-mobile__dot',
          step === currentStep ? 'reg-mobile__dot--active' : '',
          step < currentStep ? 'reg-mobile__dot--done' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return <span key={step} className={className} />;
      })}
    </div>
  );
}
