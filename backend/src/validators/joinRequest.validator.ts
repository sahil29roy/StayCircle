import { z } from 'zod';

export const createJoinRequestSchema = z.object({
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(2, 'Message must be at least 2 characters')
    .max(500, 'Message cannot exceed 500 characters'),
});

export const updateJoinRequestStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be ACCEPTED or REJECTED' }),
  }),
});

export type CreateJoinRequestInput = z.infer<typeof createJoinRequestSchema>;
export type UpdateJoinRequestStatusInput = z.infer<
  typeof updateJoinRequestStatusSchema
>;
