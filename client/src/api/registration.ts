import { api } from './client';
import { toFlexpayPhone } from '../utils/phone';
import { parseMultiSelectValue, serializeMultiSelect } from '../utils/multiSelect';
import type {
  MemberType,
  StepFiveForm,
  StepFourForm,
  StepOneForm,
  StepThreeForm,
  StepTwoForm,
} from '../types/registration';

export type CheckPhoneResponse =
  | { success: true; exists: false }
  | { success: true; exists: true; is_paid: true; message: string; member_number?: string | null }
  | { success: true; exists: true; is_paid: false; data: Record<string, unknown> }
  | { success: false; message: string };

export type PaymentResponse =
  | {
      success: true;
      is_redirect: false;
      message: string;
      orderNumber: string;
    }
  | {
      success: true;
      is_redirect: true;
      url: string;
      params: Record<string, string>;
    }
  | { success: false; message: string; raw?: string };

export type PaymentStatusResponse =
  | {
      success: true;
      status: 'paid';
      memberNumber?: string;
      cardDownloadToken?: string;
      cardDownloadUrl?: string;
      cardDownloadPageUrl?: string;
    }
  | { success: true; status: 'pending' | 'failed'; message?: string }
  | { success: false; message: string };

export type DraftFormPatch = {
  stepOne: Partial<StepOneForm>;
  stepTwo: Partial<StepTwoForm>;
  stepThree: Partial<StepThreeForm>;
  stepFour: Partial<StepFourForm>;
  stepFive: Partial<StepFiveForm>;
};

function socialFlag(value: boolean): string {
  return value ? '1' : '';
}

function parseSocialFlag(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'on';
}

export function mapDraftToFormPatch(data: Record<string, unknown>): DraftFormPatch {
  return {
    stepOne: {
      firstname: String(data.firstname ?? ''),
      lastname: String(data.lastname ?? ''),
      postname: String(data.middlename ?? ''),
      gender: (data.gender as StepOneForm['gender']) || '',
      ageRange: String(data.age_range ?? data.age ?? ''),
    },
    stepTwo: {
      countryStatus: (data.country_status as StepTwoForm['countryStatus']) || 'RDC',
      province: String(data.province ?? ''),
      city: String(data.city ?? ''),
      town: String(data.town ?? ''),
      socialFb: parseSocialFlag(data.social_fb),
      socialX: parseSocialFlag(data.social_x),
      socialIg: parseSocialFlag(data.social_ig),
      socialTt: parseSocialFlag(data.social_tt),
    },
    stepThree: {
      occupation: String(data.occupation ?? ''),
      contribution: String(data.contribution ?? ''),
      merchBudget: String(data.merch ?? ''),
    },
    stepFour: {
      section: String(data.section ?? ''),
      years: data.years != null ? String(data.years) : '',
      trainingFreq: parseMultiSelectValue(data.training_freq),
      matchFreq: parseMultiSelectValue(data.match_freq),
      followMethod: parseMultiSelectValue(data.follow_method),
    },
    stepFive: {
      memberType: (data.member_type as MemberType) || 'simple',
    },
  };
}

export type RegistrationForms = {
  stepOne: StepOneForm;
  stepTwo: StepTwoForm;
  stepThree: StepThreeForm;
  stepFour: StepFourForm;
  stepFive: StepFiveForm;
};

