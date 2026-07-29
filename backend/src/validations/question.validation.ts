import { z } from 'zod';

const examType = z.enum(['FUVEST', 'ENEM', 'OUTRO']);
const difficulty = z.enum(['FACIL', 'MEDIO', 'DIFICIL']);

export const createQuestionSchema = z.object({
  topicId: z.string().min(1),
  examType,
  year: z.number().int().min(1950).max(2100).optional(),
  institution: z.string().trim().max(80).optional(),
  difficulty: difficulty.default('MEDIO'),
  isCorrect: z.boolean(),
  timeSpentSec: z.number().int().min(1).max(21600).optional(),
  errorNote: z.string().trim().max(1500).optional(),
});

export const listQuestionsQuerySchema = z.object({
  topicId: z.string().optional(),
  subjectId: z.string().optional(),
  examType: examType.optional(),
  isCorrect: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type ListQuestionsQuery = z.infer<typeof listQuestionsQuerySchema>;
