import { useEffect, useId, useRef, useState } from 'react';
import { SelectChevron } from '../icons/SelectChevron';

type ChipsOption = {
  value: string;
  label: string;
};

type ChipsMultiSelectFieldProps = {
  label: string;
  values: string[];
  options: readonly ChipsOption[];
  onChange: (values: string[]) => void;
  required?: boolean;
};

export function ChipsMultiSelectField({
  label,
  values,
  options,
  onChange,
  required = false,
}: ChipsMultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const availableOptions = options.filter((option) => !values.includes(option.value));
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

  const addValue = (value: string) => {
    if (!value || values.includes(value)) {
      return;
    }

    onChange([...values, value]);
    setOpen(false);
  };

  const removeValue = (value: string) => {
    onChange(values.filter((item) => item !== value));
  };

  return (
    <div
      ref={rootRef}
      className={`reg-mobile__field reg-mobile__field--chips-select${
        open ? ' reg-mobile__field--chips-select-open' : ''
      }`}
    >
      <span className="visually-hidden">{label}</span>

      <div className="reg-mobile__chips-row">
        {values.map((value) => {
          const option = options.find((item) => item.value === value);
          return (
            <span key={value} className="reg-mobile__chip">
              <span>{option?.label ?? value}</span>
              <button
                type="button"
                className="reg-mobile__chip-remove"
                aria-label={`Retirer ${option?.label ?? value}`}
                onClick={() => removeValue(value)}
              >
                ×
              </button>
            </span>
          );
        })}

        {availableOptions.length > 0 ? (
          <button
            type="button"
            className={`reg-mobile__chips-trigger${
              hasSelection ? '' : ' reg-mobile__chips-trigger--placeholder'
            }`}
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listboxId}
          >
            {hasSelection ? 'Ajouter…' : label}
          </button>
        ) : null}
      </div>

      <SelectChevron className="reg-mobile__field-chevron" />

      {open && availableOptions.length > 0 ? (
        <ul
          id={listboxId}
          className="reg-mobile__multi-select-menu"
          role="listbox"
          aria-label={label}
        >
          {availableOptions.map((option) => (
            <li key={option.value} role="presentation">
              <button
                type="button"
                className="reg-mobile__chips-option"
                onClick={() => addValue(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
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
