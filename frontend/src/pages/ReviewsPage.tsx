import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookCheck,
  Brain,
  CalendarCheck2,
  CheckCircle2,
  CircleAlert,
  ClockAlert,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import {
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
} from '../components/UI';
import { useToast } from '../context/ToastContext';
import { api, ApiError } from '../lib/api';
import { formatDate } from '../lib/format';
import { Review } from '../types';

export function ReviewsPage() {
  const { showToast } = useToast();
  const [today, setToday] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<'today' | 'all'>('today');
  const [selected, setSelected] = useState<Review | null>(null);
  const [performance, setPerformance] = useState(70);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [todayResponse, allResponse] = await Promise.all([
        api.get<{ reviews: Review[] }>('/reviews/today'),
        api.get<{ reviews: Review[] }>('/reviews'),
      ]);
      setToday(todayResponse.reviews);
      setAllReviews(allResponse.reviews);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar as revisões.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleReviews = useMemo(
    () => (tab === 'today' ? today : allReviews),
    [allReviews, tab, today],
  );
  const overdueCount = today.filter((review) => review.status === 'ATRASADA').length;
  const completedCount = allReviews.filter((review) => review.status === 'CONCLUIDA').length;

  async function completeReview() {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await api.patch<{ review: Review }>(`/reviews/${selected.id}/complete`, {
        performance,
      });
      setToday((current) => current.filter((review) => review.id !== selected.id));
      setAllReviews((current) =>
        current.map((review) => (review.id === selected.id ? response.review : review)),
      );
      setSelected(null);
      showToast(
        performance < 60
          ? 'Revisão concluída. Um reforço foi agendado para daqui a 3 dias.'
          : 'Revisão concluída. Seu ciclo foi atualizado.',
      );
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível concluir.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Organizando sua fila de revisão…" />;
  if (error) {
    return (
      <EmptyState
        icon={<CircleAlert size={28} />}
        title="A fila não abriu"
        description={error}
        action={<Button onClick={() => void load()}><RefreshCw size={17} />Tentar novamente</Button>}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Repetição espaçada"
        title="Revisões"
        description="Revise no momento certo para transformar lembrança recente em memória duradoura."
      />

      <section className="review-summary">
        <Card className={overdueCount ? 'review-stat review-stat--urgent' : 'review-stat'}>
          <span><ClockAlert size={21} /></span>
          <div>
            <strong>{overdueCount}</strong>
            <p>atrasadas</p>
          </div>
          <small>{overdueCount ? 'Comece por elas' : 'Fila em dia'}</small>
        </Card>
        <Card className="review-stat">
          <span><CalendarCheck2 size={21} /></span>
          <div>
            <strong>{today.length}</strong>
            <p>para hoje</p>
          </div>
          <small>inclui atrasadas</small>
        </Card>
        <Card className="review-stat">
          <span><Brain size={21} /></span>
          <div>
            <strong>{completedCount}</strong>
            <p>concluídas</p>
          </div>
          <small>no histórico</small>
        </Card>
      </section>

      <Card className="review-queue">
        <header className="review-queue__header">
          <div className="segmented-control" role="tablist" aria-label="Período das revisões">
            <button type="button" role="tab" aria-selected={tab === 'today'} className={tab === 'today' ? 'is-active' : ''} onClick={() => setTab('today')}>
              Para hoje <span>{today.length}</span>
            </button>
            <button type="button" role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'is-active' : ''} onClick={() => setTab('all')}>
              Histórico <span>{allReviews.length}</span>
            </button>
          </div>
          <div className="review-method">
            <RotateCcw size={16} />
            Ciclos D+1 · D+7 · D+30
          </div>
        </header>

        {visibleReviews.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={31} />}
            title={tab === 'today' ? 'Tudo revisado por hoje' : 'Nenhuma revisão criada ainda'}
            description={
              tab === 'today'
                ? 'Você pode avançar em um conteúdo novo sem carregar pendências.'
                : 'Mova um conteúdo para “Revisando” para iniciar o ciclo.'
            }
          />
        ) : (
          <div className="review-list">
            {visibleReviews.map((review) => (
              <article className={`review-item ${review.status === 'ATRASADA' ? 'is-overdue' : ''}`} key={review.id}>
                <div
                  className="review-item__subject"
                  style={{ '--review-color': review.topic.subject.color } as React.CSSProperties}
                >
                  <span />
                  <small>{review.topic.subject.name}</small>
                </div>
                <div className="review-item__content">
                  <strong>{review.topic.name}</strong>
                  <span>
                    {review.status === 'CONCLUIDA'
                      ? `Concluída em ${review.completedAt ? formatDate(review.completedAt) : '—'}`
                      : `Prevista para ${formatDate(review.dueDate)}`}
                  </span>
                </div>
                <div className="review-item__cycle">
                  <small>Intervalo</small>
                  <strong>D+{review.intervalDays}</strong>
                </div>
                <Badge value={review.status} />
                {review.status !== 'CONCLUIDA' ? (
                  <Button
                    type="button"
                    variant={review.status === 'ATRASADA' ? 'primary' : 'secondary'}
                    onClick={() => {
                      setSelected(review);
                      setPerformance(70);
                    }}
                  >
                    <BookCheck size={17} />
                    Concluir
                  </Button>
                ) : (
                  <div className="review-score">{review.performance ?? '—'}%</div>
                )}
              </article>
            ))}
          </div>
        )}
      </Card>

      <Modal open={Boolean(selected)} title="Como foi a revisão?" description={selected ? `${selected.topic.subject.name} · ${selected.topic.name}` : undefined} onClose={() => setSelected(null)} size="small">
        <div className="form-stack">
          <div className={`performance-score ${performance < 60 ? 'is-low' : ''}`}>
            <strong>{performance}%</strong>
            <span>
              {performance < 60
                ? 'Ainda frágil — vamos agendar um reforço.'
                : performance < 85
                  ? 'Boa recuperação. Continue o ciclo.'
                  : 'Conteúdo bem consolidado.'}
            </span>
          </div>
          <Field label="Desempenho percebido" hint="Considere questões e lembrança ativa.">
            <Input type="range" min="0" max="100" step="5" value={performance} onChange={(event) => setPerformance(Number(event.target.value))} />
          </Field>
          <div className="score-shortcuts">
            {[40, 60, 80, 100].map((score) => (
              <button type="button" className={performance === score ? 'is-active' : ''} key={score} onClick={() => setPerformance(score)}>
                {score}%
              </button>
            ))}
          </div>
          <ModalActions>
            <Button type="button" variant="ghost" onClick={() => setSelected(null)}>Cancelar</Button>
            <Button type="button" loading={saving} onClick={() => void completeReview()}>Salvar revisão</Button>
          </ModalActions>
        </div>
      </Modal>
    </div>
  );
}
