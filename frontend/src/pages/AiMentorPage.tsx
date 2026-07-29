import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  BrainCircuit,
  CircleAlert,
  ClipboardList,
  KeyRound,
  ListChecks,
  MessageSquareText,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import {
  Button,
  Card,
  Field,
  PageHeader,
  Select,
} from '../components/UI';
import { api, ApiError } from '../lib/api';
import { ExamType, Mistake, Subject, Topic } from '../types';

type MentorMode = 'plan' | 'priorities' | 'explain' | 'exercises' | 'mistakes';

const actions: Array<{
  id: MentorMode;
  title: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    id: 'plan',
    title: 'Plano de 7 dias',
    description: 'Distribui revisões, pontos fracos e meta diária.',
    icon: <ClipboardList size={21} />,
  },
  {
    id: 'priorities',
    title: 'Prioridades de hoje',
    description: 'Ordena o que merece atenção agora.',
    icon: <ListChecks size={21} />,
  },
  {
    id: 'explain',
    title: 'Explicar conteúdo',
    description: 'Explicação, analogia e exemplo resolvido.',
    icon: <BookOpenText size={21} />,
  },
  {
    id: 'exercises',
    title: 'Criar exercícios',
    description: 'Questões originais no estilo da prova.',
    icon: <WandSparkles size={21} />,
  },
  {
    id: 'mistakes',
    title: 'Analisar erros',
    description: 'Encontra padrões no caderno de erros.',
    icon: <MessageSquareText size={21} />,
  },
];

function FormattedAnswer({ content }: { content: string }) {
  return (
    <div className="formatted-answer">
      {content.split('\n').map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={index} />;
        if (trimmed.startsWith('### ')) return <h4 key={index}>{trimmed.slice(4)}</h4>;
        if (trimmed.startsWith('## ')) return <h3 key={index}>{trimmed.slice(3)}</h3>;
        if (trimmed.startsWith('# ')) return <h2 key={index}>{trimmed.slice(2)}</h2>;
        if (/^[-*]\s/.test(trimmed)) return <p className="answer-list-item" key={index}>• {trimmed.slice(2)}</p>;
        if (/^\d+\.\s/.test(trimmed)) return <p className="answer-list-item" key={index}>{trimmed}</p>;
        return <p key={index}>{trimmed.replace(/\*\*/g, '')}</p>;
      })}
    </div>
  );
}

