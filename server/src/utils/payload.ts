import type { Prisma } from '@prisma/client';

export type SupporterInput = {
  firstname: string;
  lastname: string;
  middlename: string;
  gender: string;
  ageRange: string;
  phone: string;
  countryStatus: string;
  province: string;
  city: string;
  town: string;
  section: string;
  occupation: string;
  contribution: string;
  merch: string;
  years: number | null;
  trainingFreq: string;
  matchFreq: string;
  followMethod: string;
  socialFb: string;
  socialX: string;
  socialIg: string;
  socialTt: string;
  memberType?: string;
};

function pickString(body: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = body[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function socialFlag(value: unknown): string {
  if (value === true || value === '1' || value === 'on' || value === 1) {
    return '1';
  }
  return '';
}

export function parseYears(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseSupporterPayload(body: Record<string, unknown>): SupporterInput {
  return {
    firstname: pickString(body, 'firstname'),
    lastname: pickString(body, 'lastname'),
    middlename: pickString(body, 'middlename', 'postname'),
    gender: pickString(body, 'gender'),
    ageRange: pickString(body, 'age', 'ageRange', 'age_range'),
    phone: pickString(body, 'phone_full', 'phone'),
    countryStatus: pickString(body, 'country_status', 'countryStatus'),
    province: pickString(body, 'province'),
    city: pickString(body, 'city'),
    town: pickString(body, 'town'),
    section: pickString(body, 'section'),
    occupation: pickString(body, 'occupation'),
    contribution: pickString(body, 'contribution'),
    merch: pickString(body, 'merch', 'merchBudget'),
    years: parseYears(body.years),
    trainingFreq: pickString(body, 'training_freq', 'trainingFreq'),
    matchFreq: pickString(body, 'match_freq', 'matchFreq'),
    followMethod: pickString(body, 'follow_method', 'followMethod'),
    socialFb: socialFlag(body.social_fb ?? body.socialFb),
    socialX: socialFlag(body.social_x ?? body.socialX),
    socialIg: socialFlag(body.social_ig ?? body.socialIg),
    socialTt: socialFlag(body.social_tt ?? body.socialTt),
    memberType: pickString(body, 'member_type', 'memberType') || 'simple',
  };
}

export function toSupporterData(
  input: SupporterInput,
  includeMemberType = false,
): Prisma.SupporterCreateInput | Prisma.SupporterUpdateInput {
  const base = {
    firstname: input.firstname || null,
    lastname: input.lastname || null,
    middlename: input.middlename || null,
    gender: input.gender || null,
    ageRange: input.ageRange || null,
    countryStatus: input.countryStatus || null,
    province: input.province || null,
    city: input.city || null,
    town: input.town || null,
    section: input.section || null,
    occupation: input.occupation || null,
    contribution: input.contribution || null,
    merch: input.merch || null,
    years: input.years,
    trainingFreq: input.trainingFreq || null,
    matchFreq: input.matchFreq || null,
    followMethod: input.followMethod || null,
    socialFb: input.socialFb || null,
    socialX: input.socialX || null,
    socialIg: input.socialIg || null,
    socialTt: input.socialTt || null,
  };

  if (includeMemberType) {
    return { ...base, memberType: input.memberType ?? 'simple' };
  }

  return base;
}

export function buildInvoiceReference(supporterId: number): string {
  const refBase = `INV-${String(supporterId).padStart(4, '0')}`;
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${refBase}-${suffix}`;
}
