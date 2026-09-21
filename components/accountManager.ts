import { INITIAL_PATIENTS } from './mockData';
import { PatientMember, UserSession } from './types';
import IMAGES from './imageAssets';

/**
 * 🔄 Relationship Matrix for Family Member Account Switching
 * Defines relative relations when any member is chosen as 'Self'.
 * 
 * Default Members:
 * 1 = Rathi Vijay Sharma (M, 34Y)
 * 2 = Kavita Chouhan (F, 28Y)
 * 3 = Aarav Chouhan (M, 8Y)
 * 4 = Deepak Chouhan (M, 30Y)
 */
const DEFAULT_RELATION_MATRIX: Record<string, Record<string, string>> = {
  '1': { // Rathi Vijay Sharma is Self
    '1': 'Self',
    '2': 'Wife',
    '3': 'Son',
    '4': 'Brother',
    '5': 'Father',
  },
  '2': { // Kavita Chouhan is Self
    '1': 'Husband',
    '2': 'Self',
    '3': 'Son',
    '4': 'Brother-in-law',
    '5': 'Father-in-law',
  },
  '3': { // Aarav Chouhan is Self
    '1': 'Father',
    '2': 'Mother',
    '3': 'Self',
    '4': 'Uncle',
    '5': 'Grandfather',
  },
  '4': { // Deepak Chouhan is Self
    '1': 'Brother',
    '2': 'Sister-in-law',
    '3': 'Nephew',
    '4': 'Self',
    '5': 'Father',
  },
  '5': { // Chandan Chouhan is Self
    '1': 'Son',
    '2': 'Daughter-in-law',
    '3': 'Grandson',
    '4': 'Son',
    '5': 'Self',
  },
};

/**
 * Get current active member who has relation === 'Self'
 */
export function getActiveMember(): PatientMember {
  return INITIAL_PATIENTS.find((p) => p.relation.toLowerCase() === 'self') || INITIAL_PATIENTS[0];
}

/**
 * Switch active account to target member ID
 * Re-calculates all relations in INITIAL_PATIENTS relative to target member.
 */
export function switchActiveAccount(targetMemberId: string): { activeMember: PatientMember; updatedPatients: PatientMember[] } {
  const target = INITIAL_PATIENTS.find((p) => p.id === targetMemberId) || INITIAL_PATIENTS[0];

  INITIAL_PATIENTS.forEach((p) => {
    if (p.id === target.id) {
      p.relation = 'Self';
    } else if (DEFAULT_RELATION_MATRIX[target.id] && DEFAULT_RELATION_MATRIX[target.id][p.id]) {
      p.relation = DEFAULT_RELATION_MATRIX[target.id][p.id];
    } else {
      // Dynamic fallback for custom added family members
      if (p.genderType === 'F') {
        p.relation = p.age && parseInt(p.age) < 18 ? 'Daughter' : 'Relative (Female)';
      } else {
        p.relation = p.age && parseInt(p.age) < 18 ? 'Son' : 'Relative (Male)';
      }
    }
  });

  return {
    activeMember: target,
    updatedPatients: [...INITIAL_PATIENTS],
  };
}

/**
 * Get avatar source image for a given patient member
 */
export function getAvatarForMember(patient: PatientMember): any {
  if (patient.id === '2' || patient.name.toLowerCase().includes('kavita')) {
    return IMAGES.avatarKavita;
  }
  if (patient.id === '3' || patient.name.toLowerCase().includes('aarav')) {
    return IMAGES.avatarAarav;
  }
  if (patient.id === '4' || patient.name.toLowerCase().includes('deepak')) {
    return IMAGES.avatarDeepak;
  }
  if (patient.genderType === 'F') {
    return IMAGES.avatarFemale;
  }
  return IMAGES.avatarMale;
}
