import {
  BookCheck,
  BookMarked,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FilePenLine,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  NotebookTabs,
  SearchCheck,
  X,
  type LucideIcon,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useRouter } from '../context/RouterContext';
import { formatLongDate, initials } from '../lib/format';

interface NavigationItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const navigation: NavigationItem[] = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/materias', label: 'Matérias', icon: LibraryBig },
  { to: '/sessoes', label: 'Sessões', icon: Clock3 },
  { to: '/revisoes', label: 'Revisões', icon: BookCheck },
  { to: '/questoes', label: 'Questões', icon: SearchCheck },
  { to: '/erros', label: 'Caderno de erros', icon: NotebookTabs },
  { to: '/redacoes', label: 'Redações', icon: FilePenLine },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/mentor', label: 'Mentor IA', icon: BrainCircuit },
];

const mobileNavigation = navigation.filter((item) =>
  ['/', '/revisoes', '/questoes', '/agenda'].includes(item.to),
);

function Brand() {
  return (
    <div className="brand" aria-label="StudyVest">
      <span className="brand__mark">
        <BookMarked size={23} strokeWidth={2.2} />
      </span>
      <span>
        <strong>StudyVest</strong>
        <small>Rumo à aprovação</small>
      </span>
    </div>
  );
}

function Navigation({ onNavigate }: { onNavigate?(): void }) {
  return (
    <nav className="sidebar-nav" aria-label="Navegação principal">
      <p className="sidebar-nav__label">Sua preparação</p>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
            <ChevronRight className="sidebar-link__arrow" size={15} />
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { path } = useRouter();

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <Navigation />
        <div className="sidebar__footer">
          <NavLink to="/perfil" className="profile-chip">
            <span className="avatar">{initials(user?.name ?? 'SV')}</span>
            <span>
              <strong>{user?.name}</strong>
              <small>Ver perfil</small>
            </span>
            <CircleUserRound size={18} />
          </NavLink>
          <button type="button" className="logout-button" onClick={logout}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      <header className="mobile-header">
        <Brand />
        <button
          type="button"
          className="icon-button icon-button--light"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {menuOpen ? (
        <div className="mobile-drawer">
          <Navigation onNavigate={() => setMenuOpen(false)} />
          <NavLink to="/perfil" className="profile-chip">
            <span className="avatar">{initials(user?.name ?? 'SV')}</span>
            <span>
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </span>
          </NavLink>
          <button type="button" className="logout-button" onClick={logout}>
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      ) : null}

      <main className="main-area">
        <div className="topline">
          <p>{formatLongDate()}</p>
          <div className="topline__motto">
            <ChartNoAxesCombined size={16} />
            Constância vence intensidade.
          </div>
        </div>
        <div className="page">
          {children}
        </div>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Atalhos">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              <Icon size={20} />
              <span>{item.label === 'Visão geral' ? 'Início' : item.label}</span>
            </NavLink>
          );
        })}
        <button type="button" onClick={() => setMenuOpen(true)}>
          <Menu size={20} />
          <span>Mais</span>
        </button>
      </nav>
    </div>
  );
}
