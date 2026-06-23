import { toFlexpayPhone } from '../utils/phone.js';

const DEFAULT_ADMIN_PHONES = ['243824269291', '243999993688'];

function adminPhoneList(): string[] {
  const raw = process.env.ADMIN_BYPASS_PHONES?.trim();
  if (!raw) {
    return DEFAULT_ADMIN_PHONES;
  }

  return raw
    .split(',')
    .map((entry) => toFlexpayPhone(entry.trim()))
    .filter(Boolean);
}

export function isAdminBypassPhone(phone: string): boolean {
  const normalized = toFlexpayPhone(phone);
  if (!normalized) {
    return false;
  }

  return adminPhoneList().includes(normalized);
}
