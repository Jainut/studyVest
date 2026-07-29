import { z } from 'zod';

export const createStudySessionSchema = z.object({
  subjectId: z.string().min(1),
  topicId: z.string().min(1).optional(),
  durationMin: z.number().int().min(1).max(1440),
  date: z.coerce.date().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const listStudySessionsQuerySchema = z.object({
  subjectId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>;
export type ListStudySessionsQuery = z.infer<typeof listStudySessionsQuerySchema>;
