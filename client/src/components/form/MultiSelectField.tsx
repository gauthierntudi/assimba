import { useEffect, useId, useRef, useState } from 'react';
import { SelectChevron } from '../icons/SelectChevron';
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const summary = formatMultiSelectSummary(values, options, label);
  const hasSelection = values.length > 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const toggleOption = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }

    onChange([...values, value]);
  };

  return (
    <div
      ref={rootRef}
      className={`reg-mobile__field reg-mobile__field--select reg-mobile__field--multi-select${
        open ? ' reg-mobile__field--multi-select-open' : ''
      }`}
    >
      <span className="visually-hidden">{label}</span>

      <button
        type="button"
        className={`reg-mobile__multi-select-trigger${
          hasSelection ? '' : ' reg-mobile__multi-select-trigger--placeholder'
        }`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
      >
        {summary}
      </button>

      <SelectChevron className="reg-mobile__field-chevron" />

      {open ? (
        <ul
          id={listboxId}
          className="reg-mobile__multi-select-menu"
          role="listbox"
          aria-label={label}
          aria-multiselectable="true"
        >
          {options.map((option) => {
            const checked = values.includes(option.value);

            return (
              <li key={option.value} role="presentation">
                <label
                  className={`reg-mobile__multi-select-option${
                    checked ? ' reg-mobile__multi-select-option--selected' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      ) : null}

      <input
        type="text"
        className="reg-mobile__multi-select-validator"
        value={hasSelection ? 'selected' : ''}
        readOnly
        required={required}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
