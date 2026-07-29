import {
  ButtonHTMLAttributes,
  FormEvent,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  useEffect,
} from 'react';
import { LoaderCircle, Plus, X } from 'lucide-react';
import { Difficulty, Priority, ReviewStatus, ScheduleStatus, TopicStatus } from '../types';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  children,
  variant = 'primary',
  loading,
  className = '',
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  return (
    <button
      className={`button button--${variant} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="spin" size={17} /> : null}
      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {action ? <div className="page-header__action">{action}</div> : null}
    </header>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`field ${className}`}>
      <span className="field__label">{label}</span>
      {children}
      {error ? <span className="field__error">{error}</span> : null}
      {!error && hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="input select" {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="input textarea" {...props} />;
}

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  size = 'medium',
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose(): void;
  size?: 'small' | 'medium' | 'large';
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`modal modal--${size}`}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="modal__actions">{children}</div>;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ label = 'Organizando seus estudos…' }: { label?: string }) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-mark">
        <i />
        <i />
        <i />
      </span>
      <span>{label}</span>
    </div>
  );
}

type BadgeValue = TopicStatus | Priority | Difficulty | ReviewStatus | ScheduleStatus | string;

const badgeLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  ESTUDANDO: 'Estudando',
  REVISANDO: 'Revisando',
  DOMINADO: 'Dominado',
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
  FACIL: 'Fácil',
  MEDIO: 'Médio',
  DIFICIL: 'Difícil',
  ATRASADA: 'Atrasada',
  CONCLUIDA: 'Concluída',
  PLANEJADO: 'Planejado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

export function Badge({ value }: { value: BadgeValue }) {
  return <span className={`badge badge--${value.toLowerCase()}`}>{badgeLabels[value] ?? value}</span>;
}

export function ProgressBar({
  value,
  label,
  color,
}: {
  value: number;
  label?: string;
  color?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="progress" aria-label={label} aria-valuenow={safeValue} role="progressbar">
      <span style={{ width: `${safeValue}%`, backgroundColor: color }} />
    </div>
  );
}

export function AddButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button {...props}>
      <Plus size={17} />
      {children}
    </Button>
  );
}

export function Form({
  children,
  onSubmit,
  className = '',
}: {
  children: ReactNode;
  onSubmit(event: FormEvent<HTMLFormElement>): void | Promise<void>;
  className?: string;
}) {
  return (
    <form className={`form-stack ${className}`} onSubmit={onSubmit}>
      {children}
    </form>
  );
}
