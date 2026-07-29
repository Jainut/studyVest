import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { flagOverdueReviews } from '../services/spacedRepetition.service';

function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = domingo
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * GET /dashboard
 * Consolida os principais indicadores da tela inicial.
 */
export async function getDashboard(req: Request, res: Response) {
  const userId = req.userId!;
  await flagOverdueReviews(userId);

  const now = new Date();
  const weekStart = startOfWeek(now);
  const todayStart = startOfDay(now);

  const [
    user,
    weekSessions,
    todaySessions,
    topicsTotal,
    topicsDominados,
    overdueReviews,
    upcomingReviews,
    questionsAll,
    upcomingSchedules,
    subjects,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.studySession.findMany({ where: { userId, date: { gte: weekStart } } }),
    prisma.studySession.findMany({ where: { userId, date: { gte: todayStart } } }),
    prisma.topic.count({ where: { userId } }),
    prisma.topic.count({ where: { userId, status: 'DOMINADO' } }),
    prisma.review.findMany({
      where: { userId, status: 'ATRASADA' },
      include: { topic: { include: { subject: true } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
    prisma.review.findMany({
      where: { userId, status: 'PENDENTE', dueDate: { gte: now } },
      include: { topic: { include: { subject: true } } },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    prisma.question.findMany({ where: { userId }, select: { isCorrect: true } }),
    prisma.schedule.findMany({
      where: { userId, date: { gte: now }, status: 'PLANEJADO' },
      orderBy: { date: 'asc' },
      take: 5,
    }),
    prisma.subject.findMany({
      where: { userId },
      include: { topics: { select: { difficulty: true, status: true } } },
    }),
  ]);

  const weekMinutes = weekSessions.reduce((sum, s) => sum + s.durationMin, 0);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMin, 0);
  const dailyGoalMin = user?.dailyGoalMin ?? 360;

  const overallProgress = topicsTotal > 0 ? Math.round((topicsDominados / topicsTotal) * 100) : 0;

  const totalQuestions = questionsAll.length;
  const correctQuestions = questionsAll.filter((q) => q.isCorrect).length;
  const overallAccuracy =
    totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : null;

  // Matérias com maior dificuldade: % de tópicos DIFICIL ainda não dominados
  const hardestSubjects = subjects
    .map((s) => {
      const total = s.topics.length;
      const hardUnfinished = s.topics.filter(
        (t) => t.difficulty === 'DIFICIL' && t.status !== 'DOMINADO',
      ).length;
      return {
        subject: s.name,
        color: s.color,
        difficultyScore: total > 0 ? Math.round((hardUnfinished / total) * 100) : 0,
      };
    })
    .filter((s) => s.difficultyScore > 0)
    .sort((a, b) => b.difficultyScore - a.difficultyScore)
    .slice(0, 5);

  return res.json({
    weekHoursStudied: Math.round((weekMinutes / 60) * 10) / 10,
    dailyGoal: {
      goalMin: dailyGoalMin,
      studiedMin: todayMinutes,
      progressPercent: Math.min(100, Math.round((todayMinutes / dailyGoalMin) * 100)),
    },
    overallProgress, // % de tópicos dominados
    hardestSubjects,
    overdueReviews,
    upcomingTasks: {
      reviews: upcomingReviews,
      schedules: upcomingSchedules,
    },
    questionsPerformance: {
      total: totalQuestions,
      correct: correctQuestions,
      accuracyPercent: overallAccuracy,
    },
  });
}

/**
 * GET /dashboard/charts
 * Dados prontos para os 3 gráficos do dashboard.
 */
export async function getDashboardCharts(req: Request, res: Response) {
  const userId = req.userId!;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [questions, sessions] = await Promise.all([
    prisma.question.findMany({
      where: { userId, createdAt: { gte: sixMonthsAgo } },
      select: { isCorrect: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.studySession.findMany({
      where: { userId, date: { gte: sixMonthsAgo } },
      select: { durationMin: true, date: true, subjectId: true, subject: { select: { name: true } } },
    }),
  ]);

  // Evolução de acertos por semana (ISO week label simplificado por data)
  const accuracyByWeek = new Map<string, { correct: number; total: number }>();
  for (const q of questions) {
    const weekLabel = startOfWeek(q.createdAt).toISOString().slice(0, 10);
    const bucket = accuracyByWeek.get(weekLabel) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (q.isCorrect) bucket.correct += 1;
    accuracyByWeek.set(weekLabel, bucket);
  }
  const accuracyEvolution = Array.from(accuracyByWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, v]) => ({
      week,
      accuracyPercent: Math.round((v.correct / v.total) * 100),
      totalQuestions: v.total,
    }));

  // Tempo estudado por matéria (total, em minutos)
  const timeBySubject = new Map<string, number>();
  for (const s of sessions) {
    const name = s.subject.name;
    timeBySubject.set(name, (timeBySubject.get(name) ?? 0) + s.durationMin);
  }
  const timePerSubject = Array.from(timeBySubject.entries()).map(([subject, minutes]) => ({
    subject,
    hours: Math.round((minutes / 60) * 10) / 10,
  }));

  // Evolução mensal de tempo estudado
  const monthlyMap = new Map<string, number>();
  for (const s of sessions) {
    const monthLabel = `${s.date.getFullYear()}-${String(s.date.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(monthLabel, (monthlyMap.get(monthLabel) ?? 0) + s.durationMin);
  }
  const monthlyEvolution = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, minutes]) => ({ month, hours: Math.round((minutes / 60) * 10) / 10 }));

  return res.json({ accuracyEvolution, timePerSubject, monthlyEvolution });
}

