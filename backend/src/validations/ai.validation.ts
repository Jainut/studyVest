import { z } from 'zod';

export const explainTopicSchema = z.object({
  topicName: z.string().trim().min(2).max(120),
  subjectName: z.string().trim().min(2).max(80),
});

export const generateExercisesSchema = z.object({
  topicName: z.string().trim().min(2).max(120),
  examType: z.enum(['FUVEST', 'ENEM']),
  quantity: z.number().int().min(1).max(10).default(5),
});

export const analyzeMistakesSchema = z.object({
  mistakes: z
    .array(
      z.object({
        reason: z.string().min(1),
        subject: z.string().min(1),
        topic: z.string().min(1),
      }),
    )
    .min(1)
    .max(100),
});
