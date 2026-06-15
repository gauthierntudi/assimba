import { useEffect, useRef, useState } from 'react';
import {
  buildRegistrationPayload,
  checkPaymentStatus,
  checkPhone,
  createPayment,
  mapDraftToFormPatch,
  saveDraft,
  submitCardPayment,
} from '../api/registration';
import { PAYMENT_FAILURE_MESSAGES } from '../types/paymentResult';
import { MobileStepDots } from '../components/layout/MobileStepDots';
import { CtaArrow } from '../components/icons/CtaArrow';
import { StepContactMobile } from '../components/steps/StepContactMobile';
import { StepEngagementMobile } from '../components/steps/StepEngagementMobile';
import { StepIdentityMobile } from '../components/steps/StepIdentityMobile';
import { StepPaymentMobile } from '../components/steps/StepPaymentMobile';
import { StepSocialProfileMobile } from '../components/steps/StepSocialProfileMobile';
import { PaymentResultMobile } from './PaymentResultMobile';
import {
  initialStepFiveForm,
  initialStepFourForm,
  initialStepOneForm,
  initialStepThreeForm,
  initialStepTwoForm,
} from '../types/registration';
import type { PaymentResultData } from '../types/paymentResult';
import { clearPaymentReturnParams, parsePaymentReturnFromUrl } from '../utils/paymentReturn';
import { isValidFlexpayDrcPhone } from '../utils/phone';
import '../styles/registration-mobile.css';

const FORM_IDS: Record<number, string> = {
  2: 'reg-step-identity',
  3: 'reg-step-contact',
  4: 'reg-step-social',
  5: 'reg-step-engagement',
  6: 'reg-step-payment',
};

