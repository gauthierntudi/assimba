export const OCCUPATION_OPTIONS = [
  { value: 'Etudiant', label: 'Étudiant' },
  { value: 'Salarie', label: 'Salarié / Employé' },
  { value: 'Independant', label: 'Indépendant / Entrepreneur' },
  { value: 'Sans_emploi', label: 'Sans emploi' },
  { value: 'Autre', label: 'Autre' },
] as const;

export const BUDGET_OPTIONS = [
  { value: '<5000', label: '< 5 000 CDF' },
  { value: '5000-20000', label: '5 000 - 20 000 CDF' },
  { value: '>20000', label: '> 20 000 CDF' },
] as const;
