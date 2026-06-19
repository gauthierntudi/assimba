import { useCallback, useEffect, useState } from 'react';
import { Bounce, ToastContainer } from 'react-toastify';
import { AppNavigationProvider } from './context/AppNavigationContext';
import {
  HOME_PATH,
  isCardDownloadPath,
  isCardVerifyPath,
  isTermsPath,
  readCardDownloadToken,
  TERMS_PATH,
} from './config/routes';
import { CardDownloadPage } from './pages/CardDownloadPage';
import { CardVerifyPage } from './pages/CardVerifyPage';
import { MemberCardLookupPage } from './pages/MemberCardLookupPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { TermsPage } from './pages/TermsPage';
import { WelcomePage } from './pages/WelcomePage';
import { parsePaymentReturnFromUrl } from './utils/paymentReturn';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';

type ActiveFlow = 'welcome' | 'registration';

function resolveInitialFlow(): ActiveFlow {
  return parsePaymentReturnFromUrl() ? 'registration' : 'welcome';
}

function App() {
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>(resolveInitialFlow);
  const [showTerms, setShowTerms] = useState(() => isTermsPath(window.location.pathname));
  const cardDownloadToken = isCardDownloadPath(window.location.pathname)
    ? readCardDownloadToken(window.location.search)
    : null;
  const cardVerifyToken = isCardVerifyPath(window.location.pathname)
    ? readCardDownloadToken(window.location.search)
    : null;

  useEffect(() => {
    const syncTermsVisibility = () => {
      setShowTerms(isTermsPath(window.location.pathname));
    };

    window.addEventListener('popstate', syncTermsVisibility);
    return () => window.removeEventListener('popstate', syncTermsVisibility);
  }, []);

  useEffect(() => {
    if (parsePaymentReturnFromUrl()) {
      setActiveFlow('registration');
    }
  }, []);

  const openTerms = useCallback(() => {
    if (!isTermsPath(window.location.pathname)) {
      history.pushState({ showTerms: true }, '', TERMS_PATH);
    }
    setShowTerms(true);
  }, []);

  const closeTerms = useCallback(() => {
    if (isTermsPath(window.location.pathname)) {
      history.back();
      requestAnimationFrame(() => {
        if (isTermsPath(window.location.pathname)) {
          history.replaceState({}, '', HOME_PATH);
          setShowTerms(false);
        }
      });
      return;
    }

    setShowTerms(false);
  }, []);

  const renderMainScreen = () => {
    if (isCardVerifyPath(window.location.pathname)) {
      return <CardVerifyPage token={cardVerifyToken ?? ''} />;
    }

    if (isCardDownloadPath(window.location.pathname)) {
      if (cardDownloadToken) {
        return <CardDownloadPage token={cardDownloadToken} />;
      }

      return <MemberCardLookupPage />;
    }

    if (activeFlow === 'welcome') {
      return <WelcomePage onStart={() => setActiveFlow('registration')} />;
    }

    return <RegistrationPage />;
  };

  return (
    <AppNavigationProvider openTerms={openTerms} closeTerms={closeTerms}>
      {renderMainScreen()}
      {showTerms && <TermsPage />}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
        limit={3}
      />
    </AppNavigationProvider>
  );
}

export default App;
