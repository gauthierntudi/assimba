import type { FormEvent } from 'react';
import type { Gender, StepOneForm } from '../../types/registration';
import { PhoneInput } from '../form/PhoneInput';
import { SelectChevron } from '../icons/SelectChevron';

type StepIdentityMobileProps = {
  form: StepOneForm;
  formId: string;
  notice?: string | null;
  onChange: (patch: Partial<StepOneForm>) => void;
  onNext: () => void;
};

const AGE_OPTIONS = [
  { value: 'moins18', label: 'Moins de 18 ans' },
  { value: '18-25', label: '18 - 25 ans' },
  { value: '26-35', label: '26 - 35 ans' },
  { value: '36-45', label: '36 - 45 ans' },
  { value: '46-55', label: '46 - 55 ans' },
  { value: '56-65', label: '56 - 65 ans' },
  { value: 'plus65', label: 'Plus de 65 ans' },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
  { value: 'A', label: 'Autre' },
];

export function StepIdentityMobile({
  form,
  formId,
  notice,
  onChange,
  onNext,
}: StepIdentityMobileProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form id={formId} className="reg-mobile__form" onSubmit={handleSubmit}>
      {notice ? <p className="reg-mobile__draft-notice">{notice}</p> : null}

      <label className="reg-mobile__field">
        <span className="visually-hidden">Votre prénom</span>
        <input
          type="text"
          placeholder="Votre prénom"
          value={form.firstname}
          onChange={(e) => onChange({ firstname: e.target.value })}
          required
        />
      </label>

      <label className="reg-mobile__field">
        <span className="visually-hidden">Votre nom</span>
        <input
          type="text"
          placeholder="Votre nom"
          value={form.lastname}
          onChange={(e) => onChange({ lastname: e.target.value })}
          required
        />
      </label>

      <label className="reg-mobile__field">
        <span className="visually-hidden">Votre post-nom</span>
        <input
          type="text"
          placeholder="Votre post-nom"
          value={form.postname}
          onChange={(e) => onChange({ postname: e.target.value })}
        />
      </label>

      <label className="reg-mobile__field reg-mobile__field--select">
        <span className="visually-hidden">Sexe</span>
        <select
          value={form.gender}
          onChange={(e) => onChange({ gender: e.target.value as Gender })}
          required
        >
          <option value="" disabled>
            Sexe
          </option>
          {GENDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron className="reg-mobile__field-chevron" />
      </label>

      <label className="reg-mobile__field reg-mobile__field--select">
        <span className="visually-hidden">Tranche d&apos;âge</span>
        <select
          value={form.ageRange}
          onChange={(e) => onChange({ ageRange: e.target.value })}
          required
        >
          <option value="" disabled>
            Tranche d&apos;âge
          </option>
          {AGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron className="reg-mobile__field-chevron" />
      </label>

      <PhoneInput
        id="phone"
        value={form.phone}
        onChange={(phone) => onChange({ phone })}
        required
      />
    </form>
  );
}
