export const FORM_IDS: Record<number, string> = {
  2: 'reg-step-identity',
  3: 'reg-step-contact',
  4: 'reg-step-social',
  5: 'reg-step-engagement',
  6: 'reg-step-payment',
};

export const REGISTRATION_STEP_LABELS: Record<number, string> = {
  1: 'Accueil',
  2: 'Informations',
  3: 'Coordonnées',
  4: 'Profil social',
  5: 'Engagement',
  6: 'Paiement',
};

export type StepHeaderContent = {
  title: string;
  titleLines?: [string, string];
  subtitle: string;
  subtitleLines?: [string, string];
  subtitleClass?: string;
};

export const STEP_HEADERS: Partial<Record<number, StepHeaderContent>> = {
  2: {
    title: 'Informations Personnelles',
    titleLines: ['Informations', 'Personnelles'],
    subtitle: 'Veuillez remplir tous les champs correctement',
    subtitleLines: ['Veuillez remplir tous les champs', 'correctement'],
  },
  4: {
    title: 'Profil Social',
    subtitle: 'Mieux vous connaître pour mieux vous servir.',
  },
  5: {
    title: 'Engagement',
    subtitle: 'Votre niveau de passion pour notre équipe et votre affiliation.',
  },
  6: {
    title: 'Enregistrement',
    subtitle: "Finalisez votre inscription en réglant les frais d'adhésion.",
    subtitleLines: ['Finalisez votre inscription en', "réglant les frais d'adhésion."],
    subtitleClass: 'reg-mobile__subtitle--payment',
  },
};
