export type Gender = 'M' | 'F' | 'A' | '';

export type CountryStatus = 'RDC' | 'HORS_RDC';

export type StepOneForm = {
  firstname: string;
  lastname: string;
  postname: string;
  gender: Gender;
  ageRange: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  birthPlace: string;
  email: string;
  phone: string;
  city: string;
};

export type StepTwoForm = {
  countryStatus: CountryStatus;
  province: string;
  city: string;
  town: string;
  socialFb: boolean;
  socialIg: boolean;
  socialTt: boolean;
  socialX: boolean;
};

export type StepThreeForm = {
  occupation: string;
  contribution: string;
  merchBudget: string;
};

export type StepFourForm = {
  section: string;
  years: string;
  trainingFreq: string[];
  matchFreq: string[];
  followMethod: string[];
};

export type MemberType = 'simple' | 'premium';
export type PaymentCurrency = 'CDF' | 'USD';
export type PaymentType = '1' | '2';

export type StepFiveForm = {
  memberType: MemberType;
  currency: PaymentCurrency;
  paymentType: PaymentType;
  paymentPhone: string;
};

export const initialStepOneForm: StepOneForm = {
  firstname: '',
  lastname: '',
  postname: '',
  gender: '',
  ageRange: '',
  birthDay: '',
  birthMonth: '',
  birthYear: '',
  birthPlace: '',
  email: '',
  phone: '',
  city: '',
};

export const initialStepTwoForm: StepTwoForm = {
  countryStatus: 'RDC',
  province: '',
  city: '',
  town: '',
  socialFb: false,
  socialIg: false,
  socialTt: false,
  socialX: false,
};

export const initialStepThreeForm: StepThreeForm = {
  occupation: '',
  contribution: '',
  merchBudget: '',
};

export const initialStepFourForm: StepFourForm = {
  section: '',
  years: '',
  trainingFreq: [],
  matchFreq: [],
  followMethod: [],
};

export const initialStepFiveForm: StepFiveForm = {
  memberType: 'simple',
  currency: 'CDF',
  paymentType: '1',
  paymentPhone: '',
};
