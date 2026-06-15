import { useEffect } from 'react';
import { MobileStepDots } from '../components/layout/MobileStepDots';
import { RegistrationFooter, RegistrationNav } from '../components/registration/RegistrationNav';
import { RegistrationLoadingOverlay } from '../components/registration/RegistrationLoadingOverlay';
import { RegistrationStepForm } from '../components/registration/RegistrationStepForm';
import { RegistrationStepHeader } from '../components/registration/RegistrationStepHeader';
import type { RegistrationFlow } from '../hooks/useRegistrationFlow';
import '../styles/mobile-form-surface.css';
import '../styles/registration-mobile.css';

type RegistrationMobilePageProps = {
  flow: RegistrationFlow;
};

export function RegistrationMobilePage({ flow }: RegistrationMobilePageProps) {
  useEffect(() => {
    document.body.classList.add('reg-mobile-active');
    return () => document.body.classList.remove('reg-mobile-active');
  }, []);

  return (
    <div className="reg-mobile-screen">
      <div className="reg-mobile-frame">
        <div className="reg-mobile__bg mobile-form-surface" aria-hidden="true" />

        <div
          className={`reg-mobile__content${flow.isContactStep ? ' reg-mobile__content--contact' : ''}${flow.isBusy ? ' reg-mobile__content--busy' : ''}`}
        >
          <header className="reg-mobile__header">
            <MobileStepDots currentStep={flow.currentStep} />
            <RegistrationStepHeader currentStep={flow.currentStep} />
          </header>

          <RegistrationStepForm {...flow} />

          <div className="reg-mobile__bottom">
            <RegistrationNav {...flow} />
            <RegistrationFooter />
          </div>
        </div>
      </div>

      {flow.loading && (
        <RegistrationLoadingOverlay
          loading={flow.loading}
          onCancelPayment={flow.handleCancelPayment}
          onDismiss={flow.dismissLoading}
        />
      )}
    </div>
  );
}
