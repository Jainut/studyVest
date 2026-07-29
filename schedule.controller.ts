import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  CreateScheduleInput,
  ListSchedulesQuery,
  UpdateScheduleInput,
} from '../validations/schedule.validation';

export async function listSchedules(req: Request, res: Response) {
  const query = (req as Request & { validatedQuery?: ListSchedulesQuery }).validatedQuery ?? {};

  const where: Prisma.ScheduleWhereInput = {
    userId: req.userId,
    ...(query.status && { status: query.status }),
    ...((query.from || query.to) && {
      date: {
        ...(query.from && { gte: query.from }),
        ...(query.to && { lte: query.to }),
      },
    }),
  };

  const schedules = await prisma.schedule.findMany({
    where,
    include: { subject: true, topic: true },
    orderBy: { date: 'asc' },
  });

  return res.json({ schedules });
}

export async function createSchedule(req: Request, res: Response) {
  const data = req.body as CreateScheduleInput;

  const subject = await prisma.subject.findFirst({ where: { id: data.subjectId, userId: req.userId } });
  if (!subject) {
    throw new AppError('Matéria não encontrada.', 404);
  }

  const schedule = await prisma.schedule.create({
    data: { ...data, userId: req.userId! },
  });

  return res.status(201).json({ schedule });
}

export async function updateSchedule(req: Request, res: Response) {
  const data = req.body as UpdateScheduleInput;

  const existing = await prisma.schedule.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!existing) {
    throw new AppError('Bloco de estudo não encontrado.', 404);
  }

  const schedule = await prisma.schedule.update({ where: { id: existing.id }, data });

  return res.json({ schedule });
}

export async function deleteSchedule(req: Request, res: Response) {
  const existing = await prisma.schedule.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!existing) {
    throw new AppError('Bloco de estudo não encontrado.', 404);
  }

  await prisma.schedule.delete({ where: { id: existing.id } });

  return res.status(204).send();
}

/**
 * GET /schedules/suggestions
 * Sugestão automática de blocos de estudo para hoje, priorizando:
 * 1) conteúdos com revisão atrasada
 * 2) conteúdos de prioridade ALTA/URGENTE ainda não dominados
 * 3) matérias com pior desempenho em questões
 * Distribui os blocos até preencher a meta diária do usuário (ou minutesAvailable via query).
 */
export async function getScheduleSuggestions(req: Request, res: Response) {
  const userId = req.userId!;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const minutesAvailable = Number(req.query.minutes ?? user?.dailyGoalMin ?? 360);

  const BLOCK_MIN = 50;
  const blocks: Array<{
    subjectId: string;
    subjectName: string;
    topicId?: string;
    topicName?: string;
    durationMin: number;
    reason: string;
  }> = [];

  let remaining = minutesAvailable;

  // 1) Revisões atrasadas primeiro
  const overdueReviews = await prisma.review.findMany({
    where: { userId, status: 'ATRASADA' },
    include: { topic: { include: { subject: true } } },
    orderBy: { dueDate: 'asc' },
  });

  for (const review of overdueReviews) {
    if (remaining <= 0) break;
    const duration = Math.min(30, remaining);
    blocks.push({
      subjectId: review.topic.subjectId,
      subjectName: review.topic.subject.name,
      topicId: review.topicId,
      topicName: review.topic.name,
      durationMin: duration,
      reason: 'Revisão atrasada',
    });
    remaining -= duration;
  }

  // 2) Conteúdos de prioridade alta/urgente ainda não dominados
  if (remaining > 0) {
    const priorityTopics = await prisma.topic.findMany({
      where: {
        userId,
        status: { not: 'DOMINADO' },
        priority: { in: ['URGENTE', 'ALTA'] },
      },
      include: { subject: true },
      orderBy: { priority: 'desc' },
      take: 10,
    });

    for (const topic of priorityTopics) {
      if (remaining <= 0) break;
      const duration = Math.min(BLOCK_MIN, remaining);
      blocks.push({
        subjectId: topic.subjectId,
        subjectName: topic.subject.name,
        topicId: topic.id,
        topicName: topic.name,
        durationMin: duration,
        reason: `Prioridade ${topic.priority.toLowerCase()}`,
      });
      remaining -= duration;
    }
  }

  // 3) Preenche o tempo restante com as matérias de pior desempenho em questões
  if (remaining > 0) {
    const questions = await prisma.question.findMany({
      where: { userId },
      select: { isCorrect: true, topic: { select: { subjectId: true, subject: { select: { name: true } } } } },
    });

    const perfBySubject = new Map<string, { name: string; total: number; correct: number }>();
    for (const q of questions) {
      const id = q.topic.subjectId;
      const bucket = perfBySubject.get(id) ?? { name: q.topic.subject.name, total: 0, correct: 0 };
      bucket.total += 1;
      if (q.isCorrect) bucket.correct += 1;
      perfBySubject.set(id, bucket);
    }

    const worstSubjects = Array.from(perfBySubject.entries())
      .map(([subjectId, v]) => ({ subjectId, ...v, accuracy: v.correct / v.total }))
      .sort((a, b) => a.accuracy - b.accuracy);

    for (const s of worstSubjects) {
      if (remaining <= 0) break;
      const duration = Math.min(BLOCK_MIN, remaining);
      blocks.push({
        subjectId: s.subjectId,
        subjectName: s.name,
        durationMin: duration,
        reason: `Baixo desempenho em questões (${Math.round(s.accuracy * 100)}% de acerto)`,
      });
      remaining -= duration;
    }
  }

  return res.json({
    minutesAvailable,
    minutesAllocated: minutesAvailable - remaining,
    minutesRemaining: remaining,
    suggestedBlocks: blocks,
  });
}
