import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import '../styles/welcome.css';

type WelcomePageProps = {
  onStart: () => void;
};

export function WelcomePage({ onStart }: WelcomePageProps) {
  useEffect(() => {
    document.body.classList.add('welcome-active');
    return () => document.body.classList.remove('welcome-active');
  }, []);

  return (
    <div className="welcome-screen">
      <div className="welcome-frame">
        <div className="welcome-bg">
          <div className="welcome-bg__red" aria-hidden="true" />
          <div className="welcome-bg__photo" aria-hidden="true" />
          <div className="welcome-bg__veil" aria-hidden="true" />
        </div>

        <div className="welcome-content">
          <div className="welcome-main">
            <img
              className="welcome-logo welcome-logo--small"
              src="/img/lualaba.png"
              alt=""
              aria-hidden="true"
            />

            <div className="welcome-hero">
              <img
                className="welcome-logo welcome-logo--large"
                src="/img/logo-new.png"
                alt="AS Simba"
              />
              <h1 className="welcome-title">
                AS SIMBA
                <br />
                KAMIKAZES
              </h1>
              <p className="welcome-founded">Fondée en 1939</p>
            </div>

            <div className="welcome-tagline-group">
              <h2 className="welcome-tagline">Rejoignez la famille</h2>
              <div className="welcome-carousel-dots" aria-hidden="true">
                <span className="welcome-carousel-dots__dot welcome-carousel-dots__dot--active" />
                <span className="welcome-carousel-dots__dot" />
                <span className="welcome-carousel-dots__dot" />
              </div>
            </div>

            <section className="welcome-community" aria-label="La communauté">
              <div className="welcome-community__card">
                <div className="welcome-community__stats">
                  <p className="welcome-community__label">La communauté</p>
                  <div className="welcome-community__figures">
                    <p className="welcome-community__count">+2K</p>
                    <p className="welcome-community__metric">Supporters.</p>
                  </div>
                  <p className="welcome-community__caption">
                    Une communauté qui grandit chaque jour
                  </p>
                </div>

                <div className="welcome-community__visual">
                  <div className="welcome-community__photo">
                    <img src="/img/img01.jpg" alt="Supporters AS Simba" />
                  </div>
                  <p className="welcome-community__quote">
                    Rejoignez une communauté de passionnés qui grandit chaque saison.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="welcome-bottom">
            <div className="welcome-cta-row">
              <button type="button" className="welcome-cta" onClick={onStart}>
                Demarrer
              </button>
              <button
                type="button"
                className="welcome-cta-next"
                onClick={onStart}
                aria-label="Continuer"
              >
                <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>

            <footer className="welcome-footer">
              <a href="#" className="welcome-footer__link">
                Conditions d&apos;utilisation
              </a>
              <span className="welcome-footer__credit">Powered by Aksys Digital</span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
