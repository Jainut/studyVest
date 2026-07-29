import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

/**
 * Valida req.body contra um schema Zod.
 * Em caso de sucesso, substitui req.body pelo dado já parseado/tipado.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Dados inválidos.', 422, result.error.flatten());
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      throw new AppError('Parâmetros de busca inválidos.', 422, result.error.flatten());
    }

    // guarda separado pois req.query é somente leitura em algumas versões do Express
    (req as Request & { validatedQuery?: unknown }).validatedQuery = result.data;
    next();
  };
}