function isBlank(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

function preferUserText(userValue: string, dbValue: unknown): string {
  if (!isBlank(userValue)) return userValue.trim();
  if (isBlank(dbValue)) return userValue;
  return String(dbValue).trim();
}

function preferUserBool(userValue: boolean, dbValue: boolean): boolean {
  return userValue || dbValue;
}

function preferUserMultiSelect(userValues: string[], dbValue: unknown): string[] {
  if (userValues.length > 0) return userValues;
  return parseMultiSelectValue(dbValue);
}

export function mergeDraftIntoForms(
  forms: RegistrationForms,
  data: Record<string, unknown>,
): RegistrationForms {
  const patch = mapDraftToFormPatch(data);

  return {
    stepOne: {
      ...forms.stepOne,
      firstname: preferUserText(forms.stepOne.firstname, data.firstname),
      lastname: preferUserText(forms.stepOne.lastname, data.lastname),
      postname: preferUserText(forms.stepOne.postname, data.middlename),
      gender: (preferUserText(forms.stepOne.gender, data.gender) ||
        '') as StepOneForm['gender'],
      ageRange: preferUserText(forms.stepOne.ageRange, data.age_range ?? data.age),
      phone: forms.stepOne.phone,
    },
    stepTwo: {
      ...forms.stepTwo,
      countryStatus: (preferUserText(forms.stepTwo.countryStatus, data.country_status) ||
        'RDC') as StepTwoForm['countryStatus'],
      province: preferUserText(forms.stepTwo.province, data.province),
      city: preferUserText(forms.stepTwo.city, data.city),
      town: preferUserText(forms.stepTwo.town, data.town),
      socialFb: preferUserBool(forms.stepTwo.socialFb, patch.stepTwo.socialFb ?? false),
      socialX: preferUserBool(forms.stepTwo.socialX, patch.stepTwo.socialX ?? false),
      socialIg: preferUserBool(forms.stepTwo.socialIg, patch.stepTwo.socialIg ?? false),
      socialTt: preferUserBool(forms.stepTwo.socialTt, patch.stepTwo.socialTt ?? false),
    },
    stepThree: {
      ...forms.stepThree,
      occupation: preferUserText(forms.stepThree.occupation, data.occupation),
      contribution: preferUserText(forms.stepThree.contribution, data.contribution),
      merchBudget: preferUserText(forms.stepThree.merchBudget, data.merch),
    },
    stepFour: {
      ...forms.stepFour,
      section: preferUserText(forms.stepFour.section, data.section),
      years: preferUserText(forms.stepFour.years, data.years),
      trainingFreq: preferUserMultiSelect(forms.stepFour.trainingFreq, data.training_freq),
      matchFreq: preferUserMultiSelect(forms.stepFour.matchFreq, data.match_freq),
      followMethod: preferUserMultiSelect(forms.stepFour.followMethod, data.follow_method),
    },
    stepFive: {
      ...forms.stepFive,
      memberType:
        (patch.stepFive.memberType as MemberType) || forms.stepFive.memberType || 'simple',
    },
  };
}

export function buildRegistrationPayload(
  stepOne: StepOneForm,
  stepTwo: StepTwoForm,
  stepThree: StepThreeForm,
  stepFour: StepFourForm,
  stepFive: StepFiveForm,
) {
  return {
    firstname: stepOne.firstname,
    lastname: stepOne.lastname,
    middlename: stepOne.postname.trim(),
    gender: stepOne.gender,
    age: stepOne.ageRange,
    phone_full: stepOne.phone,
    country_status: stepTwo.countryStatus,
    province: stepTwo.province,
    city: stepTwo.city,
    town: stepTwo.town,
    section: stepFour.section,
    occupation: stepThree.occupation,
    contribution: stepThree.contribution,
    merch: stepThree.merchBudget,
    years: stepFour.years,
    training_freq: serializeMultiSelect(stepFour.trainingFreq),
    match_freq: serializeMultiSelect(stepFour.matchFreq),
    follow_method: serializeMultiSelect(stepFour.followMethod),
    social_fb: socialFlag(stepTwo.socialFb),
    social_x: socialFlag(stepTwo.socialX),
    social_ig: socialFlag(stepTwo.socialIg),
    social_tt: socialFlag(stepTwo.socialTt),
    member_type: stepFive.memberType,
    currency: stepFive.currency,
    payment_type: stepFive.paymentType,
    payment_phone_full: toFlexpayPhone(stepFive.paymentPhone || stepOne.phone),
  };
}

export async function checkPhone(phone: string): Promise<CheckPhoneResponse> {
  const { data } = await api.post<CheckPhoneResponse>('/supporters/check-phone', { phone });
  return data;
}

export async function saveDraft(payload: Record<string, unknown>): Promise<{ success: boolean }> {
  const { data } = await api.post<{ success: boolean }>('/supporters/draft', payload);
  return data;
}

export async function createPayment(payload: Record<string, unknown>): Promise<PaymentResponse> {
  const { data } = await api.post<PaymentResponse>('/payments', payload);
  return data;
}

export async function checkPaymentStatus(paymentKey: string): Promise<PaymentStatusResponse> {
  const { data } = await api.get<PaymentStatusResponse>('/payments/status', {
    params: { order: paymentKey },
  });
  return data;
}

export function submitCardPayment(url: string, params: Record<string, string>): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;

  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value ?? '';
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
