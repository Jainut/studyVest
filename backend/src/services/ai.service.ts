import { env } from '../config/env';
import { AppError } from '../utils/AppError';

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
    throw new AppError(
      'A mentoria por IA ainda não foi configurada. Defina AI_PROVIDER_API_KEY no backend.',
      503,
    );
  }
}

async function askProvider(system: string, user: string): Promise<string> {
  ensureConfigured();

  let response: globalThis.Response;
  try {
    response = await fetch(`${env.aiProviderBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.aiProviderApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.aiModel,
        temperature: 0.4,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    throw new AppError('Não foi possível contatar o provedor de IA.', 502);
  }

  if (!response.ok) {
    const providerError = await response.text();
    console.error('[AI provider]', response.status, providerError.slice(0, 500));
    throw new AppError('O provedor de IA não conseguiu concluir a solicitação.', 502);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new AppError('O provedor de IA retornou uma resposta vazia.', 502);
  }
  return content;
}

export interface WeeklyPlanContext {
  overallProgress: number;
  overdueTopics: Array<{ name: string; subject: string }>;
  weakSubjects: Array<{ subject: string; accuracyPercent: number }>;
  availableMinutesPerDay: number;
}

export async function generateWeeklyPlan(_context: WeeklyPlanContext): Promise<string> {
  return askProvider(
    'Você é um orientador de estudos para FUVEST e ENEM. Crie planos realistas, em português do Brasil, com pausas e revisão espaçada. Não invente desempenho. Responda em Markdown simples.',
    `Monte um plano de 7 dias usando este contexto:\n${JSON.stringify(_context, null, 2)}`,
  );
}

export async function explainTopic(_topicName: string, _subjectName: string): Promise<string> {
  return askProvider(
    'Você é um professor de cursinho claro e rigoroso. Explique em português do Brasil, use uma analogia, um exemplo resolvido e termine com três pontos de revisão.',
    `Explique o conteúdo "${_topicName}" da matéria "${_subjectName}" para um vestibulando.`,
  );
}

export async function generateExercises(
  _topicName: string,
  _examType: 'FUVEST' | 'ENEM',
  _quantity = 5,
): Promise<string> {
  return askProvider(
    'Você cria exercícios originais para vestibulares brasileiros. Não reproduza questões protegidas. Forneça gabarito comentado depois de todas as questões.',
    `Crie ${_quantity} exercícios no estilo ${_examType} sobre "${_topicName}".`,
  );
}

export async function analyzeMistakes(
  _mistakes: Array<{ reason: string; subject: string; topic: string }>,
): Promise<string> {
  return askProvider(
    'Você analisa padrões de erro de estudo sem julgamento. Identifique causas recorrentes e proponha ações objetivas e mensuráveis.',
    `Analise estes erros e devolva: padrões, hipótese de causa e plano de correção:\n${JSON.stringify(_mistakes, null, 2)}`,
  );
}

export async function suggestPriorities(_context: WeeklyPlanContext): Promise<string> {
  return askProvider(
    'Você prioriza estudos para FUVEST e ENEM. Considere atraso, taxa de acerto e tempo disponível. Seja direto e justifique a ordem.',
    `Sugira as cinco prioridades de estudo para hoje com este contexto:\n${JSON.stringify(_context, null, 2)}`,
  );
}
