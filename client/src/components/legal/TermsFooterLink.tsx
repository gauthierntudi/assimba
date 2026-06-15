import { TERMS_PATH } from '../../config/routes';
import { useAppNavigation } from '../../context/AppNavigationContext';

type TermsFooterLinkProps = {
  className?: string;
};

export function TermsFooterLink({ className }: TermsFooterLinkProps) {
  const { openTerms } = useAppNavigation();

  return (
    <a
      href={TERMS_PATH}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        openTerms();
      }}
    >
      Conditions d&apos;utilisation
    </a>
  );
}
