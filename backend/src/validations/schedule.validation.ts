import { z } from 'zod';

const scheduleStatus = z.enum(['PLANEJADO', 'CONCLUIDO', 'CANCELADO']);

export const createScheduleSchema = z.object({
  subjectId: z.string().min(1),
  topicId: z.string().min(1).optional(),
  title: z.string().trim().max(120).optional(),
  date: z.coerce.date(),
  durationMin: z.number().int().min(5).max(720),
  status: scheduleStatus.default('PLANEJADO'),
  notes: z.string().trim().max(1000).optional(),
});

export const updateScheduleSchema = createScheduleSchema
  .omit({ subjectId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Informe ao menos um campo.');

export const listSchedulesQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  status: scheduleStatus.optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type ListSchedulesQuery = z.infer<typeof listSchedulesQuerySchema>;
