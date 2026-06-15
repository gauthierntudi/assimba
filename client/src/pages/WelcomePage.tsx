import { DESKTOP_MEDIA_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { WelcomeDesktopPage } from './WelcomeDesktopPage';
import { WelcomeMobilePage } from './WelcomeMobilePage';

type WelcomePageProps = {
  onStart: () => void;
};

export function WelcomePage({ onStart }: WelcomePageProps) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);

  if (isDesktop) {
    return <WelcomeDesktopPage onStart={onStart} />;
  }

  return <WelcomeMobilePage onStart={onStart} />;
}
