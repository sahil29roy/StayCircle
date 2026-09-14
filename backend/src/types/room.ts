export type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_SHARING' | 'OTHER';

export interface Room {
  id: string;
  pg_id: string;
  room_number: string;
  room_type: RoomType;
  capacity: number;
  rent: number;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface RoomWithVacancy extends Room {
  occupied: number;
  vacant: number;
}

export interface RoomMember {
  id: string;
  room_id: string;
  student_id: string;
  joined_at: Date;
  left_at: Date | null;
  status: 'ACTIVE' | 'LEFT';
}

export interface RoomOccupantInfo {
  id: string;
  student_id: string;
  name: string;
  college: string;
  course: string;
  year: number;
  gender: string;
  food_preference: string | null;
  smoking_preference: string | null;
  sleep_schedule: string | null;
  cleanliness_preference: string | null;
  ac_preference: string | null;
  room_preference: string | null;
  joined_at: Date;
}
