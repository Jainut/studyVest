import {
  AnchorHTMLAttributes,
  createContext,
  MouseEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface RouterContextValue {
  path: string;
  navigate(to: string, options?: { replace?: boolean }): void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, '');
  return path || '/';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onPopState = () => setPath(currentPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [path]);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (currentPath() === to) return;
    if (options?.replace) window.history.replaceState(null, '', to);
    else window.history.pushState(null, '', to);
    setPath(currentPath());
  }, []);

  const value = useMemo(() => ({ path, navigate }), [navigate, path]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useRouter precisa estar dentro de RouterProvider.');
  return context;
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  replace?: boolean;
}

export function Link({ to, replace, onClick, ...props }: LinkProps) {
  const { navigate } = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(to, { replace });
  }

  return <a href={to} onClick={handleClick} {...props} />;
}

interface NavLinkProps extends Omit<LinkProps, 'className'> {
  end?: boolean;
  className?: string | ((state: { isActive: boolean }) => string);
}

export function NavLink({ to, end, className, ...props }: NavLinkProps) {
  const { path } = useRouter();
  const isActive = end ? path === to : path === to || path.startsWith(`${to}/`);
  const resolvedClassName =
    typeof className === 'function' ? className({ isActive }) : className;

  return <Link to={to} className={resolvedClassName} {...props} />;
}
