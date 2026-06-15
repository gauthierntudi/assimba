import { STEP_HEADERS } from '../../config/registrationFlow';

type RegistrationStepHeaderProps = {
  currentStep: number;
  titleClassName?: string;
  subtitleClassName?: string;
};

export function RegistrationStepHeader({
  currentStep,
  titleClassName = 'reg-mobile__title',
  subtitleClassName = 'reg-mobile__subtitle',
}: RegistrationStepHeaderProps) {
  const header = STEP_HEADERS[currentStep];
  if (!header) {
    return null;
  }

  const subtitleClasses = [subtitleClassName, header.subtitleClass].filter(Boolean).join(' ');

  return (
    <>
      <h1 className={titleClassName}>
        {header.titleLines ? (
          <>
            {header.titleLines[0]}
            <br />
            {header.titleLines[1]}
          </>
        ) : (
          header.title
        )}
      </h1>
      <p className={subtitleClasses}>
        {header.subtitleLines ? (
          <>
            {header.subtitleLines[0]}
            <br />
            {header.subtitleLines[1]}
          </>
        ) : (
          header.subtitle
        )}
      </p>
    </>
  );
}
