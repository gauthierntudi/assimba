import { useEffect, useState } from 'react';
import { RegistrationMobilePage } from './pages/RegistrationMobilePage';
import { WelcomePage } from './pages/WelcomePage';
import { parsePaymentReturnFromUrl } from './utils/paymentReturn';

function App() {
  const [screen, setScreen] = useState<'welcome' | 'registration'>(() =>
    parsePaymentReturnFromUrl() ? 'registration' : 'welcome',
  );

  useEffect(() => {
    if (parsePaymentReturnFromUrl()) {
      setScreen('registration');
    }
  }, []);

  if (screen === 'welcome') {
    return <WelcomePage onStart={() => setScreen('registration')} />;
  }

  return <RegistrationMobilePage />;
}

export default App;
