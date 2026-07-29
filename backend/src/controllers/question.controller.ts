import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { CreateQuestionInput, ListQuestionsQuery } from '../validations/question.validation';
import { adjustReviewOnMistake } from '../services/spacedRepetition.service';
import { requiredParam } from '../utils/request';

export async function listQuestions(req: Request, res: Response) {
  const query = (req as Request & { validatedQuery?: ListQuestionsQuery }).validatedQuery ?? {};

  const where: Prisma.QuestionWhereInput = {
    userId: req.userId,
    ...(query.topicId && { topicId: query.topicId }),
    ...(query.examType && { examType: query.examType }),
    ...(query.isCorrect !== undefined && { isCorrect: query.isCorrect }),
    ...(query.subjectId && { topic: { subjectId: query.subjectId } }),
  };

  const questions = await prisma.question.findMany({
    where,
    include: { topic: { include: { subject: true } }, mistake: true },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ questions });
}

export async function createQuestion(req: Request, res: Response) {
  const data = req.body as CreateQuestionInput;

  const topic = await prisma.topic.findFirst({
    where: { id: data.topicId, userId: req.userId },
  });
  if (!topic) {
    throw new AppError('Conteúdo não encontrado.', 404);
  }

  const question = await prisma.question.create({
    data: {
      userId: req.userId!,
      topicId: data.topicId,
      examType: data.examType,
      year: data.year,
      institution: data.institution,
      difficulty: data.difficulty ?? 'MEDIO',
      isCorrect: data.isCorrect,
      timeSpentSec: data.timeSpentSec,
      errorNote: data.errorNote,
    },
  });

  // Errou a questão: antecipa a revisão desse conteúdo (repetição espaçada reativa)
  if (!data.isCorrect) {
    await adjustReviewOnMistake(data.topicId, req.userId!);
  }

  return res.status(201).json({ question });
}

export async function deleteQuestion(req: Request, res: Response) {
  const id = requiredParam(req, 'id');
  const existing = await prisma.question.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    throw new AppError('Questão não encontrada.', 404);
  }

  await prisma.question.delete({ where: { id: existing.id } });

  return res.status(204).send();
}

/**
 * GET /questions/statistics
 * Estatísticas agrupadas por Matéria > Conteúdo, no formato:
 * Matemática > Geometria: 70 questões, 42 acertos, 60%
 */
export async function getQuestionStatistics(req: Request, res: Response) {
  const questions = await prisma.question.findMany({
    where: { userId: req.userId },
    include: { topic: { include: { subject: true } } },
  });

  type Bucket = { subject: string; topic: string; topicId: string; total: number; correct: number };
  const buckets = new Map<string, Bucket>();

  for (const q of questions) {
    const key = q.topicId;
    const bucket = buckets.get(key) ?? {
      subject: q.topic.subject.name,
      topic: q.topic.name,
      topicId: q.topicId,
      total: 0,
      correct: 0,
    };
    bucket.total += 1;
    if (q.isCorrect) bucket.correct += 1;
    buckets.set(key, bucket);
  }

  const statistics = Array.from(buckets.values())
    .map((b) => ({
      ...b,
      accuracyPercent: Math.round((b.correct / b.total) * 100),
      // Prioridade de revisão: quanto menor a taxa de acerto, maior a prioridade
      reviewPriority: Math.round(100 - (b.correct / b.total) * 100),
    }))
    .sort((a, b) => b.reviewPriority - a.reviewPriority);

  // Agrupado também por matéria, para exibição em árvore
  const bySubject = new Map<string, typeof statistics>();
  for (const s of statistics) {
    const list = bySubject.get(s.subject) ?? [];
    list.push(s);
    bySubject.set(s.subject, list);
  }

  return res.json({
    flat: statistics,
    bySubject: Array.from(bySubject.entries()).map(([subject, topics]) => ({ subject, topics })),
  });
}
