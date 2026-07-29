import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { CreateEssayInput, UpdateEssayInput } from '../validations/essay.validation';

function computeScore(input: { score?: number; comp1?: number; comp2?: number; comp3?: number; comp4?: number; comp5?: number }) {
  if (input.score !== undefined) return input.score;
  const comps = [input.comp1, input.comp2, input.comp3, input.comp4, input.comp5];
  if (comps.every((c) => c !== undefined)) {
    return comps.reduce((sum, c) => sum! + c!, 0);
  }
  return undefined;
}

export async function listEssays(req: Request, res: Response) {
  const essays = await prisma.essay.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'desc' },
  });

  return res.json({ essays });
}

export async function getEssay(req: Request, res: Response) {
  const essay = await prisma.essay.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!essay) {
    throw new AppError('Redação não encontrada.', 404);
  }
  return res.json({ essay });
}

export async function createEssay(req: Request, res: Response) {
  const data = req.body as CreateEssayInput;

  const essay = await prisma.essay.create({
    data: {
      userId: req.userId!,
      theme: data.theme,
      date: data.date ?? new Date(),
      score: computeScore(data),
      comp1: data.comp1,
      comp2: data.comp2,
      comp3: data.comp3,
      comp4: data.comp4,
      comp5: data.comp5,
      feedback: data.feedback,
    },
  });

  return res.status(201).json({ essay });
}

export async function updateEssay(req: Request, res: Response) {
  const data = req.body as UpdateEssayInput;

  const existing = await prisma.essay.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!existing) {
    throw new AppError('Redação não encontrada.', 404);
  }

  const merged = { ...existing, ...data };

  const essay = await prisma.essay.update({
    where: { id: existing.id },
    data: { ...data, score: computeScore(merged) },
  });

  return res.json({ essay });
}

export async function deleteEssay(req: Request, res: Response) {
  const existing = await prisma.essay.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!existing) {
    throw new AppError('Redação não encontrada.', 404);
  }

  await prisma.essay.delete({ where: { id: existing.id } });

  return res.status(204).send();
}

/** GET /essays/evolution — série histórica de notas para o gráfico de evolução */
export async function getEssayEvolution(req: Request, res: Response) {
  const essays = await prisma.essay.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'asc' },
    select: { date: true, score: true, theme: true, comp1: true, comp2: true, comp3: true, comp4: true, comp5: true },
  });

  const averageByCompetency = ['comp1', 'comp2', 'comp3', 'comp4', 'comp5'].map((key) => {
    const values = essays.map((e) => e[key as keyof typeof e]).filter((v): v is number => v !== null);
    const avg = values.length > 0 ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : null;
    return { competency: key, average: avg };
  });

  return res.json({ evolution: essays, averageByCompetency });
}
