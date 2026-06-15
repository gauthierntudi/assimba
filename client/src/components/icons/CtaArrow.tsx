import { ChevronLeft, ChevronRight } from 'lucide-react';

type CtaArrowProps = {
  direction?: 'left' | 'right';
  className?: string;
};

export function CtaArrow({ direction = 'right', className }: CtaArrowProps) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return <Icon className={className} size={16} strokeWidth={2.5} aria-hidden="true" />;
}
