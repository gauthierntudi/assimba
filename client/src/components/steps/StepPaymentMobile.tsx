import type { FormEvent } from 'react';
import {
  CURRENCY_OPTIONS,
  formatDisplayPrice,
  formatMemberOptionLabel,
  MEMBER_TYPE_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
} from '../../data/payment';
import { PhoneInput } from '../form/PhoneInput';
import { SelectChevron } from '../icons/SelectChevron';
import type { MemberType, PaymentCurrency, StepFiveForm } from '../../types/registration';

type StepPaymentMobileProps = {
  form: StepFiveForm;
  formId: string;
  onChange: (patch: Partial<StepFiveForm>) => void;
  onSubmit: () => void;
};

export function StepPaymentMobile({ form, formId, onChange, onSubmit }: StepPaymentMobileProps) {
  const isMobileMoney = form.paymentType === '1';
  const displayPrice = formatDisplayPrice(form.memberType, form.currency);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const handlePaymentTypeChange = (paymentType: StepFiveForm['paymentType']) => {
    onChange({
      paymentType,
      ...(paymentType === '2' ? { paymentPhone: '' } : {}),
    });
  };

  return (
    <form id={formId} className="reg-mobile__form reg-mobile__form--payment" onSubmit={handleSubmit}>
      <label className="reg-mobile__field reg-mobile__field--select">
        <span className="visually-hidden">Type de membre</span>
        <select
          value={form.memberType}
          onChange={(e) => onChange({ memberType: e.target.value as MemberType })}
          required
        >
          {MEMBER_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {formatMemberOptionLabel(option.value, form.currency)}
            </option>
          ))}
        </select>
        <SelectChevron className="reg-mobile__field-chevron" />
      </label>

      <label className="reg-mobile__field reg-mobile__field--select">
        <span className="visually-hidden">Devise de paiement</span>
        <select
          value={form.currency}
          onChange={(e) => onChange({ currency: e.target.value as PaymentCurrency })}
          required
        >
          {CURRENCY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron className="reg-mobile__field-chevron" />
      </label>

      <div className="reg-mobile__payment-card" aria-live="polite">
        <p className="reg-mobile__payment-price">{displayPrice}</p>
        <p className="reg-mobile__payment-note">
          Votre inscription sera activée une fois le paiement confirmé. Vous allez être redirigé
          vers l&apos;interface sécurisée.
        </p>
      </div>

      <label className="reg-mobile__field reg-mobile__field--select">
        <span className="visually-hidden">Mode de paiement</span>
        <select
          value={form.paymentType}
          onChange={(e) => handlePaymentTypeChange(e.target.value as StepFiveForm['paymentType'])}
          required
        >
          {PAYMENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron className="reg-mobile__field-chevron" />
      </label>

      {isMobileMoney && (
        <>
          <PhoneInput
            id="payment_phone"
            value={form.paymentPhone}
            onChange={(paymentPhone) => onChange({ paymentPhone })}
            placeholder="Numéro Mobile Money"
            required
          />
          <p className="reg-mobile__payment-hint">
            Veuillez renseigner le numéro M-Pesa, Airtel Money, Afrimoney ou Orange Money à
            facturer.
          </p>
        </>
      )}
    </form>
  );
}
