import { z } from 'zod';

const topicStatus = z.enum(['PENDENTE', 'ESTUDANDO', 'REVISANDO', 'DOMINADO']);
const priority = z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']);
const difficulty = z.enum(['FACIL', 'MEDIO', 'DIFICIL']);

export const createTopicSchema = z.object({
  subjectId: z.string().min(1),
  parentId: z.string().min(1).optional(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  status: topicStatus.default('PENDENTE'),
  priority: priority.default('MEDIA'),
  difficulty: difficulty.default('MEDIO'),
  fuvestImportance: z.number().int().min(1).max(5).default(3),
  enemImportance: z.number().int().min(1).max(5).default(3),
});

export const updateTopicSchema = createTopicSchema
  .omit({ subjectId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Informe ao menos um campo.');

export const listTopicsQuerySchema = z.object({
  subjectId: z.string().optional(),
  status: topicStatus.optional(),
  priority: priority.optional(),
  overdue: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type ListTopicsQuery = z.infer<typeof listTopicsQuerySchema>;
