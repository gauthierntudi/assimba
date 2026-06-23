import {
  REGISTRATION_STEP_LABELS,
  getVisibleRegistrationSteps,
} from '../../config/registrationFlow';

type DesktopStepNavProps = {
  currentStep: number;
};

export function DesktopStepNav({ currentStep }: DesktopStepNavProps) {
  const visibleSteps = getVisibleRegistrationSteps();
  const activeIndex = visibleSteps.indexOf(currentStep);

  return (
    <ol
      className="reg-desktop__steps"
      aria-label={`Étape ${Math.max(activeIndex + 1, 1)} sur ${visibleSteps.length}`}
    >
      {visibleSteps.map((step) => {
        const isActive = step === currentStep;
        const isDone = step < currentStep;

        return (
          <li
            key={step}
            className={[
              'reg-desktop__step',
              isActive ? 'reg-desktop__step--active' : '',
              isDone ? 'reg-desktop__step--done' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-current={isActive ? 'step' : undefined}
          >
            <span className="reg-desktop__step-index">{step}</span>
            <span className="reg-desktop__step-label">{REGISTRATION_STEP_LABELS[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}
