import { appSettings } from './appSettings';

export const FORM_IDS: Record<number, string> = {
  2: 'reg-step-identity',
  3: 'reg-step-contact',
  4: 'reg-step-social',
  5: 'reg-step-engagement',
  6: 'reg-step-payment',
};

/** Étapes masquées dans le parcours selon la configuration. */
function getSkippedRegistrationSteps(): Set<number> {
  return appSettings.profilSocialEnabled ? new Set() : new Set([4]);
}

export const REGISTRATION_STEPS = [1, 2, 3, 4, 5, 6] as const;

export function getVisibleRegistrationSteps(): number[] {
  const skipped = getSkippedRegistrationSteps();
  return REGISTRATION_STEPS.filter((step) => !skipped.has(step));
}

export function isRegistrationStepSkipped(step: number): boolean {
  return getSkippedRegistrationSteps().has(step);
}

export function getNextRegistrationStep(step: number): number {
  let next = Math.min(step + 1, 6);
  while (isRegistrationStepSkipped(next) && next < 6) {
    next += 1;
  }
  return next;
}

export function getPrevRegistrationStep(step: number): number {
  let prev = Math.max(step - 1, 2);
  while (isRegistrationStepSkipped(prev) && prev > 2) {
    prev -= 1;
  }
  return prev;
}

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
    subtitle: 'Veuillez remplir les champs obligatoires',
    subtitleLines: ['Veuillez remplir les champs', 'obligatoires'],
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
