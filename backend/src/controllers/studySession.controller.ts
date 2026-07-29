import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  CreateStudySessionInput,
  ListStudySessionsQuery,
} from '../validations/studySession.validation';
import { requiredParam } from '../utils/request';

export async function listStudySessions(req: Request, res: Response) {
  const query = (req as Request & { validatedQuery?: ListStudySessionsQuery }).validatedQuery ?? {};

  const where: Prisma.StudySessionWhereInput = {
    userId: req.userId,
    ...(query.subjectId && { subjectId: query.subjectId }),
    ...((query.from || query.to) && {
      date: {
        ...(query.from && { gte: query.from }),
        ...(query.to && { lte: query.to }),
      },
    }),
  };

  const sessions = await prisma.studySession.findMany({
    where,
    include: {
      subject: { select: { id: true, name: true, color: true } },
      topic: { select: { id: true, name: true } },
    },
    orderBy: { date: 'desc' },
  });

  return res.json({ sessions });
}

export async function createStudySession(req: Request, res: Response) {
  const data = req.body as CreateStudySessionInput;

  const subject = await prisma.subject.findFirst({
    where: { id: data.subjectId, userId: req.userId },
  });
  if (!subject) {
    throw new AppError('Matéria não encontrada.', 404);
  }

  if (data.topicId) {
    const topic = await prisma.topic.findFirst({
      where: { id: data.topicId, subjectId: data.subjectId, userId: req.userId },
    });
    if (!topic) {
      throw new AppError('Conteúdo não encontrado.', 404);
    }
  }

  const session = await prisma.studySession.create({
    data: {
      userId: req.userId!,
      subjectId: data.subjectId,
      topicId: data.topicId,
      durationMin: data.durationMin,
      date: data.date ?? new Date(),
      notes: data.notes,
    },
  });

  return res.status(201).json({ session });
}

export async function deleteStudySession(req: Request, res: Response) {
  const id = requiredParam(req, 'id');
  const existing = await prisma.studySession.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    throw new AppError('Sessão de estudo não encontrada.', 404);
  }

  await prisma.studySession.delete({ where: { id: existing.id } });

  return res.status(204).send();
}
