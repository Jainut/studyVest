import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  Lightbulb,
  Plus,
  RefreshCw,
  Sparkles,
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
  Select,
  Textarea,
} from '../components/UI';
import { useToast } from '../context/ToastContext';
import { api, ApiError } from '../lib/api';
import { formatDate, formatMinutes, toDateTimeLocal } from '../lib/format';
import { Schedule, ScheduleStatus, ScheduleSuggestion, Subject, Topic } from '../types';

interface SuggestionResponse {
  minutesAvailable: number;
  minutesAllocated: number;
  minutesRemaining: number;
  suggestedBlocks: ScheduleSuggestion[];
}

export function SchedulePage() {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingSuggestion, setAddingSuggestion] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ScheduleStatus>('all');

  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(toDateTimeLocal(new Date(Date.now() + 60 * 60 * 1000)));
  const [durationMin, setDurationMin] = useState(50);
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [scheduleResponse, suggestionResponse, subjectResponse, topicResponse] = await Promise.all([
        api.get<{ schedules: Schedule[] }>('/schedules'),
        api.get<SuggestionResponse>('/schedules/suggestions'),
        api.get<{ subjects: Subject[] }>('/subjects'),
        api.get<{ topics: Topic[] }>('/topics'),
      ]);
      setSchedules(scheduleResponse.schedules);
      setSuggestions(suggestionResponse);
      setSubjects(subjectResponse.subjects);
      setTopics(topicResponse.topics);
      setSubjectId((current) => current || subjectResponse.subjects[0]?.id || '');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar a agenda.');
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
  const visibleSchedules = useMemo(
    () => schedules.filter((schedule) => filter === 'all' || schedule.status === filter),
    [filter, schedules],
  );

  async function createSchedule(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/schedules', {
        subjectId,
        topicId: topicId || undefined,
        title: title || undefined,
        date: new Date(date).toISOString(),
        durationMin,
        notes: notes || undefined,
      });
      setTitle('');
      setTopicId('');
      setNotes('');
      setModalOpen(false);
      await load();
      showToast('Bloco incluído na agenda.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível agendar.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function addSuggestion(suggestion: ScheduleSuggestion, index: number) {
    const key = `${suggestion.subjectId}-${suggestion.topicId ?? index}`;
    setAddingSuggestion(key);
    try {
      const scheduledDate = new Date();
      scheduledDate.setMinutes(0, 0, 0);
      scheduledDate.setHours(scheduledDate.getHours() + 1 + index);
      await api.post('/schedules', {
        subjectId: suggestion.subjectId,
        topicId: suggestion.topicId,
        title: suggestion.topicName || `Estudo de ${suggestion.subjectName}`,
        date: scheduledDate.toISOString(),
        durationMin: suggestion.durationMin,
        notes: suggestion.reason,
      });
      await load();
      showToast('Sugestão adicionada à agenda.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível adicionar.', 'error');
    } finally {
      setAddingSuggestion(null);
    }
  }

  async function updateStatus(schedule: Schedule, status: ScheduleStatus) {
    try {
      const response = await api.patch<{ schedule: Schedule }>(`/schedules/${schedule.id}`, { status });
      setSchedules((current) =>
        current.map((item) => (item.id === schedule.id ? { ...item, ...response.schedule } : item)),
      );
      showToast(status === 'CONCLUIDO' ? 'Bloco concluído.' : 'Agenda atualizada.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível atualizar.', 'error');
    }
  }

  async function deleteSchedule(schedule: Schedule) {
    if (!window.confirm('Remover este bloco da agenda?')) return;
    try {
      await api.delete(`/schedules/${schedule.id}`);
      setSchedules((current) => current.filter((item) => item.id !== schedule.id));
      showToast('Bloco removido.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível remover.', 'error');
    }
  }

  if (loading) return <LoadingState label="Distribuindo seus blocos de estudo…" />;
  if (error) {
    return (
      <EmptyState
        icon={<CircleAlert size={28} />}
        title="A agenda não abriu"
        description={error}
        action={<Button onClick={() => void load()}><RefreshCw size={17} />Tentar novamente</Button>}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Planejamento semanal"
        title="Agenda"
        description="Transforme prioridade em horário reservado — com espaço para pausas e imprevistos."
        action={<AddButton onClick={() => setModalOpen(true)} disabled={!subjects.length}>Novo bloco</AddButton>}
      />

      <section className="schedule-layout">
        <Card className="schedule-list-card">
          <header className="list-toolbar">
            <div>
              <p className="eyebrow">Blocos de estudo</p>
              <h2>Sua programação</h2>
            </div>
            <Select aria-label="Filtrar agenda" value={filter} onChange={(event) => setFilter(event.target.value as 'all' | ScheduleStatus)}>
              <option value="all">Todos os status</option>
              <option value="PLANEJADO">Planejados</option>
              <option value="CONCLUIDO">Concluídos</option>
              <option value="CANCELADO">Cancelados</option>
            </Select>
          </header>

          {visibleSchedules.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={30} />}
              title={schedules.length ? 'Nenhum bloco neste filtro' : 'Sua agenda está livre'}
              description={schedules.length ? 'Escolha outro status para ver a programação.' : 'Crie um bloco ou aceite uma das sugestões ao lado.'}
              action={!schedules.length && subjects.length ? <AddButton onClick={() => setModalOpen(true)}>Criar bloco</AddButton> : undefined}
            />
          ) : (
            <div className="schedule-list">
              {visibleSchedules.map((schedule) => (
                <article className={`schedule-item ${schedule.status === 'CONCLUIDO' ? 'is-complete' : ''}`} key={schedule.id}>
                  <div className="schedule-item__time">
                    <strong>{new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(schedule.date))}</strong>
                    <span>{formatDate(schedule.date)}</span>
                  </div>
                  <span className="schedule-item__line" style={{ backgroundColor: schedule.subject.color }} />
                  <div className="schedule-item__content">
                    <strong>{schedule.title || schedule.topic?.name || schedule.subject.name}</strong>
                    <span>{schedule.subject.name}{schedule.notes ? ` · ${schedule.notes}` : ''}</span>
                  </div>
                  <div className="schedule-item__duration"><Clock3 size={15} />{formatMinutes(schedule.durationMin)}</div>
                  <Badge value={schedule.status} />
                  <div className="schedule-item__actions">
                    {schedule.status === 'PLANEJADO' ? (
                      <button type="button" className="icon-button icon-button--success" aria-label="Marcar como concluído" onClick={() => void updateStatus(schedule, 'CONCLUIDO')}>
                        <Check size={17} />
                      </button>
                    ) : null}
                    <button type="button" className="icon-button" aria-label="Remover bloco" onClick={() => void deleteSchedule(schedule)}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card className="suggestion-panel">
          <header>
            <span><Sparkles size={20} /></span>
            <div>
              <p className="eyebrow">Plano automático</p>
              <h2>Sugestões para hoje</h2>
            </div>
          </header>
          <p className="suggestion-panel__intro">
            A ordem considera revisões atrasadas, prioridade e desempenho em questões.
          </p>
          {suggestions?.suggestedBlocks.length ? (
            <div className="suggestion-list">
              {suggestions.suggestedBlocks.slice(0, 5).map((suggestion, index) => {
                const key = `${suggestion.subjectId}-${suggestion.topicId ?? index}`;
                return (
                  <article key={key}>
                    <div>
                      <strong>{suggestion.topicName || suggestion.subjectName}</strong>
                      <span>{suggestion.reason}</span>
                    </div>
                    <small>{formatMinutes(suggestion.durationMin)}</small>
                    <Button variant="ghost" loading={addingSuggestion === key} onClick={() => void addSuggestion(suggestion, index)}>
                      <Plus size={16} />Adicionar
                    </Button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="suggestion-empty">
              <Lightbulb size={24} />
              <strong>Faltam prioridades</strong>
              <span>Adicione conteúdos ou questões para gerar sugestões.</span>
            </div>
          )}
          {suggestions ? (
            <footer>
              <span>Meta disponível</span>
              <strong>{formatMinutes(suggestions.minutesAvailable)}</strong>
            </footer>
          ) : null}
        </Card>
      </section>

      <Modal open={modalOpen} title="Novo bloco de estudo" description="Reserve um horário específico para diminuir a fricção de começar." onClose={() => setModalOpen(false)}>
        <form className="form-stack" onSubmit={createSchedule}>
          <div className="form-grid form-grid--2">
            <Field label="Matéria">
              <Select value={subjectId} onChange={(event) => { setSubjectId(event.target.value); setTopicId(''); }} required>
                <option value="">Selecione</option>
                {subjects.map((subject) => <option value={subject.id} key={subject.id}>{subject.name}</option>)}
              </Select>
            </Field>
            <Field label="Conteúdo" hint="Opcional">
              <Select value={topicId} onChange={(event) => setTopicId(event.target.value)}>
                <option value="">Estudo geral</option>
                {availableTopics.map((topic) => <option value={topic.id} key={topic.id}>{topic.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Título" hint="Opcional">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Lista de funções e correção" />
          </Field>
          <div className="form-grid form-grid--2">
            <Field label="Data e hora">
              <Input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} required />
            </Field>
            <Field label="Duração em minutos">
              <Input type="number" min="5" max="720" value={durationMin} onChange={(event) => setDurationMin(Number(event.target.value))} required />
            </Field>
          </div>
          <Field label="Observação" hint="Opcional">
            <Textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Material, objetivo ou ponto de partida." />
          </Field>
          <ModalActions>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving} disabled={!subjectId}>Agendar bloco</Button>
          </ModalActions>
        </form>
      </Modal>
    </div>
  );
}
