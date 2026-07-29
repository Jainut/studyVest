import { Request } from 'express';
import { AppError } from './AppError';

export function requiredParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || !value) {
    throw new AppError(`Parâmetro obrigatório ausente: ${name}.`, 400);
  }
  return value;
}
