import { z } from 'zod';

export const createMistakeSchema = z.object({
  questionId: z.string().min(1),
  reason: z.string().trim().min(3).max(240),
  howToFix: z.string().trim().max(1500).optional(),
});

export type CreateMistakeInput = z.infer<typeof createMistakeSchema>;
