import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  CircleAlert,
  Clock3,
  History,
  NotebookPen,
  Plus,
  RefreshCw,
  TimerReset,
  Trash2,
} from 'lucide-react';
import {
  AddButton,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingState,
  Modal,
  ModalActions,
  PageHeader,
  Select,
  Textarea,
} from '../components/UI';
import { useToast } from '../context/ToastContext';
import { api, ApiError } from '../lib/api';
import { formatDate, formatMinutes, toDateTimeLocal } from '../lib/format';
import { StudySession, Subject, Topic } from '../types';

export function SessionsPage() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [durationMin, setDurationMin] = useState(50);
  const [date, setDate] = useState(toDateTimeLocal());
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sessionResponse, subjectResponse, topicResponse] = await Promise.all([
        api.get<{ sessions: StudySession[] }>('/study-sessions'),
        api.get<{ subjects: Subject[] }>('/subjects'),
        api.get<{ topics: Topic[] }>('/topics'),
      ]);
      setSessions(sessionResponse.sessions);
      setSubjects(subjectResponse.subjects);
      setTopics(topicResponse.topics);
      setSubjectId((current) => current || subjectResponse.subjects[0]?.id || '');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar as sessões.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const availableTopics = useMemo(
    () => topics.filter((topic) => topic.subjectId === subjectId),
    [subjectId, topics],
  );

  const weekStart = useMemo(() => {
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    current.setDate(current.getDate() - current.getDay());
    return current;
  }, []);
  const weekSessions = sessions.filter((session) => new Date(session.date) >= weekStart);
  const weekMinutes = weekSessions.reduce((sum, session) => sum + session.durationMin, 0);

  async function createSession(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.post<{ session: StudySession }>('/study-sessions', {
        subjectId,
        topicId: topicId || undefined,
        durationMin,
        date: new Date(date).toISOString(),
        notes: notes || undefined,
      });
      const subject = subjects.find((item) => item.id === subjectId)!;
      const topic = topics.find((item) => item.id === topicId);
      setSessions((current) => [
        { ...response.session, subject, topic: topic ? { id: topic.id, name: topic.name } : null },
        ...current,
      ]);
      setNotes('');
      setTopicId('');
      setDurationMin(50);
      setDate(toDateTimeLocal());
      setModalOpen(false);
      showToast('Sessão registrada. O tempo já entrou no painel.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível registrar.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSession(session: StudySession) {
    if (!window.confirm('Remover esta sessão do histórico?')) return;
    try {
      await api.delete(`/study-sessions/${session.id}`);
      setSessions((current) => current.filter((item) => item.id !== session.id));
      showToast('Sessão removida.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível remover.', 'error');
    }
  }

  if (loading) return <LoadingState label="Somando seu tempo de estudo…" />;
  if (error) {
    return (
      <EmptyState
        icon={<CircleAlert size={28} />}
        title="O histórico não abriu"
        description={error}
        action={<Button onClick={() => void load()}><RefreshCw size={17} />Tentar novamente</Button>}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Tempo com intenção"
        title="Sessões de estudo"
        description="Registre o trabalho real. A constância aparece quando o tempo deixa de ser estimativa."
        action={<AddButton onClick={() => setModalOpen(true)}>Registrar sessão</AddButton>}
      />

      <section className="session-summary">
        <Card className="session-summary__main">
          <span className="metric-icon metric-icon--blue"><Clock3 size={21} /></span>
          <div>
            <p>Tempo nesta semana</p>
            <strong>{formatMinutes(weekMinutes)}</strong>
          </div>
          <div className="session-summary__rule" />
          <div>
            <p>Blocos concluídos</p>
            <strong>{weekSessions.length}</strong>
          </div>
        </Card>
        <Card className="session-summary__tip">
          <TimerReset size={23} />
          <div>
            <strong>Blocos de 50 minutos</strong>
            <span>Uma pausa curta entre blocos ajuda a manter a qualidade.</span>
          </div>
        </Card>
      </section>

      <Card className="history-card">
        <header className="section-heading">
          <div>
            <p className="eyebrow">Registro</p>
            <h2>Histórico recente</h2>
          </div>
          <History size={20} />
        </header>

        {sessions.length === 0 ? (
          <EmptyState
            icon={<NotebookPen size={29} />}
            title="Seu primeiro bloco começa aqui"
            description="Ao registrar uma sessão, o painel passa a mostrar seu ritmo real."
            action={<AddButton onClick={() => setModalOpen(true)}>Registrar sessão</AddButton>}
          />
        ) : (
          <div className="session-list">
            {sessions.map((session) => (
              <article className="session-item" key={session.id}>
                <span
                  className="session-item__color"
                  style={{ backgroundColor: session.subject.color }}
                />
                <div className="session-item__date">
                  <strong>{formatDate(session.date)}</strong>
                  <span>
                    {new Intl.DateTimeFormat('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(session.date))}
                  </span>
                </div>
                <div className="session-item__subject">
                  <strong>{session.topic?.name ?? session.subject.name}</strong>
                  <span>
                    {session.topic ? session.subject.name : 'Estudo geral'}
                    {session.notes ? ` · ${session.notes}` : ''}
                  </span>
                </div>
                <strong className="session-item__duration">{formatMinutes(session.durationMin)}</strong>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Remover sessão"
                  onClick={() => void deleteSession(session)}
                >
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} title="Registrar sessão" description="Informe o tempo que você realmente estudou." onClose={() => setModalOpen(false)}>
        <form className="form-stack" onSubmit={createSession}>
          <div className="form-grid form-grid--2">
            <Field label="Matéria">
              <Select
                value={subjectId}
                onChange={(event) => {
                  setSubjectId(event.target.value);
                  setTopicId('');
                }}
                required
              >
                <option value="">Selecione</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </Select>
            </Field>
            <Field label="Conteúdo" hint="Opcional">
              <Select value={topicId} onChange={(event) => setTopicId(event.target.value)}>
                <option value="">Estudo geral da matéria</option>
                {availableTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="form-grid form-grid--2">
            <Field label="Duração em minutos">
              <Input type="number" min="1" max="1440" value={durationMin} onChange={(event) => setDurationMin(Number(event.target.value))} required />
            </Field>
            <Field label="Data e hora">
              <Input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} required />
            </Field>
          </div>
          <Field label="Notas" hint="Opcional">
            <Textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="O que avançou? Onde travou?" />
          </Field>
          <ModalActions>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving} disabled={!subjectId}>Salvar sessão</Button>
          </ModalActions>
        </form>
      </Modal>
    </div>
  );
}
