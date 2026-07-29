import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  CircleAlert,
  FilePenLine,
  LineChart,
  Plus,
  RefreshCw,
  Sparkles,
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
import { formatDate } from '../lib/format';
import { Essay } from '../types';

interface EvolutionResponse {
  evolution: Essay[];
  averageByCompetency: Array<{ competency: string; average: number | null }>;
}

function EssaySparkline({ essays }: { essays: Essay[] }) {
  const scored = essays.filter((essay) => essay.score !== null && essay.score !== undefined);
  if (scored.length < 2) {
    return <div className="sparkline-empty">Registre duas notas para visualizar a evolução.</div>;
  }

  const width = 420;
  const height = 120;
  const padding = 12;
  const points = scored.map((essay, index) => ({
    x: padding + (index / Math.max(scored.length - 1, 1)) * (width - padding * 2),
    y: height - padding - ((essay.score ?? 0) / 1000) * (height - padding * 2),
    essay,
  }));

  return (
    <svg className="essay-sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolução das notas de redação">
      {[400, 600, 800, 1000].map((score) => {
        const y = height - padding - (score / 1000) * (height - padding * 2);
        return <line key={score} x1={padding} x2={width - padding} y1={y} y2={y} />;
      })}
      <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} />
      {points.map((point) => (
        <circle key={point.essay.id} cx={point.x} cy={point.y} r="4">
          <title>{`${formatDate(point.essay.date)}: ${point.essay.score}`}</title>
        </circle>
      ))}
    </svg>
  );
}

