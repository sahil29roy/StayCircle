import { z } from 'zod';

export const createPGSchema = z.object({
  name: z
    .string({ required_error: 'PG name is required' })
    .trim()
    .min(2, 'PG name must be at least 2 characters')
    .max(150, 'PG name must not exceed 150 characters'),
  description: z.string().trim().optional(),
  address: z
    .string({ required_error: 'Address is required' })
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(255, 'Address must not exceed 255 characters'),
  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters'),
  state: z
    .string({ required_error: 'State is required' })
    .trim()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must not exceed 100 characters'),
  pincode: z
    .string({ required_error: 'Pincode is required' })
    .trim()
    .regex(/^[0-9]{5,10}$/, 'Pincode must be between 5 and 10 digits'),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  genderAllowed: z.enum(['MALE', 'FEMALE', 'UNISEX'], {
    errorMap: () => ({ message: 'genderAllowed must be MALE, FEMALE, or UNISEX' }),
  }),
  foodAvailable: z.boolean().default(false),
  contactPhone: z
    .string({ required_error: 'Contact phone is required' })
    .trim()
    .regex(/^[0-9]{10,15}$/, 'Contact phone must be between 10 and 15 digits'),
  amenityIds: z.array(z.string().uuid('Invalid amenity UUID')).optional(),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url('Invalid image URL'),
        publicId: z.string().optional(),
        isPrimary: z.boolean().optional().default(false),
      })
    )
    .optional(),
});

export const updatePGSchema = createPGSchema.partial();

export const pgQueryFilterSchema = z.object({
  city: z.string().trim().optional(),
  minRent: z.coerce.number().min(0).optional(),
  maxRent: z.coerce.number().min(0).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'UNISEX']).optional(),
  food: z
    .preprocess((val) => {
      if (typeof val === 'string') return val.toLowerCase() === 'true';
      return val;
    }, z.boolean())
    .optional(),
  amenity: z.string().trim().optional(),
  minVacancy: z.coerce.number().int().min(1).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreatePGInput = z.infer<typeof createPGSchema>;
export type UpdatePGInput = z.infer<typeof updatePGSchema>;
export type PGQueryFilter = z.infer<typeof pgQueryFilterSchema>;
