import { z } from 'zod';

export const createRoomSchema = z.object({
  roomNumber: z
    .string({ required_error: 'Room number is required' })
    .trim()
    .min(1, 'Room number cannot be empty')
    .max(50, 'Room number must not exceed 50 characters'),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_SHARING', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid room type' }),
  }),
  capacity: z.coerce
    .number({ required_error: 'Capacity is required' })
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1'),
  rent: z.coerce
    .number({ required_error: 'Rent is required' })
    .min(0, 'Rent cannot be negative'),
  description: z.string().trim().optional(),
});

export const updateRoomSchema = createRoomSchema.partial();

export const assignMemberSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type AssignMemberInput = z.infer<typeof assignMemberSchema>;
