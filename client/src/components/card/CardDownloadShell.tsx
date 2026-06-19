import { useEffect, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { TermsFooterLink } from '../legal/TermsFooterLink';
import '../../styles/mobile-form-surface.css';
import '../../styles/registration-mobile.css';
import '../../styles/card-download.css';

type CardDownloadShellProps = {
  children: ReactNode;
  backHref?: string;
};

export function CardDownloadShell({ children, backHref = '/' }: CardDownloadShellProps) {
  useEffect(() => {
    document.body.classList.add('card-download-active');
    return () => document.body.classList.remove('card-download-active');
  }, []);

  return (
    <div className="card-download-screen">
      <div className="card-download-frame">
        <div className="card-download-bg mobile-form-surface" aria-hidden="true" />

        <div className="card-download-content">
          <header className="card-download-header">
            <a href={backHref} className="card-download-back">
              <ArrowLeft size={20} strokeWidth={2} aria-hidden="true" />
              Retour
            </a>
          </header>

          <div className="card-download-main">{children}</div>

          <footer className="reg-mobile__footer card-download-footer">
            <TermsFooterLink className="reg-mobile__footer-link" />
            <span className="reg-mobile__footer-credit">Powered by Aksys Digital</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
