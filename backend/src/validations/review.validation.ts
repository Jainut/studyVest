import { z } from 'zod';

export const completeReviewSchema = z.object({
  performance: z.number().int().min(0).max(100).optional(),
});

export type CompleteReviewInput = z.infer<typeof completeReviewSchema>;
