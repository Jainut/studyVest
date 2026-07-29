import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { CreateTopicInput, ListTopicsQuery, UpdateTopicInput } from '../validations/topic.validation';
import { generateInitialReviews } from '../services/spacedRepetition.service';

export async function listTopics(req: Request, res: Response) {
  const query = (req as Request & { validatedQuery?: ListTopicsQuery }).validatedQuery ?? {};

  const where: Prisma.TopicWhereInput = {
    userId: req.userId,
    ...(query.subjectId && { subjectId: query.subjectId }),
    ...(query.status && { status: query.status }),
    ...(query.priority && { priority: query.priority }),
    ...(query.overdue && {
      nextReviewDate: { lte: new Date() },
      status: { not: 'DOMINADO' },
    }),
  };

  const topics = await prisma.topic.findMany({
    where,
    include: { subject: true },
    orderBy: [{ priority: 'desc' }, { nextReviewDate: 'asc' }],
  });

  return res.json({ topics });
}

export async function getTopic(req: Request, res: Response) {
  const topic = await prisma.topic.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: { subject: true, subtopics: true, reviews: true },
  });

  if (!topic) {
    throw new AppError('Conteúdo não encontrado.', 404);
  }

  return res.json({ topic });
}

export async function createTopic(req: Request, res: Response) {
  const data = req.body as CreateTopicInput;

  // garante que a matéria pertence ao usuário
  const subject = await prisma.subject.findFirst({
    where: { id: data.subjectId, userId: req.userId },
  });
  if (!subject) {
    throw new AppError('Matéria não encontrada.', 404);
  }

  const topic = await prisma.topic.create({
    data: {
      ...data,
      userId: req.userId!,
    },
  });

  return res.status(201).json({ topic });
}

export async function updateTopic(req: Request, res: Response) {
  const data = req.body as UpdateTopicInput;

  const existing = await prisma.topic.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    throw new AppError('Conteúdo não encontrado.', 404);
  }

  // Se o status virou DOMINADO e ainda não tem data de estudo, marca agora
  const shouldSetStudyDate = data.status === 'DOMINADO' && !existing.studyDate;

  const topic = await prisma.topic.update({
    where: { id: existing.id },
    data: {
      ...data,
      ...(shouldSetStudyDate && { studyDate: new Date() }),
    },
  });

  return res.json({ topic });
}

/**
 * Marca um conteúdo como "estudado pela primeira vez" e dispara a criação
 * automática das revisões de repetição espaçada (D+1, D+7, D+30).
 */
export async function completeTopic(req: Request, res: Response) {
  const existing = await prisma.topic.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    throw new AppError('Conteúdo não encontrado.', 404);
  }

  await prisma.topic.update({
    where: { id: existing.id },
    data: { studyDate: existing.studyDate ?? new Date() },
  });

  const reviews = await generateInitialReviews(existing.id, req.userId!);

  const topic = await prisma.topic.findUnique({ where: { id: existing.id } });

  return res.json({ topic, reviews });
}

export async function deleteTopic(req: Request, res: Response) {
  const existing = await prisma.topic.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    throw new AppError('Conteúdo não encontrado.', 404);
  }

  await prisma.topic.delete({ where: { id: existing.id } });

  return res.status(204).send();
}
