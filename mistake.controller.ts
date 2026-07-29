import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { CreateMistakeInput } from '../validations/mistake.validation';

export async function listMistakes(req: Request, res: Response) {
  const mistakes = await prisma.mistake.findMany({
    where: { userId: req.userId },
    include: {
      question: { include: { topic: { include: { subject: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ mistakes });
}

export async function createMistake(req: Request, res: Response) {
  const data = req.body as CreateMistakeInput;

  const question = await prisma.question.findFirst({
    where: { id: data.questionId, userId: req.userId },
  });
  if (!question) {
    throw new AppError('Questão não encontrada.', 404);
  }
  if (question.isCorrect) {
    throw new AppError('Só é possível registrar erro para uma questão marcada como errada.', 422);
  }

  const existingMistake = await prisma.mistake.findUnique({ where: { questionId: data.questionId } });
  if (existingMistake) {
    throw new AppError('Já existe um registro de erro para esta questão.', 409);
  }

  const mistake = await prisma.mistake.create({
    data: {
      userId: req.userId!,
      questionId: data.questionId,
      reason: data.reason,
      howToFix: data.howToFix,
    },
  });

  return res.status(201).json({ mistake });
}

export async function deleteMistake(req: Request, res: Response) {
  const existing = await prisma.mistake.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    throw new AppError('Registro de erro não encontrado.', 404);
  }

  await prisma.mistake.delete({ where: { id: existing.id } });

  return res.status(204).send();
}

/**
 * GET /mistakes/recurring
 * Agrupa os erros por motivo, para identificar padrões recorrentes.
 */
export async function getRecurringMistakes(req: Request, res: Response) {
  const mistakes = await prisma.mistake.findMany({
    where: { userId: req.userId },
    include: { question: { include: { topic: { include: { subject: true } } } } },
  });

  const byReason = new Map<string, number>();
  const bySubjectReason = new Map<string, { subject: string; reason: string; count: number }>();

  for (const m of mistakes) {
    byReason.set(m.reason, (byReason.get(m.reason) ?? 0) + 1);

    const subjectName = m.question.topic.subject.name;
    const key = `${subjectName}::${m.reason}`;
    const bucket = bySubjectReason.get(key) ?? { subject: subjectName, reason: m.reason, count: 0 };
    bucket.count += 1;
    bySubjectReason.set(key, bucket);
  }

  return res.json({
    total: mistakes.length,
    byReason: Array.from(byReason.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
    bySubjectAndReason: Array.from(bySubjectReason.values()).sort((a, b) => b.count - a.count),
  });
}
