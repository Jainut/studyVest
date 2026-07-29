import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookCheck,
  Brain,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Flame,
  RefreshCw,
  Route,
  Target,
  Trophy,
} from 'lucide-react';
import { Badge, Button, Card, EmptyState, LoadingState, ProgressBar } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { Link } from '../context/RouterContext';
import { api, ApiError } from '../lib/api';
import { formatDate, formatMinutes } from '../lib/format';
import {
  DashboardCharts,
  DashboardData,
  ScheduleSuggestion,
} from '../types';

interface SuggestionResponse {
  minutesAvailable: number;
  minutesAllocated: number;
  minutesRemaining: number;
  suggestedBlocks: ScheduleSuggestion[];
}

function AccuracyChart({ values }: { values: DashboardCharts['accuracyEvolution'] }) {
  if (values.length === 0) {
    return (
      <div className="chart-empty">
        <Route size={24} />
        <span>Resolva questões para formar sua curva de evolução.</span>
      </div>
    );
  }

  const width = 520;
  const height = 170;
  const padding = 18;
  const denominator = Math.max(1, values.length - 1);
  const points = values.map((value, index) => {
    const x = padding + (index / denominator) * (width - padding * 2);
    const y = height - padding - (value.accuracyPercent / 100) * (height - padding * 2);
    return { x, y, ...value };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolução semanal de acertos">
        {[25, 50, 75, 100].map((line) => {
          const y = height - padding - (line / 100) * (height - padding * 2);
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} />;
        })}
        <polyline points={polyline} />
        {points.map((point) => (
          <g key={point.week}>
            <circle cx={point.x} cy={point.y} r="5" />
            <title>{`${formatDate(point.week)}: ${point.accuracyPercent}%`}</title>
          </g>
        ))}
      </svg>
      <div className="chart-axis">
        <span>{formatDate(values[0]!.week)}</span>
        <span>{formatDate(values[values.length - 1]!.week)}</span>
      </div>
    </div>
  );
}

