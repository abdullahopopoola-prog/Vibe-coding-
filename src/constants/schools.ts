export const SCHOOLS = [
  'ABU',
  'ATBU',
  'BUK',
  'EKSU',
  'FEDPOFFA',
  'FUNAAB',
  'FUOYE',
  'FUTA',
  'FUTMINNA',
  'KWARAPOLY',
  'KWASU',
  'LASU',
  'LASUSTECH',
  'LAUTECH',
  'OAU',
  'OOU',
  'POLY IBADAN',
  'SUMMIT',
  'TECH-U',
  'UI',
  'UNIABUJA',
  'UNILAG',
  'UNILORIN',
  'UNIOSUN',
] as const;

export const CUSTOM_SCHOOL_VALUE = '__other__';

export type FrameShape = 'circle' | 'square';

export interface FlyerState {
  fullName: string;
  selectedSchool: string;
  customSchool: string;
  shape: FrameShape;
  image: HTMLImageElement | null;
}

export function resolveSchoolLabel(selectedSchool: string, customSchool: string): string {
  if (selectedSchool === CUSTOM_SCHOOL_VALUE) {
    return customSchool.trim();
  }
  return selectedSchool.trim();
}

export function buildSocialCaption(fullName: string, schoolLabel: string): string {
  const cleanName = fullName.trim();
  const cleanSchool = schoolLabel.trim() || 'my institution';
  const intro = cleanName
    ? `${cleanName} will be attending AMETTSA 5.0 — Annual Convention & 5th Anniversary!`
    : 'I’ll be attending AMETTSA 5.0 — Annual Convention & 5th Anniversary!';

  return `${intro}\n\nRepresenting ${cleanSchool} at Summit University, Offa from 26th–30th November, 2026.\n\n#AMETTSA5 #AMETTSA #MuslimEngineers #SmartTechnology`;
}
