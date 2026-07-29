import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookX,
  CircleAlert,
  Lightbulb,
  Plus,
  RefreshCw,
  Repeat2,
  Trash2,
} from 'lucide-react';
import {
  AddButton,
  Button,
  Card,
  EmptyState,
  Field,
  LoadingState,
  Modal,
  ModalActions,
  PageHeader,
  Select,
  Textarea,
} from '../components/UI';
import { useToast } from '../context/ToastContext';
import { api, ApiError } from '../lib/api';
import { formatDate } from '../lib/format';
import { Mistake, Question } from '../types';

interface RecurringResponse {
  total: number;
  byReason: Array<{ reason: string; count: number }>;
  bySubjectAndReason: Array<{ subject: string; reason: string; count: number }>;
}

export function MistakesPage() {
  const { showToast } = useToast();
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [recurring, setRecurring] = useState<RecurringResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questionId, setQuestionId] = useState('');
  const [reason, setReason] = useState('');
  const [howToFix, setHowToFix] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [mistakeResponse, recurringResponse, questionResponse] = await Promise.all([
        api.get<{ mistakes: Mistake[] }>('/mistakes'),
        api.get<RecurringResponse>('/mistakes/recurring'),
        api.get<{ questions: Question[] }>('/questions?isCorrect=false'),
      ]);
      setMistakes(mistakeResponse.mistakes);
      setRecurring(recurringResponse);
      setWrongQuestions(questionResponse.questions);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar os erros.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const availableQuestions = useMemo(
    () => wrongQuestions.filter((question) => !question.mistake),
    [wrongQuestions],
  );

  async function createMistake(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/mistakes', {
        questionId,
        reason,
        howToFix: howToFix || undefined,
      });
      setQuestionId('');
      setReason('');
      setHowToFix('');
      setModalOpen(false);
      await load();
      showToast('Erro transformado em plano de correção.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível registrar.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function deleteMistake(mistake: Mistake) {
    if (!window.confirm('Remover esta análise do caderno de erros?')) return;
    try {
      await api.delete(`/mistakes/${mistake.id}`);
      await load();
      showToast('Análise removida.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível remover.', 'error');
    }
  }

  if (loading) return <LoadingState label="Lendo os padrões do seu caderno…" />;
  if (error) {
    return (
      <EmptyState
        icon={<CircleAlert size={28} />}
        title="O caderno não abriu"
        description={error}
        action={<Button onClick={() => void load()}><RefreshCw size={17} />Tentar novamente</Button>}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Aprender com o processo"
        title="Caderno de erros"
        description="Um erro explicado deixa de ser tropeço e vira instrução para a próxima tentativa."
        action={<AddButton onClick={() => setModalOpen(true)} disabled={!availableQuestions.length}>Analisar erro</AddButton>}
      />

      <section className="mistake-insights">
        <Card className="mistake-total">
          <span><BookX size={22} /></span>
          <div>
            <strong>{mistakes.length}</strong>
            <p>erros analisados</p>
          </div>
          <small>{availableQuestions.length} aguardando análise</small>
        </Card>

        <Card className="pattern-card">
          <header>
            <div>
              <p className="eyebrow">Padrões recorrentes</p>
              <h2>O que mais se repete</h2>
            </div>
            <Repeat2 size={21} />
          </header>
          {recurring?.byReason.length ? (
            <div className="pattern-list">
              {recurring.byReason.slice(0, 4).map((item, index) => (
                <div key={item.reason}>
                  <span>{index + 1}</span>
                  <strong>{item.reason}</strong>
                  <small>{item.count}×</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">Registre alguns erros para enxergar padrões.</p>
          )}
        </Card>
      </section>

      <Card className="mistake-notebook">
        <header className="section-heading">
          <div>
            <p className="eyebrow">Anotações de correção</p>
            <h2>Erros analisados</h2>
          </div>
          <Lightbulb size={21} />
        </header>

        {mistakes.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle size={29} />}
            title="Ainda não há erros analisados"
            description={
              wrongQuestions.length
                ? 'Escolha uma questão errada e registre por que aconteceu.'
                : 'Primeiro registre uma questão marcada como errada.'
            }
            action={
              availableQuestions.length ? (
                <AddButton onClick={() => setModalOpen(true)}>Analisar primeiro erro</AddButton>
              ) : undefined
            }
          />
        ) : (
          <div className="mistake-grid">
            {mistakes.map((mistake) => (
              <article className="mistake-note" key={mistake.id}>
                <div className="mistake-note__binding">
                  <i /><i /><i />
                </div>
                <header>
                  <span style={{ backgroundColor: mistake.question.topic.subject.color }} />
                  <div>
                    <strong>{mistake.question.topic.name}</strong>
                    <small>{mistake.question.topic.subject.name} · {formatDate(mistake.createdAt)}</small>
                  </div>
                  <button type="button" className="icon-button" aria-label="Remover análise" onClick={() => void deleteMistake(mistake)}>
                    <Trash2 size={16} />
                  </button>
                </header>
                <div className="mistake-note__section">
                  <small>Por que errei</small>
                  <p>{mistake.reason}</p>
                </div>
                <div className="mistake-note__section mistake-note__section--fix">
                  <small>Na próxima vez</small>
                  <p>{mistake.howToFix || 'Plano de correção ainda não registrado.'}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} title="Analisar um erro" description="Nomeie a causa e defina uma ação concreta para a próxima tentativa." onClose={() => setModalOpen(false)}>
        <form className="form-stack" onSubmit={createMistake}>
          <Field label="Questão errada">
            <Select value={questionId} onChange={(event) => setQuestionId(event.target.value)} required>
              <option value="">Selecione</option>
              {availableQuestions.map((question) => (
                <option value={question.id} key={question.id}>
                  {question.topic.subject.name} · {question.topic.name} · {formatDate(question.createdAt)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Por que você errou?" hint="Seja específico: conceito, leitura, cálculo, tempo ou atenção.">
            <Textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ex.: apliquei a fórmula antes de identificar as grandezas." required />
          </Field>
          <Field label="O que fará diferente?" hint="Uma ação que você consiga repetir.">
            <Textarea rows={3} value={howToFix} onChange={(event) => setHowToFix(event.target.value)} placeholder="Ex.: listar os dados e as unidades antes de escolher a fórmula." />
          </Field>
          <ModalActions>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving} disabled={!questionId}>Salvar análise</Button>
          </ModalActions>
        </form>
      </Modal>
    </div>
  );
}
