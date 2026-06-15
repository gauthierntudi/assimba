import { useState } from 'react';
import { BackgroundLayers } from '../components/layout/BackgroundLayers';
import { FormCard } from '../components/layout/FormCard';
import { FormHeader } from '../components/layout/FormHeader';
import { ProgressStepper } from '../components/stepper/ProgressStepper';
import { StepIdentity } from '../components/steps/StepIdentity';
import { initialStepOneForm } from '../types/registration';

export function RegistrationPage() {
  const [currentStep] = useState(1);
  const [stepOne, setStepOne] = useState(initialStepOneForm);

  const updateStepOne = (patch: Partial<typeof stepOne>) => {
    setStepOne((prev) => ({ ...prev, ...patch }));
  };

  const handleNext = () => {
    // TODO: navigation étape 2
  };

  return (
    <>
      <BackgroundLayers />
      <div className="page-wrapper">
        <FormHeader />
        <ProgressStepper currentStep={currentStep} />
        <FormCard>
          <StepIdentity form={stepOne} onChange={updateStepOne} onNext={handleNext} />
        </FormCard>
      </div>
    </>
  );
}
