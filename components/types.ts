export type Gender = 'M' | 'F' | 'Other';
export type MaritalStatus = 'Single' | 'Married' | 'Unmarried' | 'Other';
export type RegistrationStatus = 'Registered' | 'Pending' | 'Verification Required';

export interface PatientMember {
  id: string;
  name: string;
  relation: string;
  sex: 'M' | 'F' | 'Other';
  age: string; // e.g. "7yrs", "32yrs"
  maritalStatus?: string; // e.g. "Married", ""
  registrationStatus: RegistrationStatus;
  mobileNumber: string;
  patientNumber: string;
  genderType: 'M' | 'F';
  customAvatarUri?: string;
  dateAdded?: string;
  dob?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  aadhaarNo?: string;
}

export interface UserSession {
  mobileNumber: string;
  name: string;
  isLoggedIn: boolean;
  customAvatarUri?: string;
  userAvatar?: any;
  healthPoints?: number;
}

export type AuthMode = 'login' | 'register';
export type LoginStep = 'mobile' | 'pin';
