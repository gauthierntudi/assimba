import { useEffect, useRef } from 'react';
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';
import { sanitizePhoneNumber } from '../../utils/phone';

const UTILS_SCRIPT = '/vendor/intl-tel-input-utils.js';

const ITI_OPTIONS = {
  initialCountry: 'cd',
  showSelectedDialCode: true,
  countrySearch: true,
  fixDropdownWidth: false,
  useFullscreenPopup: true,
  formatAsYouType: true,
  formatOnDisplay: true,
  nationalMode: true,
  autoPlaceholder: 'polite',
  utilsScript: UTILS_SCRIPT,
} as const;

type PhoneInputProps = {
  id?: string;
  value: string;
  onChange: (phone: string) => void;
  required?: boolean;
  placeholder?: string;
};

export function PhoneInput({
  id = 'phone',
  value,
  onChange,
  required,
  placeholder = 'Téléphone',
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const itiRef = useRef<ReturnType<typeof intlTelInput> | null>(null);
  const onChangeRef = useRef(onChange);
  const lastEmittedRef = useRef('');

  onChangeRef.current = onChange;

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const iti = intlTelInput(input, ITI_OPTIONS);
    itiRef.current = iti;

    const emitChange = () => {
      const number = sanitizePhoneNumber(iti.getNumber());
      if (number === lastEmittedRef.current) return;
      lastEmittedRef.current = number;
      onChangeRef.current(number);
    };

    input.addEventListener('input', emitChange);
    input.addEventListener('countrychange', emitChange);

    iti.promise.then(() => {
      if (value) {
        iti.setNumber(value);
        lastEmittedRef.current = sanitizePhoneNumber(iti.getNumber());
      }
    });

    return () => {
      input.removeEventListener('input', emitChange);
      input.removeEventListener('countrychange', emitChange);
      iti.destroy();
      itiRef.current = null;
    };
  }, []);

  useEffect(() => {
    const iti = itiRef.current;
    if (!iti || !value) return;

    const current = sanitizePhoneNumber(iti.getNumber());
    if (value !== current) {
      iti.setNumber(value);
      lastEmittedRef.current = value;
    }
  }, [value]);

  return (
    <div className="reg-mobile__field reg-mobile__field--phone-iti">
      <input
        ref={inputRef}
        type="tel"
        id={id}
        required={required}
        autoComplete="tel"
        placeholder={placeholder}
      />
    </div>
  );
}
