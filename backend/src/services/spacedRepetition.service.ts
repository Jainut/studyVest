import { prisma } from '../config/prisma';

/** Intervalos padrão (em dias) da repetição espaçada. */
export const SPACED_REPETITION_INTERVALS = [1, 7, 30];

/**
 * Gera a fila de revisões de um conteúdo assim que ele é concluído
 * (ex: usuário terminou de estudar pela primeira vez).
 * Cria uma revisão para D+1, D+7 e D+30.
 */
export async function generateInitialReviews(topicId: string, userId: string) {
  const existingReviews = await prisma.review.findMany({
    where: {
      topicId,
      userId,
      status: { in: ['PENDENTE', 'ATRASADA'] },
    },
    orderBy: { dueDate: 'asc' },
  });

  if (existingReviews.length > 0) {
    await prisma.topic.update({
      where: { id: topicId },
      data: {
        nextReviewDate: existingReviews[0]?.dueDate ?? null,
        status: 'REVISANDO',
      },
    });
    return existingReviews;
  }

  const now = new Date();

  const reviews = await prisma.$transaction(
    SPACED_REPETITION_INTERVALS.map((intervalDays) => {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + intervalDays);

      return prisma.review.create({
        data: {
          userId,
          topicId,
          dueDate,
          intervalDays,
          status: 'PENDENTE',
        },
      });
    }),
  );

  const firstDueDate = reviews[0]?.dueDate;
  if (firstDueDate) {
    await prisma.topic.update({
      where: { id: topicId },
      data: { nextReviewDate: firstDueDate, status: 'REVISANDO' },
    });
  }

  return reviews;
}

/**
 * Marca uma revisão como concluída e atualiza o "next_review_date" do tópico
 * para a próxima revisão pendente (se houver).
 * Se o desempenho na revisão for baixo (<60%), antecipa um reforço extra em 3 dias.
 */
export async function completeReview(reviewId: string, userId: string, performance?: number) {
  const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
  if (!review) return null;
  if (review.status === 'CONCLUIDA') return review;

  await prisma.review.update({
    where: { id: review.id },
    data: {
      status: 'CONCLUIDA',
      completedAt: new Date(),
      performance,
    },
  });

  // Desempenho fraco -> cria um reforço extra antes da próxima revisão programada
  if (performance !== undefined && performance < 60) {
    const reinforceDate = new Date();
    reinforceDate.setDate(reinforceDate.getDate() + 3);

    await prisma.review.create({
      data: {
        userId,
        topicId: review.topicId,
        dueDate: reinforceDate,
        intervalDays: 3,
        status: 'PENDENTE',
      },
    });
  }

  const nextPending = await prisma.review.findFirst({
    where: {
      topicId: review.topicId,
      userId,
      status: { in: ['PENDENTE', 'ATRASADA'] },
    },
    orderBy: { dueDate: 'asc' },
  });

  await prisma.topic.update({
    where: { id: review.topicId },
    data: {
      nextReviewDate: nextPending?.dueDate ?? null,
      // Se não há mais revisões pendentes, consideramos o conteúdo dominado
      ...(nextPending ? {} : { status: 'DOMINADO' }),
    },
  });

  return review;
}

/**
 * Marca revisões vencidas (due_date no passado e ainda PENDENTE) como ATRASADA.
 * Ideal para rodar antes de listar o dashboard/"revisões de hoje".
 */
export async function flagOverdueReviews(userId: string) {
  await prisma.review.updateMany({
    where: { userId, status: 'PENDENTE', dueDate: { lt: new Date() } },
    data: { status: 'ATRASADA' },
  });
}

/**
 * Quando o usuário erra uma questão de um tópico, antecipa a próxima revisão
 * pendente desse tópico para reforçar o conteúdo mais cedo (se ela estiver
 * distante, traz para daqui a 2 dias).
 */
export async function adjustReviewOnMistake(topicId: string, userId: string) {
  const nextPending = await prisma.review.findFirst({
    where: { topicId, userId, status: { in: ['PENDENTE', 'ATRASADA'] } },
    orderBy: { dueDate: 'asc' },
  });

  const reinforceDate = new Date();
  reinforceDate.setDate(reinforceDate.getDate() + 2);

  if (!nextPending) {
    // não há revisão futura agendada: cria uma de reforço
    await prisma.review.create({
      data: { userId, topicId, dueDate: reinforceDate, intervalDays: 2, status: 'PENDENTE' },
    });
  } else if (nextPending.dueDate > reinforceDate) {
    await prisma.review.update({
      where: { id: nextPending.id },
      data: { dueDate: reinforceDate, status: 'PENDENTE' },
    });
  }

  const soonest = await prisma.review.findFirst({
    where: { topicId, userId, status: { in: ['PENDENTE', 'ATRASADA'] } },
    orderBy: { dueDate: 'asc' },
  });

  await prisma.topic.update({
    where: { id: topicId },
    data: { nextReviewDate: soonest?.dueDate ?? null },
  });
}
