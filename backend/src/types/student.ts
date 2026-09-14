export type FoodPreference = 'VEGETARIAN' | 'NON_VEGETARIAN' | 'EGGETARIAN' | 'ANY';
export type SmokingPreference = 'SMOKER' | 'NON_SMOKER' | 'OCCASIONAL' | 'ANY';
export type SleepSchedule = 'EARLY_BIRD' | 'NIGHT_OWL' | 'FLEXIBLE' | 'NORMAL';
export type CleanlinessPreference = 'HIGH' | 'MODERATE' | 'LOW';
export type AcPreference = 'REQUIRED' | 'PREFERRED' | 'NOT_REQUIRED';
export type RoomPreference = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_SHARING' | 'ANY';

export interface StudentPreferences {
  budget_min?: number | null;
  budget_max?: number | null;
  food_preference?: FoodPreference | null;
  smoking_preference?: SmokingPreference | null;
  sleep_schedule?: SleepSchedule | null;
  cleanliness_preference?: CleanlinessPreference | null;
  ac_preference?: AcPreference | null;
  room_preference?: RoomPreference | null;
}

export interface CompatibilityBreakdown {
  budget: { score: number; max: number };
  lifestyle: { score: number; max: number };
  food: { score: number; max: number };
  sleep: { score: number; max: number };
  cleanliness: { score: number; max: number };
  room: { score: number; max: number };
  other: { score: number; max: number };
}

export interface RoommateCompatibility {
  studentId: string;
  name: string;
  college: string;
  course: string;
  year: number;
  compatibilityScore: number;
  breakdown: CompatibilityBreakdown;
}

export interface RoomMatchingResult {
  roomId: string;
  roomNumber: string;
  averageCompatibilityScore: number | null;
  roommates: RoommateCompatibility[];
  message?: string;
}
