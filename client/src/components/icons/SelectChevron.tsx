import { ChevronDown } from 'lucide-react';

type SelectChevronProps = {
  className?: string;
};

export function SelectChevron({ className }: SelectChevronProps) {
  return (
    <ChevronDown
      className={className}
      size={12}
      strokeWidth={2}
      color="#c70405"
      aria-hidden="true"
    />
  );
}
