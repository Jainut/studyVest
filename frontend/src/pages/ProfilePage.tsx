import { FormEvent, useEffect, useState } from 'react';
import {
  CalendarRange,
  CircleUserRound,
  Clock3,
  Database,
  LogOut,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { Button, Card, Field, Input, PageHeader } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../lib/api';
import { formatMinutes, initials } from '../lib/format';

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [dailyGoalMin, setDailyGoalMin] = useState(user?.dailyGoalMin ?? 180);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
    setDailyGoalMin(user?.dailyGoalMin ?? 180);
  }, [user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, dailyGoalMin });
      showToast('Perfil e meta diária atualizados.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Não foi possível salvar.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Preferências"
        title="Seu perfil"
        description="Ajuste sua meta para que as sugestões caibam na rotina real."
      />

      <section className="profile-layout">
        <Card className="profile-identity">
          <span className="profile-avatar">{initials(user?.name ?? 'SV')}</span>
          <div>
            <p className="eyebrow">Conta StudyVest</p>
            <h2>{user?.name}</h2>
            <span>{user?.email}</span>
          </div>
          <div className="profile-identity__meta">
            <span><Clock3 size={16} /> Meta de {formatMinutes(user?.dailyGoalMin ?? 0)}</span>
            <span><CalendarRange size={16} /> Desde {user?.createdAt ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(user.createdAt)) : 'agora'}</span>
          </div>
        </Card>

        <Card className="profile-form-card">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Dados principais</p>
              <h2>Perfil e ritmo</h2>
            </div>
            <CircleUserRound size={21} />
          </header>
          <form className="form-stack" onSubmit={submit}>
            <Field label="Nome">
              <Input value={name} onChange={(event) => setName(event.target.value)} minLength={2} required />
            </Field>
            <Field label="E-mail" hint="O e-mail de acesso não pode ser alterado por aqui.">
              <Input value={user?.email ?? ''} disabled />
            </Field>
            <Field label="Meta diária em minutos" hint={`Equivale a ${formatMinutes(dailyGoalMin)} por dia.`}>
              <Input type="number" min="30" max="720" step="15" value={dailyGoalMin} onChange={(event) => setDailyGoalMin(Number(event.target.value))} required />
            </Field>
            <Button type="submit" loading={saving}>
              <Save size={17} />
              Salvar alterações
            </Button>
          </form>
        </Card>

        <Card className="privacy-card">
          <header>
            <span><ShieldCheck size={22} /></span>
            <div>
              <strong>Dados isolados por conta</strong>
              <p>Matérias, questões, redações e agenda são sempre filtradas pelo seu usuário autenticado.</p>
            </div>
          </header>
          <div>
            <Database size={18} />
            <span>Persistência PostgreSQL via Prisma</span>
          </div>
          <button type="button" onClick={logout}>
            <LogOut size={17} />
            Sair da conta
          </button>
        </Card>
      </section>
    </div>
  );
}