export function RegistrationMobilePage() {
  const [currentStep, setCurrentStep] = useState(2);
  const [stepOne, setStepOne] = useState(initialStepOneForm);
  const [stepTwo, setStepTwo] = useState(initialStepTwoForm);
  const [stepThree, setStepThree] = useState(initialStepThreeForm);
  const [stepFour, setStepFour] = useState(initialStepFourForm);
  const [stepFive, setStepFive] = useState(initialStepFiveForm);
  const [paymentResult, setPaymentResult] = useState<PaymentResultData | null>(null);
  const [loading, setLoading] = useState<{ title: string; description: string } | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCancelledRef = useRef(false);
  const phoneCheckRef = useRef('');

  const isBusy = loading !== null;

  const stopPolling = () => {
    pollCancelledRef.current = true;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  useEffect(() => {
    document.body.classList.add('reg-mobile-active');
    return () => document.body.classList.remove('reg-mobile-active');
  }, []);

  useEffect(() => {
    const returnResult = parsePaymentReturnFromUrl();
    if (returnResult) {
      setPaymentResult(returnResult);
      clearPaymentReturnParams();
    }
  }, []);

  const buildPayload = () =>
    buildRegistrationPayload(stepOne, stepTwo, stepThree, stepFour, stepFive);

  const applyDraftPatch = (data: Record<string, unknown>) => {
    const patch = mapDraftToFormPatch(data);
    setStepOne((prev) => ({ ...prev, ...patch.stepOne }));
    setStepTwo((prev) => ({ ...prev, ...patch.stepTwo }));
    setStepThree((prev) => ({ ...prev, ...patch.stepThree }));
    setStepFour((prev) => ({ ...prev, ...patch.stepFour }));
    setStepFive((prev) => ({ ...prev, ...patch.stepFive }));
  };

  const verifyPhoneAndRestoreDraft = async (
    phone: string,
    options: { showNotice?: boolean } = {},
  ): Promise<'new' | 'restored' | 'paid' | 'error'> => {
    if (!phone || !isValidFlexpayDrcPhone(phone)) {
      return 'new';
    }

    if (phoneCheckRef.current === phone) {
      return draftNotice ? 'restored' : 'new';
    }

    try {
      const result = await checkPhone(phone);
      phoneCheckRef.current = phone;

      if (result.success && result.exists && result.is_paid) {
        setDraftNotice(null);
        setPaymentResult({
          status: 'failed',
          message: result.message,
        });
        return 'paid';
      }

      if (result.success && result.exists && result.data) {
        applyDraftPatch(result.data);
        if (options.showNotice !== false) {
          setDraftNotice(
            'Inscription en cours retrouvée. Vos informations ont été chargées, vous pouvez continuer.',
          );
        }
        return 'restored';
      }

      setDraftNotice(null);
      return 'new';
    } catch {
      return 'error';
    }
  };

  const saveDraftQuietly = async () => {
    if (!stepOne.phone) return;
    try {
      await saveDraft(buildPayload());
    } catch {
      // Sauvegarde silencieuse — ne bloque pas la navigation
    }
  };

  const handleRegister = async () => {
    if (isBusy) return;

    if (stepFive.paymentType === '1') {
      const paymentPhone = stepFive.paymentPhone || stepOne.phone;
      if (!isValidFlexpayDrcPhone(paymentPhone)) {
        setPaymentResult({
          status: 'failed',
          message:
            'Numéro Mobile Money invalide. Vérifiez le numéro à facturer (ex. 0812345678).',
        });
        return;
      }
    }

    pollCancelledRef.current = false;
    setLoading({
      title: 'Génération du paiement...',
      description: 'Veuillez patienter pendant la connexion sécurisée.',
    });

    try {
      const result = await createPayment(buildPayload());

      if (!result.success) {
        setPaymentResult({ status: 'failed', message: result.message });
        setLoading(null);
        return;
      }

      if (result.is_redirect) {
        submitCardPayment(result.url, result.params);
        return;
      }

      setLoading({
        title: 'Validation en attente...',
        description:
          result.message ||
          'Consultez votre téléphone (push ou code USSD) et entrez votre PIN pour valider.',
      });

      const orderNumber = result.orderNumber;
      let attempts = 0;

      const pollOnce = async () => {
        if (pollCancelledRef.current) return;

        attempts += 1;

        if (attempts >= 60) {
          stopPolling();
          setLoading(null);
          setPaymentResult({
            status: 'failed',
            message:
              "Délai d'attente dépassé. Aucune confirmation reçue. Vérifiez votre solde et réessayez.",
          });
          return;
        }

        try {
          const status = await checkPaymentStatus(orderNumber);

          if (status.success && status.status === 'paid') {
            stopPolling();
            setLoading(null);
            setPaymentResult({ status: 'success', orderNumber });
          } else if (status.success && status.status === 'failed') {
            stopPolling();
            setLoading(null);
            setPaymentResult({
              status: 'failed',
              message: status.message ?? PAYMENT_FAILURE_MESSAGES.default,
            });
          }
        } catch {
          // Continuer le polling
        }
      };

      await pollOnce();
      if (!pollCancelledRef.current) {
        pollRef.current = setInterval(pollOnce, 5000);
      }
    } catch {
      stopPolling();
      setLoading(null);
      setPaymentResult({
        status: 'failed',
        message: "Une erreur technique s'est produite lors du contact avec le serveur.",
      });
    }
  };

  const handleCancelPayment = () => {
    stopPolling();
    setLoading(null);
  };

  const handlePaymentRetry = () => {
    setPaymentResult(null);
    setCurrentStep(6);
  };

  if (paymentResult) {
    return (
      <PaymentResultMobile
        result={paymentResult}
        onRetry={handlePaymentRetry}
        onDownloadCard={() => {
          // TODO: endpoint téléchargement carte membre
        }}
      />
    );
  }

  const showPrevNext = currentStep >= 3;
  const isLastStep = currentStep === 6;
  const activeFormId = FORM_IDS[currentStep] ?? FORM_IDS[2];
  const isContactStep = currentStep === 3;

  const handleNext = async () => {
    if (isBusy) return;

    setLoading({
      title: 'Chargement...',
      description: 'Sauvegarde de vos informations en cours.',
    });

    try {
      await saveDraftQuietly();
      setCurrentStep((step) => Math.min(step + 1, 6));
    } finally {
      setLoading(null);
    }
  };

  const handleIdentityNext = async () => {
    if (isBusy) return;

    setLoading({
      title: 'Vérification...',
      description: 'Vérification de votre numéro de téléphone.',
    });

    try {
      const status = await verifyPhoneAndRestoreDraft(stepOne.phone, { showNotice: true });
      if (status === 'paid') {
        return;
      }

      await saveDraftQuietly();
      setCurrentStep((step) => Math.min(step + 1, 6));
    } finally {
      setLoading(null);
    }
  };

  const handlePhoneBlur = async () => {
    if (isBusy || !stepOne.phone) return;

    setLoading({
      title: 'Vérification...',
      description: 'Recherche d\'une inscription en cours avec ce numéro.',
    });

    try {
      await verifyPhoneAndRestoreDraft(stepOne.phone, { showNotice: true });
    } finally {
      setLoading(null);
    }
  };

  const handlePrev = () => {
    setCurrentStep((step) => Math.max(step - 1, 2));
  };

  const renderStep = () => {
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
            onChange={(patch) => {
              if (patch.phone !== undefined && patch.phone !== stepOne.phone) {
                phoneCheckRef.current = '';
                setDraftNotice(null);
              }
              setStepOne((prev) => ({ ...prev, ...patch }));
            }}
            onNext={handleIdentityNext}
            onPhoneBlur={handlePhoneBlur}
            draftNotice={draftNotice}
          />
        );
    }
  };

  return (
    <div className="reg-mobile-screen">
      <div className="reg-mobile-frame">
        <div className="reg-mobile__bg">
          <div className="reg-mobile__bg-red" aria-hidden="true" />
          <div className="reg-mobile__bg-photo" aria-hidden="true" />
          <img
            className="reg-mobile__bg-lion"
            src="/img/Pattern_lion_as_simba.svg"
            alt=""
            aria-hidden="true"
          />
          <div className="reg-mobile__bg-veil" aria-hidden="true" />
          <img
            className="reg-mobile__bg-pattern"
            src="/img/pattern.png"
            alt=""
            aria-hidden="true"
          />
        </div>

        <div
          className={`reg-mobile__content${isContactStep ? ' reg-mobile__content--contact' : ''}${isBusy ? ' reg-mobile__content--busy' : ''}`}
        >
          <header className="reg-mobile__header">
            <MobileStepDots currentStep={currentStep} />
            {currentStep === 2 && (
              <>
                <h1 className="reg-mobile__title">
                  Informations
                  <br />
                  Personnelles
                </h1>
                <p className="reg-mobile__subtitle">
                  Veuillez remplir tous les champs
                  <br />
                  correctement
                </p>
              </>
            )}
            {currentStep === 4 && (
              <>
                <h1 className="reg-mobile__title">Profil Social</h1>
                <p className="reg-mobile__subtitle">
                  Mieux vous connaître pour mieux vous servir.
                </p>
              </>
            )}
            {currentStep === 5 && (
              <>
                <h1 className="reg-mobile__title">Engagement</h1>
                <p className="reg-mobile__subtitle">
                  Votre niveau de passion pour notre équipe et votre affiliation.
                </p>
              </>
            )}
            {currentStep === 6 && (
              <>
                <h1 className="reg-mobile__title">Enregistrement</h1>
                <p className="reg-mobile__subtitle reg-mobile__subtitle--payment">
                  Finalisez votre inscription en
                  <br />
                  réglant les frais d&apos;adhésion.
                </p>
              </>
            )}
          </header>

          {renderStep()}

          <div className="reg-mobile__bottom">
            {showPrevNext ? (
              <div className="reg-mobile__cta-row">
                <button
                  type="button"
                  className="reg-mobile__cta reg-mobile__cta--prev"
                  onClick={handlePrev}
                  disabled={isBusy}
                >
                  <CtaArrow direction="left" className="reg-mobile__cta-icon" />
                  Précédent
                </button>
                <button
                  type="submit"
                  form={activeFormId}
                  className="reg-mobile__cta"
                  disabled={isBusy}
                >
                  {isLastStep ? "S'inscrire" : 'Suivant'}
                  <CtaArrow className="reg-mobile__cta-icon" />
                </button>
              </div>
            ) : (
              <button type="submit" form={activeFormId} className="reg-mobile__cta" disabled={isBusy}>
                Suivant
                <CtaArrow className="reg-mobile__cta-icon" />
              </button>
            )}

            <footer className="reg-mobile__footer">
              <a href="#" className="reg-mobile__footer-link">
                Conditions d&apos;utilisation
              </a>
              <span className="reg-mobile__footer-credit">Powered by Aksys Digital</span>
            </footer>
          </div>
        </div>
      </div>

      {loading && (
        <div className="reg-mobile__overlay" role="status" aria-live="polite" aria-busy="true">
          <div className="reg-mobile__overlay-card">
            <div className="reg-mobile__overlay-spinner" aria-hidden="true" />
            <h2>{loading.title}</h2>
            <p>{loading.description}</p>
            {loading.title === 'Validation en attente...' && (
              <button
                type="button"
                className="reg-mobile__overlay-cancel"
                onClick={handleCancelPayment}
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
