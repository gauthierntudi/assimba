import type { FormEvent } from 'react';
import {
  FOLLOW_METHOD_OPTIONS,
  MATCH_FREQUENCY_OPTIONS,
  SECTION_OPTIONS,
  TRAINING_FREQUENCY_OPTIONS,
} from '../../data/engagement';
import { SelectChevron } from '../icons/SelectChevron';
import type { StepFourForm } from '../../types/registration';

type StepEngagementMobileProps = {
  form: StepFourForm;
  formId: string;
  onChange: (patch: Partial<StepFourForm>) => void;
  onNext: () => void;
};

export function StepEngagementMobile({ form, formId, onChange, onNext }: StepEngagementMobileProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form id={formId} className="reg-mobile__form" onSubmit={handleSubmit}>
      <label className="reg-mobile__field reg-mobile__field--select">
        <span className="visually-hidden">Votre section</span>
        <select
          value={form.section}
          onChange={(e) => onChange({ section: e.target.value })}
          required
        >
          <option value="" disabled>
            Votre section
          </option>
          {SECTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron className="reg-mobile__field-chevron" />
      </label>

      <label className="reg-mobile__field">
        <span className="visually-hidden">Nombre d&apos;années</span>
        <input
          type="number"
          placeholder="Nombre d'années"
          value={form.years}
          onChange={(e) => onChange({ years: e.target.value })}
          min={0}
          max={100}
          required
        />
      </label>

      <label className="reg-mobile__field reg-mobile__field--select">
        <span className="visually-hidden">Fréquence aux entrainements</span>
        <select
          value={form.trainingFreq}
          onChange={(e) => onChange({ trainingFreq: e.target.value })}
          required
        >
          <option value="" disabled>
            Fréquence aux entrainements
          </option>
          {TRAINING_FREQUENCY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron className="reg-mobile__field-chevron" />
      </label>

      <label className="reg-mobile__field reg-mobile__field--select">
        <span className="visually-hidden">Fréquence aux Matchs</span>
        <select
          value={form.matchFreq}
          onChange={(e) => onChange({ matchFreq: e.target.value })}
          required
        >
          <option value="" disabled>
            Fréquence aux Matchs
          </option>
          {MATCH_FREQUENCY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron className="reg-mobile__field-chevron" />
      </label>

      <label className="reg-mobile__field reg-mobile__field--select">
        <span className="visually-hidden">Vous suivez le club</span>
        <select
          value={form.followMethod}
          onChange={(e) => onChange({ followMethod: e.target.value })}
          required
        >
          <option value="" disabled>
            Vous suivez le club
          </option>
          {FOLLOW_METHOD_OPTIONS.map((option) => (
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
