import { z } from 'zod';

const competency = z.number().int().min(0).max(200).optional();

export const createEssaySchema = z.object({
  theme: z.string().trim().min(3).max(240),
  date: z.coerce.date().optional(),
  score: z.number().int().min(0).max(1000).optional(),
  comp1: competency,
  comp2: competency,
  comp3: competency,
  comp4: competency,
  comp5: competency,
  feedback: z.string().trim().max(4000).optional(),
});

export const updateEssaySchema = createEssaySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'Informe ao menos um campo.',
);

export type CreateEssayInput = z.infer<typeof createEssaySchema>;
export type UpdateEssayInput = z.infer<typeof updateEssaySchema>;
