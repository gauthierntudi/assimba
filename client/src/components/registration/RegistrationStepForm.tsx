import { StepContactMobile } from '../steps/StepContactMobile';
import { StepEngagementMobile } from '../steps/StepEngagementMobile';
import { StepIdentityMobile } from '../steps/StepIdentityMobile';
import { StepPaymentMobile } from '../steps/StepPaymentMobile';
import { StepSocialProfileMobile } from '../steps/StepSocialProfileMobile';
import { FORM_IDS } from '../../config/registrationFlow';
import type { RegistrationFlow } from '../../hooks/useRegistrationFlow';

type RegistrationStepFormProps = Pick<
  RegistrationFlow,
  | 'currentStep'
  | 'stepOne'
  | 'stepTwo'
  | 'stepThree'
  | 'stepFour'
  | 'stepFive'
  | 'handleNext'
  | 'handleIdentityNext'
  | 'handleRegister'
  | 'handleStepOneChange'
  | 'identityPhoneError'
  | 'setStepTwo'
  | 'setStepThree'
  | 'setStepFour'
  | 'setStepFive'
>;

export function RegistrationStepForm({
  currentStep,
  stepOne,
  stepTwo,
  stepThree,
  stepFour,
  stepFive,
  handleNext,
  handleIdentityNext,
  handleRegister,
  handleStepOneChange,
  identityPhoneError,
  setStepTwo,
  setStepThree,
  setStepFour,
  setStepFive,
}: RegistrationStepFormProps) {
  switch (currentStep) {
    case 3:
      return (
        <StepContactMobile
          formId={FORM_IDS[3]}
          form={stepTwo}
          onChange={(patch) => setStepTwo((prev) => ({ ...prev, ...patch }))}
          onNext={handleNext}
        />
      );
    case 4:
      return (
        <StepSocialProfileMobile
          formId={FORM_IDS[4]}
          form={stepThree}
          onChange={(patch) => setStepThree((prev) => ({ ...prev, ...patch }))}
          onNext={handleNext}
        />
      );
    case 5:
      return (
        <StepEngagementMobile
          formId={FORM_IDS[5]}
          form={stepFour}
          onChange={(patch) => setStepFour((prev) => ({ ...prev, ...patch }))}
          onNext={handleNext}
        />
      );
    case 6:
      return (
        <StepPaymentMobile
          formId={FORM_IDS[6]}
          form={stepFive}
          onChange={(patch) => setStepFive((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleRegister}
        />
      );
    default:
      return (
        <StepIdentityMobile
          formId={FORM_IDS[2]}
          form={stepOne}
          error={identityPhoneError}
          onChange={handleStepOneChange}
          onNext={handleIdentityNext}
        />
      );
  }
}
