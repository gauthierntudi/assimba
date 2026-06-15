import { api } from './client';
import { toFlexpayPhone } from '../utils/phone';
import type {
  StepFiveForm,
  StepFourForm,
  StepOneForm,
  StepThreeForm,
  StepTwoForm,
} from '../types/registration';

export type CheckPhoneResponse =
  | { success: true; exists: false }
  | { success: true; exists: true; is_paid: true; message: string }
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
  | { success: true; status: 'paid' | 'pending' | 'failed'; message?: string }
  | { success: false; message: string };

function socialFlag(value: boolean): string {
  return value ? '1' : '';
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
    middlename: stepOne.postname,
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
    training_freq: stepFour.trainingFreq,
    match_freq: stepFour.matchFreq,
    follow_method: stepFour.followMethod,
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

export async function checkPaymentStatus(order: string): Promise<PaymentStatusResponse> {
  const { data } = await api.get<PaymentStatusResponse>('/payments/status', {
    params: { order },
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
