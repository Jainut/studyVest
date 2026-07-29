import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import {
  analyzeMistakes,
  explainTopic,
  generateExercises,
  generateWeeklyPlan,
  suggestPriorities,
  WeeklyPlanContext,
} from '../services/ai.service';

async function buildStudyContext(userId: string): Promise<WeeklyPlanContext> {
  const [user, overdueTopics, questions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.review.findMany({
      where: { userId, status: 'ATRASADA' },
      include: { topic: { include: { subject: true } } },
      take: 20,
    }),
    prisma.question.findMany({
      where: { userId },
      select: {
        isCorrect: true,
        topic: { select: { subject: { select: { name: true } } } },
      },
    }),
  ]);

  const performance = new Map<string, { total: number; correct: number }>();
  for (const question of questions) {
    const subject = question.topic.subject.name;
    const bucket = performance.get(subject) ?? { total: 0, correct: 0 };
    bucket.total += 1;
    if (question.isCorrect) bucket.correct += 1;
    performance.set(subject, bucket);
  }

  const topicsTotal = await prisma.topic.count({ where: { userId } });
  const topicsDominated = await prisma.topic.count({
    where: { userId, status: 'DOMINADO' },
  });

  return {
    overallProgress:
      topicsTotal > 0 ? Math.round((topicsDominated / topicsTotal) * 100) : 0,
    overdueTopics: overdueTopics.map((review) => ({
      name: review.topic.name,
      subject: review.topic.subject.name,
    })),
    weakSubjects: Array.from(performance.entries())
      .map(([subject, values]) => ({
        subject,
        accuracyPercent: Math.round((values.correct / values.total) * 100),
      }))
      .sort((a, b) => a.accuracyPercent - b.accuracyPercent)
      .slice(0, 5),
    availableMinutesPerDay: user?.dailyGoalMin ?? 180,
  };
}

export async function createWeeklyPlan(req: Request, res: Response) {
  const context = await buildStudyContext(req.userId!);
  const result = await generateWeeklyPlan(context);
  return res.json({ result });
}

export async function createPrioritySuggestion(req: Request, res: Response) {
  const context = await buildStudyContext(req.userId!);
  const result = await suggestPriorities(context);
  return res.json({ result });
}

export async function createTopicExplanation(req: Request, res: Response) {
  const { topicName, subjectName } = req.body as {
    topicName: string;
    subjectName: string;
  };
  const result = await explainTopic(topicName, subjectName);
  return res.json({ result });
}

export async function createExercises(req: Request, res: Response) {
  const { topicName, examType, quantity } = req.body as {
    topicName: string;
    examType: 'FUVEST' | 'ENEM';
    quantity: number;
  };
  const result = await generateExercises(topicName, examType, quantity);
  return res.json({ result });
}

export async function createMistakeAnalysis(req: Request, res: Response) {
  const { mistakes } = req.body as {
    mistakes: Array<{ reason: string; subject: string; topic: string }>;
  };
  const result = await analyzeMistakes(mistakes);
  return res.json({ result });
}
