import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Layers3,
  MoreHorizontal,
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
  ProgressBar,
  Select,
  Textarea,
} from '../components/UI';
import { useToast } from '../context/ToastContext';
import { api, ApiError } from '../lib/api';
import { Difficulty, Priority, Subject, Topic, TopicStatus } from '../types';

const subjectColors = ['#315C8A', '#D97745', '#2A8C82', '#5A8F62', '#755B9C', '#C8604C'];

const statusOrder: TopicStatus[] = ['PENDENTE', 'ESTUDANDO', 'REVISANDO', 'DOMINADO'];

export function SubjectsPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subjectModal, setSubjectModal] = useState(false);
  const [topicModal, setTopicModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [subjectName, setSubjectName] = useState('');
  const [subjectColor, setSubjectColor] = useState(subjectColors[0]!);

  const [topicName, setTopicName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicPriority, setTopicPriority] = useState<Priority>('MEDIA');
  const [topicDifficulty, setTopicDifficulty] = useState<Difficulty>('MEDIO');
  const [fuvestImportance, setFuvestImportance] = useState(3);
  const [enemImportance, setEnemImportance] = useState(3);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [subjectResponse, topicResponse] = await Promise.all([
        api.get<{ subjects: Subject[] }>('/subjects'),
        api.get<{ topics: Topic[] }>('/topics'),
      ]);
      setSubjects(subjectResponse.subjects);
      setTopics(topicResponse.topics);
      setSelectedSubjectId((current) => current || subjectResponse.subjects[0]?.id || '');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar as matérias.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId);
  const selectedTopics = useMemo(
    () => topics.filter((topic) => topic.subjectId === selectedSubjectId),
    [selectedSubjectId, topics],
  );

  function progressFor(subjectId: string) {
    const items = topics.filter((topic) => topic.subjectId === subjectId);
    if (items.length === 0) return 0;
    return Math.round((items.filter((topic) => topic.status === 'DOMINADO').length / items.length) * 100);
  }

  async function createSubject(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.post<{ subject: Subject }>('/subjects', {
        name: subjectName,
        color: subjectColor,
      });
      setSubjects((current) => [...current, { ...response.subject, _count: { topics: 0 } }]);
      setSelectedSubjectId(response.subject.id);
      setSubjectName('');
      setSubjectModal(false);
      showToast('Matéria adicionada ao seu mapa.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível criar a matéria.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function createTopic(event: FormEvent) {
    event.preventDefault();
    if (!selectedSubjectId) return;
    setSaving(true);
    try {
      const response = await api.post<{ topic: Topic }>('/topics', {
        subjectId: selectedSubjectId,
        name: topicName,
        description: topicDescription || undefined,
        priority: topicPriority,
        difficulty: topicDifficulty,
        fuvestImportance,
        enemImportance,
      });
      setTopics((current) => [{ ...response.topic, subject: selectedSubject }, ...current]);
      setTopicName('');
      setTopicDescription('');
      setTopicPriority('MEDIA');
      setTopicDifficulty('MEDIO');
      setFuvestImportance(3);
      setEnemImportance(3);
      setTopicModal(false);
      showToast('Conteúdo incluído na trilha.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível criar o conteúdo.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function updateTopicStatus(topic: Topic, status: TopicStatus) {
    try {
      const response =
        status === 'REVISANDO'
          ? await api.post<{ topic: Topic }>(`/topics/${topic.id}/complete`)
          : await api.patch<{ topic: Topic }>(`/topics/${topic.id}`, { status });
      setTopics((current) =>
        current.map((item) => (item.id === topic.id ? { ...item, ...response.topic } : item)),
      );
      showToast(status === 'REVISANDO' ? 'Revisões D+1, D+7 e D+30 agendadas.' : 'Status atualizado.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível atualizar.', 'error');
    }
  }

  async function deleteTopic(topic: Topic) {
    if (!window.confirm(`Remover o conteúdo “${topic.name}”?`)) return;
    try {
      await api.delete(`/topics/${topic.id}`);
      setTopics((current) => current.filter((item) => item.id !== topic.id));
      showToast('Conteúdo removido.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível remover.', 'error');
    }
  }

  async function deleteSubject(subject: Subject) {
    if (!window.confirm(`Remover “${subject.name}” e todos os dados vinculados?`)) return;
    try {
      await api.delete(`/subjects/${subject.id}`);
      setSubjects((current) => current.filter((item) => item.id !== subject.id));
      setTopics((current) => current.filter((topic) => topic.subjectId !== subject.id));
      const next = subjects.find((item) => item.id !== subject.id);
      setSelectedSubjectId(next?.id ?? '');
      showToast('Matéria removida.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível remover.', 'error');
    }
  }

  if (loading) return <LoadingState label="Abrindo seu mapa de conteúdos…" />;

  if (error) {
    return (
      <EmptyState
        icon={<CircleAlert size={28} />}
        title="Não foi possível abrir as matérias"
        description={error}
        action={<Button onClick={() => void load()}><RefreshCw size={17} />Tentar novamente</Button>}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Mapa de conteúdos"
        title="Matérias"
        description="Transforme o edital em uma trilha visível e acompanhe cada avanço."
        action={<AddButton onClick={() => setSubjectModal(true)}>Nova matéria</AddButton>}
      />

      {subjects.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={30} />}
          title="Seu mapa começa por uma matéria"
          description="Adicione a primeira matéria e depois divida o estudo em conteúdos menores."
          action={<AddButton onClick={() => setSubjectModal(true)}>Adicionar matéria</AddButton>}
        />
      ) : (
        <>
          <section className="subject-grid" aria-label="Matérias cadastradas">
            {subjects.map((subject) => {
              const progress = progressFor(subject.id);
              const count = topics.filter((topic) => topic.subjectId === subject.id).length;
              return (
                <button
                  type="button"
                  key={subject.id}
                  className={`subject-card ${subject.id === selectedSubjectId ? 'is-selected' : ''}`}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  style={{ '--subject-color': subject.color } as React.CSSProperties}
                >
                  <span className="subject-card__tab" />
                  <span className="subject-card__icon"><BookOpen size={20} /></span>
                  <strong>{subject.name}</strong>
                  <small>{count} {count === 1 ? 'conteúdo' : 'conteúdos'}</small>
                  <ProgressBar value={progress} color={subject.color} />
                  <span className="subject-card__progress">{progress}% dominado</span>
                </button>
              );
            })}
          </section>

          <Card className="topic-board">
            <header className="topic-board__header">
              <div>
                <span
                  className="subject-dot"
                  style={{ backgroundColor: selectedSubject?.color }}
                />
                <div>
                  <p className="eyebrow">Conteúdos de</p>
                  <h2>{selectedSubject?.name}</h2>
                </div>
              </div>
              <div className="topic-board__actions">
                {selectedSubject ? (
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remover ${selectedSubject.name}`}
                    onClick={() => void deleteSubject(selectedSubject)}
                  >
                    <Trash2 size={18} />
                  </button>
                ) : null}
                <Button type="button" variant="secondary" onClick={() => setTopicModal(true)}>
                  <Plus size={17} />
                  Novo conteúdo
                </Button>
              </div>
            </header>

            {selectedTopics.length === 0 ? (
              <EmptyState
                icon={<Layers3 size={28} />}
                title="Divida a matéria em conteúdos"
                description="Ex.: Funções, Geometria plana ou Interpretação de texto."
                action={<Button onClick={() => setTopicModal(true)}><Plus size={17} />Adicionar conteúdo</Button>}
              />
            ) : (
              <div className="topic-table">
                <div className="topic-table__head">
                  <span>Conteúdo</span>
                  <span>Prioridade</span>
                  <span>Dificuldade</span>
                  <span>Status</span>
                  <span />
                </div>
                {selectedTopics.map((topic) => (
                  <article className="topic-row" key={topic.id}>
                    <div className="topic-row__name">
                      <span
                        className={`topic-check ${topic.status === 'DOMINADO' ? 'is-complete' : ''}`}
                      >
                        {topic.status === 'DOMINADO' ? <CheckCircle2 size={18} /> : <span />}
                      </span>
                      <div>
                        <strong>{topic.name}</strong>
                        <small>{topic.description || `Importância FUVEST ${topic.fuvestImportance}/5 · ENEM ${topic.enemImportance}/5`}</small>
                      </div>
                    </div>
                    <Badge value={topic.priority} />
                    <Badge value={topic.difficulty} />
                    <Select
                      aria-label={`Status de ${topic.name}`}
                      value={topic.status}
                      onChange={(event) => {
                        const next = event.target.value as TopicStatus;
                        if (next === 'REVISANDO' && topic.status !== 'REVISANDO') {
                          void updateTopicStatus(topic, 'REVISANDO');
                        } else {
                          void updateTopicStatus(topic, next);
                        }
                      }}
                    >
                      {statusOrder.map((status) => (
                        <option value={status} key={status}>
                          {status === 'PENDENTE'
                            ? 'Pendente'
                            : status === 'ESTUDANDO'
                              ? 'Estudando'
                              : status === 'REVISANDO'
                                ? 'Revisando'
                                : 'Dominado'}
                        </option>
                      ))}
                    </Select>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Remover ${topic.name}`}
                      onClick={() => void deleteTopic(topic)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      <Modal open={subjectModal} title="Nova matéria" description="Escolha um nome e uma cor para encontrá-la rapidamente." onClose={() => setSubjectModal(false)} size="small">
        <form className="form-stack" onSubmit={createSubject}>
          <Field label="Nome da matéria">
            <Input value={subjectName} onChange={(event) => setSubjectName(event.target.value)} placeholder="Ex.: Matemática" required autoFocus />
          </Field>
          <Field label="Cor de identificação">
            <div className="color-picker">
              {subjectColors.map((color) => (
                <button
                  type="button"
                  key={color}
                  aria-label={`Usar cor ${color}`}
                  aria-pressed={subjectColor === color}
                  className={subjectColor === color ? 'is-selected' : ''}
                  style={{ backgroundColor: color }}
                  onClick={() => setSubjectColor(color)}
                />
              ))}
            </div>
          </Field>
          <ModalActions>
            <Button type="button" variant="ghost" onClick={() => setSubjectModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Adicionar matéria</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal open={topicModal} title={`Novo conteúdo${selectedSubject ? ` em ${selectedSubject.name}` : ''}`} description="Registre o que precisa ser estudado e indique sua relevância." onClose={() => setTopicModal(false)} size="large">
        <form className="form-stack" onSubmit={createTopic}>
          <Field label="Nome do conteúdo">
            <Input value={topicName} onChange={(event) => setTopicName(event.target.value)} placeholder="Ex.: Geometria analítica" required autoFocus />
          </Field>
          <Field label="Descrição" hint="Opcional">
            <Textarea value={topicDescription} onChange={(event) => setTopicDescription(event.target.value)} placeholder="Delimite o que entra neste conteúdo." rows={3} />
          </Field>
          <div className="form-grid form-grid--2">
            <Field label="Prioridade">
              <Select value={topicPriority} onChange={(event) => setTopicPriority(event.target.value as Priority)}>
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </Select>
            </Field>
            <Field label="Dificuldade percebida">
              <Select value={topicDifficulty} onChange={(event) => setTopicDifficulty(event.target.value as Difficulty)}>
                <option value="FACIL">Fácil</option>
                <option value="MEDIO">Médio</option>
                <option value="DIFICIL">Difícil</option>
              </Select>
            </Field>
          </div>
          <div className="form-grid form-grid--2">
            <Field label="Importância FUVEST" hint={`${fuvestImportance}/5`}>
              <Input type="range" min="1" max="5" value={fuvestImportance} onChange={(event) => setFuvestImportance(Number(event.target.value))} />
            </Field>
            <Field label="Importância ENEM" hint={`${enemImportance}/5`}>
              <Input type="range" min="1" max="5" value={enemImportance} onChange={(event) => setEnemImportance(Number(event.target.value))} />
            </Field>
          </div>
          <div className="inline-note">
            <Sparkles size={17} />
            Ao mover para “Revisando”, o StudyVest cria revisões para 1, 7 e 30 dias.
          </div>
          <ModalActions>
            <Button type="button" variant="ghost" onClick={() => setTopicModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Adicionar conteúdo</Button>
          </ModalActions>
        </form>
      </Modal>
    </div>
  );
}
