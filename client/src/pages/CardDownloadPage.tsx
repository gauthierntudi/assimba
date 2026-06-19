import { useEffect, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { CardDownloadShell } from '../components/card/CardDownloadShell';
import { fetchAndDownloadCard } from '../api/cards';

type CardDownloadPageProps = {
  token: string;
};

export function CardDownloadPage({ token }: CardDownloadPageProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Préparation de votre carte...');

  const retryDownload = async () => {
    setStatus('loading');
    setMessage('Nouvelle tentative de téléchargement...');

    try {
      await fetchAndDownloadCard({ token });
      setStatus('success');
      setMessage('Votre carte a été téléchargée. Bienvenue dans la famille AS Simba Kamikazes !');
    } catch {
      setStatus('error');
      setMessage(
        'Impossible de télécharger votre carte. Utilisez votre FAN ID ou réessayez plus tard.',
      );
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        await fetchAndDownloadCard({ token });
        if (!cancelled) {
          setStatus('success');
          setMessage('Votre carte a été téléchargée. Bienvenue dans la famille AS Simba Kamikazes !');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setMessage(
            'Impossible de télécharger votre carte. Utilisez votre FAN ID ou réessayez plus tard.',
          );
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <CardDownloadShell backHref="/telecharger-carte">
      <div className="card-download-status">
        <div
          className={`card-download-status__icon${
            status === 'error' ? ' card-download-status__icon--error' : ''
          }`}
          aria-hidden="true"
        >
          {status === 'loading' ? (
            <LoaderCircle className="card-download-status__glyph card-download-status__glyph--spin" />
          ) : status === 'success' ? (
            <Check className="card-download-status__glyph" strokeWidth={3} />
          ) : (
            <span className="card-download-status__glyph card-download-status__glyph--error">!</span>
          )}
        </div>

        <h1 className="reg-mobile__title">
          {status === 'loading'
            ? 'Téléchargement...'
            : status === 'success'
              ? 'Carte prête'
              : 'Échec'}
        </h1>

        <p
          className={`reg-mobile__subtitle card-download-status__message${
            status === 'error' ? ' card-download-status__message--error' : ''
          }`}
        >
          {message}
        </p>

        {status === 'error' ? (
          <button
            type="button"
            className="reg-mobile__cta card-download-cta"
            onClick={() => void retryDownload()}
          >
            Réessayer
          </button>
        ) : null}

        {status === 'error' ? (
          <a href="/telecharger-carte" className="card-download-alt-link">
            Télécharger avec mon FAN ID
          </a>
        ) : null}
      </div>
    </CardDownloadShell>
  );
}
