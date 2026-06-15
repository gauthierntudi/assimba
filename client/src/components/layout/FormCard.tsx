import type { ReactNode } from 'react';
import { CardLion } from './CardLion';

type FormCardProps = {
  children: ReactNode;
};

export function FormCard({ children }: FormCardProps) {
  return (
    <div className="form-card">
      <CardLion />
      {children}
    </div>
  );
}
