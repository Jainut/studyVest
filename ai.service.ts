import { env } from '../config/env';

/**
 * Camada de abstração para integração futura com provedores de IA
 * (ex: Anthropic, OpenAI). Nenhuma chamada paga é feita agora — os métodos
 * abaixo lançam erro até que AI_PROVIDER_API_KEY seja configurada e a
 * implementação real seja conectada (ex: SDK da Anthropic).
 *
 * Uso previsto (conforme especificação):
 * - generateWeeklyPlan: gerar plano semanal a partir do desempenho do usuário
 * - explainTopic: explicar um conteúdo
 * - generateExercises: criar exercícios sobre um tópico
 * - analyzeMistakes: analisar padrões no caderno de erros
 * - suggestPriorities: sugerir prioridades de estudo
 */

function ensureConfigured() {
  if (!env.aiProviderApiKey) {
    throw new Error(
      'AI_PROVIDER_API_KEY não configurada. Integração de IA ainda não está ativa.',
    );
  }
}

export interface WeeklyPlanContext {
  overallProgress: number;
  overdueTopics: Array<{ name: string; subject: string }>;
  weakSubjects: Array<{ subject: string; accuracyPercent: number }>;
  availableMinutesPerDay: number;
}

export async function generateWeeklyPlan(_context: WeeklyPlanContext): Promise<string> {
  ensureConfigured();
  // TODO (Etapa futura): montar prompt com o contexto e chamar o SDK da Anthropic.
  throw new Error('Não implementado ainda.');
}

export async function explainTopic(_topicName: string, _subjectName: string): Promise<string> {
  ensureConfigured();
  throw new Error('Não implementado ainda.');
}

export async function generateExercises(
  _topicName: string,
  _examType: 'FUVEST' | 'ENEM',
  _quantity = 5,
): Promise<string> {
  ensureConfigured();
  throw new Error('Não implementado ainda.');
}

export async function analyzeMistakes(
  _mistakes: Array<{ reason: string; subject: string; topic: string }>,
): Promise<string> {
  ensureConfigured();
  throw new Error('Não implementado ainda.');
}

export async function suggestPriorities(_context: WeeklyPlanContext): Promise<string> {
  ensureConfigured();
  throw new Error('Não implementado ainda.');
}
