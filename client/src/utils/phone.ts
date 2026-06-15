export function sanitizePhoneNumber(number: string): string {
  if (!number) return '';

  if (number.startsWith('+2430')) {
    return number.replace(/^\+2430/, '+243');
  }

  return number;
}

/** Format attendu par FlexPay : 243891234567 (sans +, 9 chiffres après 243). */
export function toFlexpayPhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('2430')) {
    digits = `243${digits.slice(4)}`;
  } else if (digits.startsWith('0')) {
    digits = `243${digits.slice(1)}`;
  } else if (!digits.startsWith('243')) {
    digits = `243${digits.replace(/^0+/, '')}`;
  }

  return digits;
}

export function isValidFlexpayDrcPhone(phone: string): boolean {
  return /^243\d{9}$/.test(toFlexpayPhone(phone));
}
