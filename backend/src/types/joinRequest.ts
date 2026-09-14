export type JoinRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface JoinRequest {
  id: string;
  room_id: string;
  student_id: string;
  message: string;
  status: JoinRequestStatus;
  created_at: Date;
  updated_at: Date;
}

export interface JoinRequestWithDetails extends JoinRequest {
  student: {
    id: string;
    name: string;
    college: string;
    course: string;
    year: number;
    phone: string;
    email: string;
  };
  room: {
    id: string;
    room_number: string;
    room_type: string;
    rent: number;
    capacity: number;
    pg_id: string;
    pg_name: string;
  };
}
