import { useCallback, useEffect, useState } from 'react';
import { Bounce, ToastContainer } from 'react-toastify';
import { AppNavigationProvider } from './context/AppNavigationContext';
import { HOME_PATH, isTermsPath, TERMS_PATH } from './config/routes';
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

  return (
    <AppNavigationProvider openTerms={openTerms} closeTerms={closeTerms}>
      {activeFlow === 'welcome' ? (
        <WelcomePage onStart={() => setActiveFlow('registration')} />
      ) : (
        <RegistrationPage />
      )}
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
