export const HOME_PATH = '/';
export const TERMS_PATH = '/conditions-d-utilisation';

export function isTermsPath(pathname = window.location.pathname): boolean {
  return pathname === TERMS_PATH || pathname === `${TERMS_PATH}/`;
}
