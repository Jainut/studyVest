import { z } from 'zod';

const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Use uma cor hexadecimal com 6 dígitos.');

export const createSubjectSchema = z.object({
  name: z.string().trim().min(2).max(60),
  color: colorSchema.default('#315C8A'),
});

export const updateSubjectSchema = createSubjectSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'Informe ao menos um campo.',
);

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
