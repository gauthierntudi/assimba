export const HOME_PATH = '/';
export const TERMS_PATH = '/conditions-d-utilisation';
export const CARD_DOWNLOAD_PATH = '/telecharger-carte';

export function isTermsPath(pathname = window.location.pathname): boolean {
  return pathname === TERMS_PATH || pathname === `${TERMS_PATH}/`;
}

export function isCardDownloadPath(pathname = window.location.pathname): boolean {
  return pathname === CARD_DOWNLOAD_PATH || pathname === `${CARD_DOWNLOAD_PATH}/`;
}

export function readCardDownloadToken(search = window.location.search): string | null {
  const params = new URLSearchParams(search);
  const token = params.get('token')?.trim();
  return token || null;
}