export function AiMentorPage() {
  const [mode, setMode] = useState<MentorMode>('plan');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [topicId, setTopicId] = useState('');
  const [examType, setExamType] = useState<Exclude<ExamType, 'OUTRO'>>('FUVEST');
  const [quantity, setQuantity] = useState(5);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadContext() {
      try {
        const [subjectResponse, topicResponse, mistakeResponse] = await Promise.all([
          api.get<{ subjects: Subject[] }>('/subjects'),
          api.get<{ topics: Topic[] }>('/topics'),
          api.get<{ mistakes: Mistake[] }>('/mistakes'),
        ]);
        setSubjects(subjectResponse.subjects);
        setTopics(topicResponse.topics);
        setMistakes(mistakeResponse.mistakes);
        setTopicId(topicResponse.topics[0]?.id ?? '');
      } catch {
        // Os próprios comandos mostram uma mensagem acionável se a API estiver indisponível.
      }
    }
    void loadContext();
  }, []);

  const selectedTopic = topics.find((topic) => topic.id === topicId);
  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedTopic?.subjectId),
    [selectedTopic?.subjectId, subjects],
  );

  async function runMentor() {
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      let response: { result: string };
      if (mode === 'plan') {
        response = await api.post('/ai/weekly-plan');
      } else if (mode === 'priorities') {
        response = await api.post('/ai/priorities');
      } else if (mode === 'explain') {
        response = await api.post('/ai/explain', {
          topicName: selectedTopic?.name,
          subjectName: selectedSubject?.name || selectedTopic?.subject?.name,
        });
      } else if (mode === 'exercises') {
        response = await api.post('/ai/exercises', {
          topicName: selectedTopic?.name,
          examType,
          quantity,
        });
      } else {
        response = await api.post('/ai/analyze-mistakes', {
          mistakes: mistakes.map((mistake) => ({
            reason: mistake.reason,
            subject: mistake.question.topic.subject.name,
            topic: mistake.question.topic.name,
          })),
        });
      }
      setAnswer(response.result);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'O mentor não conseguiu responder.');
    } finally {
      setLoading(false);
    }
  }

  const needsTopic = mode === 'explain' || mode === 'exercises';
  const canRun = needsTopic ? Boolean(selectedTopic) : mode === 'mistakes' ? mistakes.length > 0 : true;

  return (
    <div>
      <PageHeader
        eyebrow="Orientação personalizada"
        title="Mentor IA"
        description="Use seus próprios dados de estudo como contexto para receber orientação mais específica."
      />

      <section className="mentor-layout">
        <div className="mentor-controls">
          <Card className="mentor-intro">
            <span className="mentor-intro__icon"><BrainCircuit size={25} /></span>
            <div>
              <p className="eyebrow">Um pedido por vez</p>
              <h2>O que você precisa destravar?</h2>
              <p>Escolha uma tarefa. O mentor considera sua meta, revisões e desempenho quando isso for relevante.</p>
            </div>
          </Card>

          <div className="mentor-action-grid">
            {actions.map((action) => (
              <button
                type="button"
                key={action.id}
                className={mode === action.id ? 'is-selected' : ''}
                onClick={() => {
                  setMode(action.id);
                  setAnswer('');
                  setError('');
                }}
              >
                <span>{action.icon}</span>
                <strong>{action.title}</strong>
                <small>{action.description}</small>
              </button>
            ))}
          </div>

          {needsTopic ? (
            <Card className="mentor-options">
              <Field label="Conteúdo">
                <Select value={topicId} onChange={(event) => setTopicId(event.target.value)}>
                  <option value="">Selecione</option>
                  {topics.map((topic) => (
                    <option value={topic.id} key={topic.id}>
                      {topic.subject?.name} · {topic.name}
                    </option>
                  ))}
                </Select>
              </Field>
              {mode === 'exercises' ? (
                <div className="form-grid form-grid--2">
                  <Field label="Estilo da prova">
                    <Select value={examType} onChange={(event) => setExamType(event.target.value as Exclude<ExamType, 'OUTRO'>)}>
                      <option value="FUVEST">FUVEST</option>
                      <option value="ENEM">ENEM</option>
                    </Select>
                  </Field>
                  <Field label="Quantidade">
                    <Select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
                      {[3, 5, 8, 10].map((value) => <option value={value} key={value}>{value} exercícios</option>)}
                    </Select>
                  </Field>
                </div>
              ) : null}
            </Card>
          ) : null}

          {mode === 'mistakes' && mistakes.length === 0 ? (
            <div className="inline-note inline-note--warning">
              <CircleAlert size={17} />
              Analise ao menos um erro no caderno antes de pedir a leitura de padrões.
            </div>
          ) : null}

          <Button className="mentor-run-button" onClick={() => void runMentor()} loading={loading} disabled={!canRun}>
            <Sparkles size={18} />
            {loading ? 'Pensando com seus dados…' : 'Pedir orientação'}
          </Button>
        </div>

        <Card className={`mentor-output ${answer ? 'has-answer' : ''}`}>
          <header>
            <div>
              <span><Sparkles size={18} /></span>
              <div>
                <p className="eyebrow">Resposta do mentor</p>
                <h2>{actions.find((action) => action.id === mode)?.title}</h2>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="mentor-thinking">
              <i /><i /><i />
              <strong>Cruzando suas prioridades…</strong>
              <span>Isso pode levar alguns segundos.</span>
            </div>
          ) : error ? (
            <div className="mentor-error">
              {error.includes('AI_PROVIDER_API_KEY') || error.includes('configurada') ? <KeyRound size={29} /> : <CircleAlert size={29} />}
              <strong>O mentor precisa de configuração</strong>
              <p>{error}</p>
              <small>Use as variáveis AI_PROVIDER_API_KEY, AI_PROVIDER_BASE_URL e AI_MODEL no backend.</small>
            </div>
          ) : answer ? (
            <FormattedAnswer content={answer} />
          ) : (
            <div className="mentor-placeholder">
              <BrainCircuit size={38} />
              <strong>Sua orientação aparecerá aqui</strong>
              <p>Selecione uma tarefa e faça o pedido quando estiver pronto.</p>
              <div>
                <span>Contexto privado</span>
                <span>Resposta sob demanda</span>
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
