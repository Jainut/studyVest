import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { signToken } from '../utils/jwt';
import {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from '../validations/auth.validation';

export async function register(req: Request, res: Response) {
  const { name, email, password, dailyGoalMin } = req.body as RegisterInput;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Já existe uma conta com este e-mail.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      dailyGoalMin: dailyGoalMin ?? 360,
    },
  });

  const token = signToken({ userId: user.id });

  return res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      dailyGoalMin: user.dailyGoalMin,
    },
    token,
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('E-mail ou senha incorretos.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError('E-mail ou senha incorretos.', 401);
  }

  const token = signToken({ userId: user.id });

  return res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      dailyGoalMin: user.dailyGoalMin,
    },
    token,
  });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, dailyGoalMin: true, createdAt: true },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  return res.json({ user });
}

export async function updateProfile(req: Request, res: Response) {
  const data = req.body as UpdateProfileInput;

  const user = await prisma.user.update({
    where: { id: req.userId! },
    data,
    select: { id: true, name: true, email: true, dailyGoalMin: true, createdAt: true },
  });

  return res.json({ user });
}
