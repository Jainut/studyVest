import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { CreateSubjectInput, UpdateSubjectInput } from '../validations/subject.validation';
import { requiredParam } from '../utils/request';

export async function listSubjects(req: Request, res: Response) {
  const subjects = await prisma.subject.findMany({
    where: { userId: req.userId },
    include: {
      _count: { select: { topics: true } },
    },
    orderBy: { name: 'asc' },
  });

  return res.json({ subjects });
}

export async function getSubject(req: Request, res: Response) {
  const id = requiredParam(req, 'id');
  const subject = await prisma.subject.findFirst({
    where: { id, userId: req.userId },
    include: { topics: true },
  });

  if (!subject) {
    throw new AppError('Matéria não encontrada.', 404);
  }

  return res.json({ subject });
}

export async function createSubject(req: Request, res: Response) {
  const { name, color } = req.body as CreateSubjectInput;

  const subject = await prisma.subject.create({
    data: { name, color, userId: req.userId! },
  });

  return res.status(201).json({ subject });
}

export async function updateSubject(req: Request, res: Response) {
  const data = req.body as UpdateSubjectInput;
  const id = requiredParam(req, 'id');

  const existing = await prisma.subject.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    throw new AppError('Matéria não encontrada.', 404);
  }

  const subject = await prisma.subject.update({
    where: { id: existing.id },
    data,
  });

  return res.json({ subject });
}

export async function deleteSubject(req: Request, res: Response) {
  const id = requiredParam(req, 'id');
  const existing = await prisma.subject.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    throw new AppError('Matéria não encontrada.', 404);
  }

  await prisma.subject.delete({ where: { id: existing.id } });

  return res.status(204).send();
}
