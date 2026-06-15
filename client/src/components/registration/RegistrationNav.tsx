import { CtaArrow } from '../icons/CtaArrow';
import { TermsFooterLink } from '../legal/TermsFooterLink';
import type { RegistrationFlow } from '../../hooks/useRegistrationFlow';

type RegistrationNavProps = Pick<
  RegistrationFlow,
  'showPrevNext' | 'isLastStep' | 'activeFormId' | 'isBusy' | 'handlePrev'
>;

export function RegistrationNav({
  showPrevNext,
  isLastStep,
  activeFormId,
  isBusy,
  handlePrev,
}: RegistrationNavProps) {
  if (showPrevNext) {
    return (
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
        <button type="submit" form={activeFormId} className="reg-mobile__cta" disabled={isBusy}>
          {isLastStep ? "S'inscrire" : 'Suivant'}
          <CtaArrow className="reg-mobile__cta-icon" />
        </button>
      </div>
    );
  }

  return (
    <button type="submit" form={activeFormId} className="reg-mobile__cta" disabled={isBusy}>
      Suivant
      <CtaArrow className="reg-mobile__cta-icon" />
    </button>
  );
}

export function RegistrationFooter() {
  return (
    <footer className="reg-mobile__footer">
      <TermsFooterLink className="reg-mobile__footer-link" />
      <span className="reg-mobile__footer-credit">Powered by Aksys Digital</span>
    </footer>
  );
}
