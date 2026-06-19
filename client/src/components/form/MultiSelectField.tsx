import type { ChangeEvent } from 'react';
import { formatMultiSelectSummary } from '../../utils/multiSelect';

type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectFieldProps = {
  label: string;
  values: string[];
  options: readonly MultiSelectOption[];
  onChange: (values: string[]) => void;
  required?: boolean;
};

export function MultiSelectField({
  label,
  values,
  options,
  onChange,
  required = false,
}: MultiSelectFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    onChange(selected);
  };

  const summary = formatMultiSelectSummary(values, options, label);

  return (
    <div className="reg-mobile__field reg-mobile__field--multi-select">
      <span className="reg-mobile__multi-select-label">{label}</span>
      <p className="reg-mobile__multi-select-summary" aria-live="polite">
        {summary}
      </p>
      <select
        multiple
        required={required}
        value={values}
        onChange={handleChange}
        aria-label={label}
        size={Math.min(options.length, 5)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
