import { getVisibleRegistrationSteps } from '../../config/registrationFlow';

type MobileStepDotsProps = {
  currentStep: number;
};

export function MobileStepDots({ currentStep }: MobileStepDotsProps) {
  const visibleSteps = getVisibleRegistrationSteps();
  const activeIndex = visibleSteps.indexOf(currentStep);

  return (
    <div
      className="reg-mobile__dots"
      aria-label={`Étape ${Math.max(activeIndex + 1, 1)} sur ${visibleSteps.length}`}
    >
      {visibleSteps.map((step) => {
        const className = [
          'reg-mobile__dot',
          step === currentStep ? 'reg-mobile__dot--active' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return <span key={step} className={className} />;
      })}
    </div>
  );
}
