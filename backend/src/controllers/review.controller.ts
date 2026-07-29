import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { CompleteReviewInput } from '../validations/review.validation';
import { completeReview, flagOverdueReviews } from '../services/spacedRepetition.service';
import { requiredParam } from '../utils/request';

/** GET /reviews/today — tudo que precisa ser revisado hoje (inclui atrasadas) */
export async function getTodayReviews(req: Request, res: Response) {
  await flagOverdueReviews(req.userId!);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const reviews = await prisma.review.findMany({
    where: {
      userId: req.userId,
      status: { in: ['PENDENTE', 'ATRASADA'] },
      dueDate: { lte: endOfToday },
    },
    include: { topic: { include: { subject: true } } },
    orderBy: { dueDate: 'asc' },
  });

  return res.json({
    total: reviews.length,
    overdueCount: reviews.filter((r) => r.status === 'ATRASADA').length,
    reviews,
  });
}

/** GET /reviews — lista geral (com filtro opcional de status via query) */
export async function listReviews(req: Request, res: Response) {
  const status = req.query.status as string | undefined;

  const reviews = await prisma.review.findMany({
    where: {
      userId: req.userId,
      ...(status && { status: status as never }),
    },
    include: { topic: { include: { subject: true } } },
    orderBy: { dueDate: 'asc' },
  });

  return res.json({ reviews });
}

/** PATCH /reviews/:id/complete — conclui uma revisão e agenda a próxima */
export async function completeReviewController(req: Request, res: Response) {
  const { performance } = req.body as CompleteReviewInput;
  const id = requiredParam(req, 'id');

  const review = await completeReview(id, req.userId!, performance);
  if (!review) {
    throw new AppError('Revisão não encontrada.', 404);
  }

  const updated = await prisma.review.findUnique({
    where: { id: review.id },
    include: { topic: true },
  });

  return res.json({ review: updated });
}
