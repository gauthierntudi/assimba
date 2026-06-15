import { useEffect } from 'react';
import { WelcomeContent } from '../components/welcome/WelcomeContent';
import '../styles/welcome.css';

type WelcomeMobilePageProps = {
  onStart: () => void;
};

export function WelcomeMobilePage({ onStart }: WelcomeMobilePageProps) {
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
          <WelcomeContent onStart={onStart} />
        </div>
      </div>
    </div>
  );
}