export function EssaysPage() {
  const { showToast } = useToast();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [evolution, setEvolution] = useState<EvolutionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [competencies, setCompetencies] = useState([120, 120, 120, 120, 120]);
  const [feedback, setFeedback] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [essayResponse, evolutionResponse] = await Promise.all([
        api.get<{ essays: Essay[] }>('/essays'),
        api.get<EvolutionResponse>('/essays/evolution'),
      ]);
      setEssays(essayResponse.essays);
      setEvolution(evolutionResponse);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar as redações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const computedScore = competencies.reduce((sum, value) => sum + value, 0);
  const averageScore = useMemo(() => {
    const values = essays
      .map((essay) => essay.score)
      .filter((score): score is number => score !== null && score !== undefined);
    return values.length ? Math.round(values.reduce((sum, score) => sum + score, 0) / values.length) : null;
  }, [essays]);
  const bestScore = Math.max(
    0,
    ...essays.map((essay) => essay.score ?? 0),
  );

  async function createEssay(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/essays', {
        theme,
        date: new Date(`${date}T12:00:00`).toISOString(),
        comp1: competencies[0],
        comp2: competencies[1],
        comp3: competencies[2],
        comp4: competencies[3],
        comp5: competencies[4],
        feedback: feedback || undefined,
      });
      setTheme('');
      setFeedback('');
      setCompetencies([120, 120, 120, 120, 120]);
      setModalOpen(false);
      await load();
      showToast('Redação registrada na sua evolução.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível salvar.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function deleteEssay(essay: Essay) {
    if (!window.confirm(`Remover a redação “${essay.theme}”?`)) return;
    try {
      await api.delete(`/essays/${essay.id}`);
      await load();
      showToast('Redação removida.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível remover.', 'error');
    }
  }

  function updateCompetency(index: number, value: number) {
    setCompetencies((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  if (loading) return <LoadingState label="Traçando sua evolução na redação…" />;
  if (error) {
    return (
      <EmptyState
        icon={<CircleAlert size={28} />}
        title="As redações não abriram"
        description={error}
        action={<Button onClick={() => void load()}><RefreshCw size={17} />Tentar novamente</Button>}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Construção de repertório"
        title="Redações"
        description="Acompanhe nota e competências separadamente para saber exatamente onde melhorar."
        action={<AddButton onClick={() => setModalOpen(true)}>Registrar redação</AddButton>}
      />

      <section className="essay-overview">
        <Card className="essay-score-card">
          <div>
            <p>Média atual</p>
            <strong>{averageScore ?? '—'}<small>{averageScore !== null ? '/1000' : ''}</small></strong>
            <span>Melhor nota: {bestScore || '—'}</span>
          </div>
          <span className="essay-score-card__mark"><FilePenLine size={27} /></span>
        </Card>
        <Card className="essay-evolution-card">
          <header>
            <div>
              <p className="eyebrow">Série histórica</p>
              <h2>Evolução da nota</h2>
            </div>
            <LineChart size={20} />
          </header>
          <EssaySparkline essays={[...essays].reverse()} />
        </Card>
      </section>

      {evolution?.averageByCompetency.some((item) => item.average !== null) ? (
        <Card className="competency-strip">
          {evolution.averageByCompetency.map((item, index) => (
            <div key={item.competency}>
              <span>C{index + 1}</span>
              <strong>{item.average ?? '—'}</strong>
              <small>média / 200</small>
            </div>
          ))}
        </Card>
      ) : null}

      <Card className="essay-list-card">
        <header className="section-heading">
          <div>
            <p className="eyebrow">Portfólio</p>
            <h2>Redações registradas</h2>
          </div>
          <Sparkles size={20} />
        </header>
        {essays.length === 0 ? (
          <EmptyState
            icon={<FilePenLine size={30} />}
            title="Sua evolução começa na primeira redação"
            description="Registre tema, competências e feedback para formar uma linha de progresso."
            action={<AddButton onClick={() => setModalOpen(true)}>Registrar redação</AddButton>}
          />
        ) : (
          <div className="essay-list">
            {essays.map((essay) => (
              <article className="essay-item" key={essay.id}>
                <div className="essay-item__date">
                  <strong>{new Date(essay.date).getDate().toString().padStart(2, '0')}</strong>
                  <span>{new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(essay.date))}</span>
                </div>
                <div className="essay-item__content">
                  <strong>{essay.theme}</strong>
                  <span>{essay.feedback || 'Sem feedback registrado.'}</span>
                </div>
                <div className="essay-item__competencies">
                  {[essay.comp1, essay.comp2, essay.comp3, essay.comp4, essay.comp5].map((score, index) => (
                    <span key={index}>C{index + 1} <strong>{score ?? '—'}</strong></span>
                  ))}
                </div>
                <div className="essay-item__score">{essay.score ?? '—'}<small>/1000</small></div>
                <button type="button" className="icon-button" aria-label="Remover redação" onClick={() => void deleteEssay(essay)}>
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} title="Registrar redação" description="A nota total será calculada pela soma das cinco competências." onClose={() => setModalOpen(false)} size="large">
        <form className="form-stack" onSubmit={createEssay}>
          <div className="form-grid form-grid--essay">
            <Field label="Tema">
              <Input value={theme} onChange={(event) => setTheme(event.target.value)} placeholder="Ex.: Desafios para a inclusão digital no Brasil" required autoFocus />
            </Field>
            <Field label="Data">
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
            </Field>
          </div>
          <div className="competency-form">
            {competencies.map((score, index) => (
              <Field key={index} label={`Competência ${index + 1}`}>
                <Select value={score} onChange={(event) => updateCompetency(index, Number(event.target.value))}>
                  {[0, 40, 80, 120, 160, 200].map((value) => <option value={value} key={value}>{value}</option>)}
                </Select>
              </Field>
            ))}
          </div>
          <div className="computed-score">
            <span>Nota calculada</span>
            <strong>{computedScore}<small>/1000</small></strong>
          </div>
          <Field label="Feedback" hint="Opcional">
            <Textarea rows={4} value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Registre os pontos fortes e o principal ajuste para a próxima redação." />
          </Field>
          <ModalActions>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Salvar redação</Button>
          </ModalActions>
        </form>
      </Modal>
    </div>
  );
}
