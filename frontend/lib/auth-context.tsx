'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { authApi, ApiError, type User } from './api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'access_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback((token: string) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    // Refresh 2 minutes before the 15-minute expiry
    refreshTimerRef.current = setTimeout(
      () => {
        authApi
          .refresh()
          .then(({ accessToken }) => {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(TOKEN_KEY, accessToken);
            }
            scheduleRefresh(accessToken);
          })
          .catch(() => {
            setState({ user: null, token: null, isLoading: false });
          });
      },
      13 * 60 * 1000,
    );
  }, []);

  // On mount, try to pop existing token from sessionStorage
  useEffect(() => {
    const stored =
      typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null;

    if (stored) {
      // Decode user from token payload (no server call needed)
      try {
        const payload = JSON.parse(
          atob(stored.split('.')[1]),
        ) as { sub: string; email: string; role: string; exp: number };

        if (payload.exp * 1000 > Date.now()) {
          setState({ user: { id: payload.sub, email: payload.email, role: payload.role }, token: stored, isLoading: false });
          scheduleRefresh(stored);
          return;
        }
      } catch {
        // malformed token — fall through to refresh
      }
    }

    // Try silent refresh via HttpOnly cookie
    authApi
      .refresh()
      .then(({ accessToken }) => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(TOKEN_KEY, accessToken);
        }
        const payload = JSON.parse(
          atob(accessToken.split('.')[1]),
        ) as { sub: string; email: string; role: string };
        setState({
          user: { id: payload.sub, email: payload.email, role: payload.role },
          token: accessToken,
          isLoading: false,
        });
        scheduleRefresh(accessToken);
      })
      .catch(() => {
        setState({ user: null, token: null, isLoading: false });
      });

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleRefresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user, accessToken } = await authApi.login(email, password);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(TOKEN_KEY, accessToken);
      }
      setState({ user, token: accessToken, isLoading: false });
      scheduleRefresh(accessToken);
    },
    [scheduleRefresh],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const { user, accessToken } = await authApi.register(email, password);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(TOKEN_KEY, accessToken);
      }
      setState({ user, token: accessToken, isLoading: false });
      scheduleRefresh(accessToken);
    },
    [scheduleRefresh],
  );

  const logout = useCallback(async () => {
    if (state.token) {
      await authApi.logout(state.token).catch(() => {});
    }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(TOKEN_KEY);
    }
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setState({ user: null, token: null, isLoading: false });
  }, [state.token]);

  const value = useMemo(
    () => ({ ...state, login, register, logout }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
