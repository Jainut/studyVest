import { ReactNode, useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { LoadingState } from './components/UI';
import { useAuth } from './context/AuthContext';
import { useRouter } from './context/RouterContext';
import { AiMentorPage } from './pages/AiMentorPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { EssaysPage } from './pages/EssaysPage';
import { MistakesPage } from './pages/MistakesPage';
import { ProfilePage } from './pages/ProfilePage';
import { QuestionsPage } from './pages/QuestionsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { SchedulePage } from './pages/SchedulePage';
import { SessionsPage } from './pages/SessionsPage';
import { SubjectsPage } from './pages/SubjectsPage';

const pages: Record<string, ReactNode> = {
  '/': <DashboardPage />,
  '/materias': <SubjectsPage />,
  '/sessoes': <SessionsPage />,
  '/revisoes': <ReviewsPage />,
  '/questoes': <QuestionsPage />,
  '/erros': <MistakesPage />,
  '/redacoes': <EssaysPage />,
  '/agenda': <SchedulePage />,
  '/mentor': <AiMentorPage />,
  '/perfil': <ProfilePage />,
};

export default function App() {
  const { user, checking } = useAuth();
  const { path, navigate } = useRouter();

  useEffect(() => {
    if (checking) return;
    if (!user && path !== '/entrar') {
      navigate('/entrar', { replace: true });
    } else if (user && path === '/entrar') {
      navigate('/', { replace: true });
    } else if (user && !pages[path]) {
      navigate('/', { replace: true });
    }
  }, [checking, navigate, path, user]);

  if (checking) {
    return (
      <div className="app-loading">
        <div className="brand brand--loading">
          <span className="brand__mark">S</span>
          <strong>StudyVest</strong>
        </div>
        <LoadingState label="Abrindo seu plano de estudos…" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return <AppShell>{pages[path] ?? <DashboardPage />}</AppShell>;
}
