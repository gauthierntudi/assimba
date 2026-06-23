const MULTI_SELECT_DELIMITER = ',';

export function parseMultiSelectValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  const raw = String(value ?? '').trim();
  if (!raw) {
    return [];
  }

  const delimiter = raw.includes(MULTI_SELECT_DELIMITER)
    ? MULTI_SELECT_DELIMITER
    : raw.includes('|')
      ? '|'
      : null;

  if (delimiter) {
    return raw.split(delimiter).map((item) => item.trim()).filter(Boolean);
  }

  return [raw];
}

export function parseSingleSelectValue(value: unknown): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    if (trimmed.includes(',') || trimmed.includes('|')) {
      return parseMultiSelectValue(trimmed)[0] ?? '';
    }

    return trimmed;
  }

  return parseMultiSelectValue(value)[0] ?? '';
}

export function serializeMultiSelect(values: string[]): string {
  return values.map((value) => value.trim()).filter(Boolean).join(MULTI_SELECT_DELIMITER);
}

export function formatMultiSelectSummary(
  values: string[],
  options: readonly { value: string; label: string }[],
  placeholder: string,
): string {
  if (values.length === 0) {
    return placeholder;
  }

  const labels = values
    .map((value) => options.find((option) => option.value === value)?.label ?? value)
    .filter(Boolean);

  return labels.join(', ');
}
