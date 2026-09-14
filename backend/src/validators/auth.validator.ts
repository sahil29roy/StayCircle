import { z } from 'zod';

const baseUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must not exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address')
    .toLowerCase(),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(/^[0-9]{10,15}$/, 'Phone number must be between 10 and 15 digits'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must not exceed 100 characters'),
});

const studentRegistrationSchema = baseUserSchema.extend({
  role: z.literal('STUDENT'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    errorMap: () => ({ message: 'Gender must be MALE, FEMALE, or OTHER' }),
  }),
  college: z
    .string({ required_error: 'College name is required' })
    .trim()
    .min(2, 'College name must be at least 2 characters long')
    .max(150, 'College name must not exceed 150 characters'),
  course: z
    .string({ required_error: 'Course is required' })
    .trim()
    .min(2, 'Course must be at least 2 characters long')
    .max(100, 'Course must not exceed 100 characters'),
  year: z.coerce
    .number({ required_error: 'Year of study is required' })
    .int('Year must be an integer')
    .min(1, 'Year must be at least 1')
    .max(6, 'Year must not exceed 6'),
});

const ownerRegistrationSchema = baseUserSchema.extend({
  role: z.literal('OWNER'),
});

export const registerSchema = z.discriminatedUnion('role', [
  studentRegistrationSchema,
  ownerRegistrationSchema,
]);

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type StudentRegisterInput = z.infer<typeof studentRegistrationSchema>;
export type OwnerRegisterInput = z.infer<typeof ownerRegistrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
