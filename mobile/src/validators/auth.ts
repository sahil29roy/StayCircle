import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string({ message: 'Password is required' })
    .min(1, 'Password is required'),
});

const baseRegisterSchema = z.object({
  name: z
    .string({ message: 'Full name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  phone: z
    .string({ message: 'Phone number is required' })
    .trim()
    .regex(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits'),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z
    .string({ message: 'Please confirm your password' })
    .min(1, 'Please confirm your password'),
});

export const studentRegisterSchema = baseRegisterSchema
  .extend({
    role: z.literal('STUDENT'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
      message: 'Please select gender',
    }),
    college: z
      .string({ message: 'College name is required' })
      .trim()
      .min(2, 'College name must be at least 2 characters'),
    course: z
      .string({ message: 'Course name is required' })
      .trim()
      .min(2, 'Course name must be at least 2 characters'),
    year: z.coerce
      .number({ message: 'Year of study is required' })
      .int('Year must be an integer')
      .min(1, 'Year must be at least 1')
      .max(6, 'Year must not exceed 6'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const ownerRegisterSchema = baseRegisterSchema
  .extend({
    role: z.literal('OWNER'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type StudentRegisterFormValues = z.infer<typeof studentRegisterSchema>;
export type OwnerRegisterFormValues = z.infer<typeof ownerRegisterSchema>;

