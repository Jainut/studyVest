import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck2,
  Check,
  Route,
  Sparkles,
  Target,
} from 'lucide-react';
import { Button, Field, Input } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goalHours, setGoalHours] = useState(3);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          password,
          dailyGoalMin: goalHours * 60,
        });
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  async function enterDemo() {
    setError('');
    setLoading(true);
    try {
      await login('teste@studyvest.app', 'senha123');
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'Prepare o banco com o seed antes de usar a demonstração.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="auth-story__brand">
          <span className="auth-story__logo">
            <BookOpenCheck size={25} />
          </span>
          <strong>StudyVest</strong>
        </div>

        <div className="auth-story__content">
          <p className="eyebrow eyebrow--light">Seu estudo, com direção</p>
          <h1>
            Da matéria pendente
            <span>à aprovação.</span>
          </h1>
          <p className="auth-story__lead">
            Um plano vivo que combina sua rotina, seus erros e o que precisa ser revisto agora.
          </p>

          <div className="study-map" aria-label="Jornada de preparação">
            <span className="study-map__line" />
            <div className="study-map__stop is-complete">
              <span><Check size={16} /></span>
              <div>
                <strong>Conteúdo mapeado</strong>
                <small>Prioridades visíveis</small>
              </div>
            </div>
            <div className="study-map__stop is-current">
              <span><Route size={17} /></span>
              <div>
                <strong>Ritmo sustentável</strong>
                <small>Plano que cabe no dia</small>
              </div>
            </div>
            <div className="study-map__stop">
              <span><Target size={17} /></span>
              <div>
                <strong>Aprovação</strong>
                <small>Progresso comprovado</small>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-story__foot">
          <Sparkles size={17} />
          <span>FUVEST + ENEM · revisão espaçada · caderno de erros</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-tabs" role="tablist" aria-label="Tipo de acesso">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={mode === 'register' ? 'is-active' : ''}
              onClick={() => {
                setMode('register');
                setError('');
              }}
            >
              Criar conta
            </button>
          </div>

          <header className="auth-card__header">
            <p className="eyebrow">{mode === 'login' ? 'Bem-vindo de volta' : 'Comece pelo essencial'}</p>
            <h2>{mode === 'login' ? 'Continue de onde parou.' : 'Monte sua rotina de aprovação.'}</h2>
            <p>
              {mode === 'login'
                ? 'Entre para ver o que merece sua atenção hoje.'
                : 'Você poderá ajustar tudo depois.'}
            </p>
          </header>

          <form className="form-stack" onSubmit={submit}>
            {mode === 'register' ? (
              <Field label="Seu nome">
                <Input
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Como devemos chamar você?"
                  required
                />
              </Field>
            ) : null}

            <Field label="E-mail">
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
                required
              />
            </Field>

            <Field label="Senha" hint={mode === 'register' ? 'Use pelo menos 6 caracteres.' : undefined}>
              <Input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                minLength={mode === 'register' ? 6 : 1}
                required
              />
            </Field>

            {mode === 'register' ? (
              <Field
                label="Meta diária"
                hint={`${goalHours} ${goalHours === 1 ? 'hora' : 'horas'} por dia`}
              >
                <div className="goal-picker">
                  {[1, 2, 3, 4, 5].map((hours) => (
                    <button
                      type="button"
                      className={goalHours === hours ? 'is-active' : ''}
                      key={hours}
                      onClick={() => setGoalHours(hours)}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </Field>
            ) : null}

            {error ? <div className="form-error" role="alert">{error}</div> : null}

            <Button type="submit" loading={loading} className="button--wide">
              {mode === 'login' ? 'Entrar no meu plano' : 'Criar meu plano'}
              <ArrowRight size={17} />
            </Button>
          </form>

          {mode === 'login' ? (
            <div className="demo-access">
              <span>ou</span>
              <button type="button" onClick={enterDemo} disabled={loading}>
                <CalendarCheck2 size={17} />
                Explorar conta de demonstração
              </button>
            </div>
          ) : null}
        </div>

        <p className="auth-legal">Seus dados de estudo ficam isolados na sua conta.</p>
      </section>
    </main>
  );
}
