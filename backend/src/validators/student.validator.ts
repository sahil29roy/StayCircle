import { z } from 'zod';

export const updateStudentPreferencesSchema = z
  .object({
    budgetMin: z.coerce.number().min(0).optional().nullable(),
    budgetMax: z.coerce.number().min(0).optional().nullable(),
    foodPreference: z
      .enum(['VEGETARIAN', 'NON_VEGETARIAN', 'EGGETARIAN', 'ANY'])
      .optional()
      .nullable(),
    smokingPreference: z
      .enum(['SMOKER', 'NON_SMOKER', 'OCCASIONAL', 'ANY'])
      .optional()
      .nullable(),
    sleepSchedule: z
      .enum(['EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE', 'NORMAL'])
      .optional()
      .nullable(),
    cleanlinessPreference: z
      .enum(['HIGH', 'MODERATE', 'LOW'])
      .optional()
      .nullable(),
    acPreference: z
      .enum(['REQUIRED', 'PREFERRED', 'NOT_REQUIRED'])
      .optional()
      .nullable(),
    roomPreference: z
      .enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_SHARING', 'ANY'])
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (
        data.budgetMin !== undefined &&
        data.budgetMin !== null &&
        data.budgetMax !== undefined &&
        data.budgetMax !== null
      ) {
        return data.budgetMin <= data.budgetMax;
      }
      return true;
    },
    {
      message: 'budgetMin cannot be greater than budgetMax',
      path: ['budgetMin'],
    }
  );

export type UpdateStudentPreferencesInput = z.infer<
  typeof updateStudentPreferencesSchema
>;
