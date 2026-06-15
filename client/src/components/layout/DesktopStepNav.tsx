import { REGISTRATION_STEP_LABELS } from '../../config/registrationFlow';

const TOTAL_STEPS = 6;

type DesktopStepNavProps = {
  currentStep: number;
};

export function DesktopStepNav({ currentStep }: DesktopStepNavProps) {
  return (
    <ol className="reg-desktop__steps" aria-label={`Étape ${currentStep} sur ${TOTAL_STEPS}`}>
      {Array.from({ length: TOTAL_STEPS }, (_, index) => {
        const step = index + 1;
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
