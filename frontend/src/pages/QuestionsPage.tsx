import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Check,
  CheckCircle2,
  CircleAlert,
  CircleX,
  Plus,
  RefreshCw,
  SearchCheck,
  Timer,
  Trash2,
} from 'lucide-react';
import {
  AddButton,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingState,
  Modal,
  ModalActions,
  PageHeader,
  ProgressBar,
  Select,
  Textarea,
} from '../components/UI';
import { useToast } from '../context/ToastContext';
import { api, ApiError } from '../lib/api';
import { formatDate } from '../lib/format';
import {
  Difficulty,
  ExamType,
  Question,
  QuestionStatistic,
  Topic,
} from '../types';

export function QuestionsPage() {
  const { showToast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [statistics, setStatistics] = useState<QuestionStatistic[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resultFilter, setResultFilter] = useState<'all' | 'correct' | 'wrong'>('all');
  const [examFilter, setExamFilter] = useState<'all' | ExamType>('all');

  const [topicId, setTopicId] = useState('');
  const [examType, setExamType] = useState<ExamType>('FUVEST');
  const [year, setYear] = useState(new Date().getFullYear());
  const [institution, setInstitution] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIO');
  const [isCorrect, setIsCorrect] = useState(true);
  const [timeMinutes, setTimeMinutes] = useState(3);
  const [errorNote, setErrorNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [questionResponse, statsResponse, topicResponse] = await Promise.all([
        api.get<{ questions: Question[] }>('/questions'),
        api.get<{ flat: QuestionStatistic[] }>('/questions/statistics'),
        api.get<{ topics: Topic[] }>('/topics'),
      ]);
      setQuestions(questionResponse.questions);
      setStatistics(statsResponse.flat);
      setTopics(topicResponse.topics);
      setTopicId((current) => current || topicResponse.topics[0]?.id || '');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar as questões.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredQuestions = useMemo(
    () =>
      questions.filter((question) => {
        if (resultFilter === 'correct' && !question.isCorrect) return false;
        if (resultFilter === 'wrong' && question.isCorrect) return false;
        if (examFilter !== 'all' && question.examType !== examFilter) return false;
        return true;
      }),
    [examFilter, questions, resultFilter],
  );

  const totalCorrect = questions.filter((question) => question.isCorrect).length;
  const accuracy = questions.length ? Math.round((totalCorrect / questions.length) * 100) : 0;

  async function createQuestion(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/questions', {
        topicId,
        examType,
        year,
        institution: institution || undefined,
        difficulty,
        isCorrect,
        timeSpentSec: Math.round(timeMinutes * 60),
        errorNote: !isCorrect && errorNote ? errorNote : undefined,
      });
      setModalOpen(false);
      setInstitution('');
      setErrorNote('');
      setIsCorrect(true);
      await load();
      showToast(
        isCorrect
          ? 'Questão registrada como acerto.'
          : 'Erro registrado. A próxima revisão deste conteúdo foi antecipada.',
      );
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível registrar.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(question: Question) {
    if (!window.confirm('Remover esta questão do histórico?')) return;
    try {
      await api.delete(`/questions/${question.id}`);
      await load();
      showToast('Questão removida.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível remover.', 'error');
    }
  }

  if (loading) return <LoadingState label="Calculando seu desempenho…" />;
  if (error) {
    return (
      <EmptyState
        icon={<CircleAlert size={28} />}
        title="O banco de questões não abriu"
        description={error}
        action={<Button onClick={() => void load()}><RefreshCw size={17} />Tentar novamente</Button>}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Prática deliberada"
        title="Questões"
        description="Registre resultados e deixe os erros mostrarem o próximo conteúdo a revisar."
        action={<AddButton onClick={() => setModalOpen(true)} disabled={topics.length === 0}>Registrar questão</AddButton>}
      />

      <section className="question-overview">
        <Card className="accuracy-card">
          <div
            className="accuracy-ring"
            style={{ '--accuracy': `${accuracy * 3.6}deg` } as React.CSSProperties}
          >
            <span><strong>{questions.length ? accuracy : '—'}</strong>{questions.length ? '%' : ''}</span>
          </div>
          <div>
            <p>Taxa geral de acerto</p>
            <strong>{totalCorrect} de {questions.length} questões</strong>
            <span>{accuracy >= 70 ? 'Bom ritmo — suba a dificuldade aos poucos.' : 'Use os tópicos abaixo para priorizar a revisão.'}</span>
          </div>
        </Card>

        <Card className="priority-topics">
          <header>
            <div>
              <p className="eyebrow">Prioridade de revisão</p>
              <h2>Pontos de atenção</h2>
            </div>
            <BarChart3 size={21} />
          </header>
          {statistics.length ? (
            statistics.slice(0, 3).map((stat) => (
              <div className="priority-topic" key={stat.topicId}>
                <div>
                  <strong>{stat.topic}</strong>
                  <span>{stat.subject} · {stat.total} questões</span>
                </div>
                <ProgressBar value={stat.accuracyPercent} color={stat.accuracyPercent < 60 ? '#d95d4f' : '#2a8c82'} />
                <strong>{stat.accuracyPercent}%</strong>
              </div>
            ))
          ) : (
            <span className="muted-copy">Os tópicos aparecem depois das primeiras questões.</span>
          )}
        </Card>
      </section>

      <Card className="question-history">
        <header className="list-toolbar">
          <div className="segmented-control">
            <button type="button" className={resultFilter === 'all' ? 'is-active' : ''} onClick={() => setResultFilter('all')}>Todas</button>
            <button type="button" className={resultFilter === 'correct' ? 'is-active' : ''} onClick={() => setResultFilter('correct')}>Acertos</button>
            <button type="button" className={resultFilter === 'wrong' ? 'is-active' : ''} onClick={() => setResultFilter('wrong')}>Erros</button>
          </div>
          <Select aria-label="Filtrar por prova" value={examFilter} onChange={(event) => setExamFilter(event.target.value as 'all' | ExamType)}>
            <option value="all">Todas as provas</option>
            <option value="FUVEST">FUVEST</option>
            <option value="ENEM">ENEM</option>
            <option value="OUTRO">Outras</option>
          </Select>
        </header>

        {filteredQuestions.length === 0 ? (
          <EmptyState
            icon={<SearchCheck size={30} />}
            title={questions.length ? 'Nenhuma questão neste filtro' : 'Registre sua primeira questão'}
            description={questions.length ? 'Ajuste os filtros para rever o histórico.' : 'Cada resultado ajuda a tornar suas prioridades mais precisas.'}
            action={!questions.length && topics.length ? <AddButton onClick={() => setModalOpen(true)}>Registrar questão</AddButton> : undefined}
          />
        ) : (
          <div className="question-list">
            {filteredQuestions.map((question) => (
              <article className="question-item" key={question.id}>
                <span className={`result-mark ${question.isCorrect ? 'is-correct' : 'is-wrong'}`}>
                  {question.isCorrect ? <Check size={18} /> : <CircleX size={18} />}
                </span>
                <div className="question-item__content">
                  <strong>{question.topic.name}</strong>
                  <span>{question.topic.subject.name} · {question.institution || question.examType} {question.year || ''}</span>
                  {!question.isCorrect && question.errorNote ? <small>{question.errorNote}</small> : null}
                </div>
                <Badge value={question.difficulty} />
                <div className="question-time">
                  <Timer size={15} />
                  {question.timeSpentSec ? `${Math.round(question.timeSpentSec / 60)} min` : '—'}
                </div>
                <time>{formatDate(question.createdAt)}</time>
                <button type="button" className="icon-button" aria-label="Remover questão" onClick={() => void deleteQuestion(question)}>
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} title="Registrar questão" description="O resultado atualiza as estatísticas e pode antecipar revisões." onClose={() => setModalOpen(false)} size="large">
        <form className="form-stack" onSubmit={createQuestion}>
          <Field label="Conteúdo">
            <Select value={topicId} onChange={(event) => setTopicId(event.target.value)} required>
              <option value="">Selecione</option>
              {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.subject?.name} · {topic.name}</option>)}
            </Select>
          </Field>
          <div className="form-grid form-grid--3">
            <Field label="Prova">
              <Select value={examType} onChange={(event) => setExamType(event.target.value as ExamType)}>
                <option value="FUVEST">FUVEST</option>
                <option value="ENEM">ENEM</option>
                <option value="OUTRO">Outra</option>
              </Select>
            </Field>
            <Field label="Ano">
              <Input type="number" min="1950" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} />
            </Field>
            <Field label="Dificuldade">
              <Select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
                <option value="FACIL">Fácil</option>
                <option value="MEDIO">Médio</option>
                <option value="DIFICIL">Difícil</option>
              </Select>
            </Field>
          </div>
          <div className="form-grid form-grid--2">
            <Field label="Instituição" hint="Opcional">
              <Input value={institution} onChange={(event) => setInstitution(event.target.value)} placeholder="Ex.: FUVEST" />
            </Field>
            <Field label="Tempo gasto (min)">
              <Input type="number" min="0.5" max="360" step="0.5" value={timeMinutes} onChange={(event) => setTimeMinutes(Number(event.target.value))} />
            </Field>
          </div>
          <Field label="Resultado">
            <div className="result-picker">
              <button type="button" className={isCorrect ? 'is-selected is-correct' : ''} onClick={() => setIsCorrect(true)}>
                <CheckCircle2 size={20} /> Acertei
              </button>
              <button type="button" className={!isCorrect ? 'is-selected is-wrong' : ''} onClick={() => setIsCorrect(false)}>
                <CircleX size={20} /> Errei
              </button>
            </div>
          </Field>
          {!isCorrect ? (
            <Field label="O que aconteceu?" hint="Isto ajudará a preencher o caderno de erros.">
              <Textarea rows={3} value={errorNote} onChange={(event) => setErrorNote(event.target.value)} placeholder="Ex.: confundi o sentido da força de atrito." />
            </Field>
          ) : null}
          <ModalActions>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving} disabled={!topicId}>Registrar resultado</Button>
          </ModalActions>
        </form>
      </Modal>
    </div>
  );
}
