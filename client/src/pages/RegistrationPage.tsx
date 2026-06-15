import { DESKTOP_MEDIA_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { useRegistrationFlow } from '../hooks/useRegistrationFlow';
import { RegistrationDesktopPage } from './RegistrationDesktopPage';
import { RegistrationMobilePage } from './RegistrationMobilePage';
import { PaymentResultPage } from './PaymentResultPage';

export function RegistrationPage() {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const flow = useRegistrationFlow();

  if (flow.paymentResult) {
    return (
      <PaymentResultPage
        result={flow.paymentResult}
        onRetry={flow.handlePaymentRetry}
        onDownloadCard={() => {
          // TODO: endpoint téléchargement carte membre
        }}
      />
    );
  }

  if (isDesktop) {
    return <RegistrationDesktopPage flow={flow} />;
  }

  return <RegistrationMobilePage flow={flow} />;
}