function TimeBars({ values }: { values: DashboardCharts['timePerSubject'] }) {
  if (values.length === 0) {
    return (
      <div className="chart-empty">
        <Clock3 size={24} />
        <span>Registre uma sessão para comparar o tempo por matéria.</span>
      </div>
    );
  }

  const sorted = [...values].sort((a, b) => b.hours - a.hours).slice(0, 5);
  const max = Math.max(...sorted.map((item) => item.hours), 1);

  return (
    <div className="bar-list">
      {sorted.map((item) => (
        <div className="bar-row" key={item.subject}>
          <span>{item.subject}</span>
          <div><i style={{ width: `${(item.hours / max) * 100}%` }} /></div>
          <strong>{item.hours}h</strong>
        </div>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardResponse, chartResponse, suggestionResponse] = await Promise.all([
        api.get<DashboardData>('/dashboard'),
        api.get<DashboardCharts>('/dashboard/charts'),
        api.get<SuggestionResponse>('/schedules/suggestions'),
      ]);
      setDashboard(dashboardResponse);
      setCharts(chartResponse);
      setSuggestions(suggestionResponse);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar o painel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const nextAction = useMemo(() => {
    if (!dashboard) return null;
    const overdue = dashboard.overdueReviews[0];
    if (overdue) {
      return {
        eyebrow: 'Revisão atrasada',
        title: overdue.topic.name,
        detail: overdue.topic.subject.name,
        to: '/revisoes',
        action: 'Revisar agora',
        tone: 'urgent',
      };
    }
    const schedule = dashboard.upcomingTasks.schedules[0];
    if (schedule) {
      return {
        eyebrow: 'Próximo bloco',
        title: schedule.title || schedule.topic?.name || 'Sessão planejada',
        detail: `${formatDate(schedule.date)} · ${formatMinutes(schedule.durationMin)}`,
        to: '/agenda',
        action: 'Ver agenda',
        tone: 'normal',
      };
    }
    const review = dashboard.upcomingTasks.reviews[0];
    if (review) {
      return {
        eyebrow: 'Próxima revisão',
        title: review.topic.name,
        detail: `${review.topic.subject.name} · ${formatDate(review.dueDate)}`,
        to: '/revisoes',
        action: 'Ver revisão',
        tone: 'normal',
      };
    }
    return {
      eyebrow: 'Plano livre',
      title: 'Escolha um conteúdo prioritário',
      detail: 'Sua fila está em dia. Aproveite para avançar.',
      to: '/materias',
      action: 'Abrir matérias',
      tone: 'normal',
    };
  }, [dashboard]);

  if (loading) return <LoadingState label="Montando sua rota de hoje…" />;

  if (error || !dashboard || !charts) {
    return (
      <EmptyState
        icon={<CircleAlert size={28} />}
        title="O painel não abriu"
        description={error || 'Tente carregar os indicadores novamente.'}
        action={
          <Button type="button" onClick={() => void load()}>
            <RefreshCw size={17} />
            Tentar novamente
          </Button>
        }
      />
    );
  }

  const firstName = user?.name.split(' ')[0] ?? 'Estudante';

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <p className="eyebrow">Sua rota de hoje</p>
          <h1>Bom estudo, {firstName}.</h1>
          <p>O mais importante já está priorizado. Agora é um bloco por vez.</p>
        </div>

        <div className="daily-compass">
          <div
            className="progress-ring"
            style={{ '--progress': `${dashboard.dailyGoal.progressPercent * 3.6}deg` } as CSSProperties}
          >
            <div>
              <strong>{dashboard.dailyGoal.progressPercent}%</strong>
              <span>da meta</span>
            </div>
          </div>
          <div>
            <span>Hoje</span>
            <strong>
              {formatMinutes(dashboard.dailyGoal.studiedMin)} de{' '}
              {formatMinutes(dashboard.dailyGoal.goalMin)}
            </strong>
            <Link to="/sessoes">
              Registrar sessão <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="next-action-grid">
        <Card className={`next-action next-action--${nextAction?.tone}`}>
          <div className="next-action__icon">
            {nextAction?.tone === 'urgent' ? <Flame size={22} /> : <Target size={22} />}
          </div>
          <div>
            <p className="eyebrow">{nextAction?.eyebrow}</p>
            <h2>{nextAction?.title}</h2>
            <span>{nextAction?.detail}</span>
          </div>
          <Link className="button button--primary" to={nextAction?.to ?? '/materias'}>
            {nextAction?.action}
            <ArrowRight size={17} />
          </Link>
        </Card>

        <div className="metric-strip">
          <div>
            <span className="metric-icon metric-icon--blue"><Clock3 size={18} /></span>
            <p>Esta semana</p>
            <strong>{dashboard.weekHoursStudied}h</strong>
          </div>
          <div>
            <span className="metric-icon metric-icon--green"><Trophy size={18} /></span>
            <p>Conteúdos dominados</p>
            <strong>{dashboard.overallProgress}%</strong>
          </div>
          <div>
            <span className="metric-icon metric-icon--amber"><Brain size={18} /></span>
            <p>Acerto geral</p>
            <strong>{dashboard.questionsPerformance.accuracyPercent ?? '—'}{dashboard.questionsPerformance.accuracyPercent !== null ? '%' : ''}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-layout">
        <Card className="study-trail">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Blocos sugeridos</p>
              <h2>Trilha do dia</h2>
            </div>
            <Link to="/agenda">Abrir agenda <ChevronRight size={16} /></Link>
          </header>

          {suggestions?.suggestedBlocks.length ? (
            <ol className="trail-list">
              {suggestions.suggestedBlocks.slice(0, 5).map((block, index) => (
                <li key={`${block.subjectId}-${block.topicId ?? index}`}>
                  <span className="trail-list__marker">
                    {index === 0 ? <Route size={17} /> : index + 1}
                  </span>
                  <span className="trail-list__connector" />
                  <div>
                    <strong>{block.topicName ?? block.subjectName}</strong>
                    <small>{block.subjectName} · {block.reason}</small>
                  </div>
                  <time>{formatMinutes(block.durationMin)}</time>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={<CheckCircle2 size={26} />}
              title="Trilha livre"
              description="Adicione conteúdos prioritários para receber uma sugestão automática."
              action={<Link className="text-link" to="/materias">Organizar matérias</Link>}
            />
          )}

          {suggestions ? (
            <div className="trail-total">
              <span>Tempo distribuído</span>
              <ProgressBar
                value={
                  suggestions.minutesAvailable > 0
                    ? (suggestions.minutesAllocated / suggestions.minutesAvailable) * 100
                    : 0
                }
                color="#f2aa3b"
              />
              <strong>{formatMinutes(suggestions.minutesAllocated)}</strong>
            </div>
          ) : null}
        </Card>

        <Card className="review-pulse">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Repetição espaçada</p>
              <h2>Pulso de revisão</h2>
            </div>
            <BookCheck size={21} />
          </header>

          <div className="review-pulse__count">
            <strong>{dashboard.overdueReviews.length}</strong>
            <span>revisões atrasadas</span>
          </div>
          {dashboard.overdueReviews.slice(0, 3).map((review) => (
            <Link to="/revisoes" className="mini-task" key={review.id}>
              <span style={{ backgroundColor: review.topic.subject.color }} />
              <div>
                <strong>{review.topic.name}</strong>
                <small>{review.topic.subject.name}</small>
              </div>
              <Badge value={review.status} />
            </Link>
          ))}
          {dashboard.overdueReviews.length === 0 ? (
            <div className="review-clear">
              <CheckCircle2 size={29} />
              <strong>Fila em dia</strong>
              <span>As próximas revisões aparecerão aqui.</span>
            </div>
          ) : null}
        </Card>
      </section>

      <section className="chart-grid">
        <Card>
          <header className="section-heading">
            <div>
              <p className="eyebrow">Banco de questões</p>
              <h2>Evolução de acertos</h2>
            </div>
            <span className="chart-legend"><i /> % semanal</span>
          </header>
          <AccuracyChart values={charts.accuracyEvolution} />
        </Card>

        <Card>
          <header className="section-heading">
            <div>
              <p className="eyebrow">Distribuição</p>
              <h2>Tempo por matéria</h2>
            </div>
            <CalendarClock size={20} />
          </header>
          <TimeBars values={charts.timePerSubject} />
        </Card>
      </section>
    </div>
  );
}
