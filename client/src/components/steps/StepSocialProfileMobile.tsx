import type { FormEvent } from 'react';
import { BUDGET_OPTIONS, OCCUPATION_OPTIONS } from '../../data/socialProfile';
import { SelectChevron } from '../icons/SelectChevron';
import type { StepThreeForm } from '../../types/registration';

type StepSocialProfileMobileProps = {
  form: StepThreeForm;
  formId: string;
  onChange: (patch: Partial<StepThreeForm>) => void;
  onNext: () => void;
};

export function StepSocialProfileMobile({
  form,
  formId,
  onChange,
  onNext,
}: StepSocialProfileMobileProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form id={formId} className="reg-mobile__form" onSubmit={handleSubmit}>
      <label className="reg-mobile__field reg-mobile__field--select">
        <span className="visually-hidden">Votre occupation</span>
        <select
          value={form.occupation}
          onChange={(e) => onChange({ occupation: e.target.value })}
          required
        >
          <option value="" disabled>
            Votre occupation
          </option>
          {OCCUPATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron className="reg-mobile__field-chevron" />
      </label>

      <label className="reg-mobile__field reg-mobile__field--select">
        <span className="visually-hidden">Capacité de cotisation</span>
        <select
          value={form.contribution}
          onChange={(e) => onChange({ contribution: e.target.value })}
          required
        >
          <option value="" disabled>
            Capacité de cotisation
          </option>
          {BUDGET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron className="reg-mobile__field-chevron" />
      </label>

      <label className="reg-mobile__field reg-mobile__field--select">
        <span className="visually-hidden">Budget produits dérivés</span>
        <select
          value={form.merchBudget}
          onChange={(e) => onChange({ merchBudget: e.target.value })}
          required
        >
          <option value="" disabled>
            Budget produits dérivés
          </option>
          {BUDGET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron className="reg-mobile__field-chevron" />
      </label>
    </form>
  );
}
