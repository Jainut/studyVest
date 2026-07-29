import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, clearToken, getStoredToken, storeToken } from '../lib/api';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  checking: boolean;
  login(email: string, password: string): Promise<void>;
  register(input: {
    name: string;
    email: string;
    password: string;
    dailyGoalMin?: number;
  }): Promise<void>;
  updateProfile(input: { name?: string; dailyGoalMin?: number }): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!getStoredToken()) {
        setChecking(false);
        return;
      }
      try {
        const response = await api.get<{ user: User }>('/auth/me');
        if (active) setUser(response.user);
      } catch {
        clearToken();
      } finally {
        if (active) setChecking(false);
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<{ user: User; token: string }>('/auth/login', {
      email,
      password,
    });
    storeToken(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      dailyGoalMin?: number;
    }) => {
      const response = await api.post<{ user: User; token: string }>('/auth/register', input);
      storeToken(response.token);
      setUser(response.user);
    },
    [],
  );

  const updateProfile = useCallback(
    async (input: { name?: string; dailyGoalMin?: number }) => {
      const response = await api.patch<{ user: User }>('/auth/me', input);
      setUser(response.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, checking, login, register, updateProfile, logout }),
    [checking, login, logout, register, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider.');
  return context;
}
