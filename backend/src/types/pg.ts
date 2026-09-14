export type GenderAllowed = 'MALE' | 'FEMALE' | 'UNISEX';

export interface Amenity {
  id: string;
  name: string;
  created_at: Date;
}

export interface PGImage {
  id: string;
  pg_id: string;
  image_url: string;
  public_id: string | null;
  is_primary: boolean;
  created_at: Date;
}

export interface PG {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  gender_allowed: GenderAllowed;
  food_available: boolean;
  contact_phone: string;
  created_at: Date;
  updated_at: Date;
}

export interface PGSummary extends PG {
  amenities: string[];
  min_rent?: number | null;
  max_rent?: number | null;
  total_capacity?: number;
  total_occupied?: number;
  total_vacant?: number;
  primary_image?: string | null;
}

export interface PGDetail extends PG {
  amenities: string[];
  images: PGImage[];
  rooms: any[];
  owner: {
    id: string;
    name: string;
    contact_phone: string;
  };
}

export interface PGFilters {
  city?: string;
  minRent?: number;
  maxRent?: number;
  gender?: GenderAllowed;
  food?: boolean;
  amenity?: string;
  minVacancy?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedPGResponse {
  data: PGSummary[];
  pagination: PaginationMetadata;
}
