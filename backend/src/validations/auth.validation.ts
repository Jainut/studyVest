import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(80),
  email: z.string().trim().email('Informe um e-mail válido.').toLowerCase(),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.').max(100),
  dailyGoalMin: z.number().int().min(30).max(720).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.').toLowerCase(),
  password: z.string().min(1, 'Informe sua senha.'),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    dailyGoalMin: z.number().int().min(30).max(720).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'Informe ao menos um campo.');

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
