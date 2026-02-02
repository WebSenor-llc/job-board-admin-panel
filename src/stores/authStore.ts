import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import http from '@/api/http';
import endpoints from '@/api/endpoints';

export interface User {
  name: string;
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  isVerified: boolean;
  isMobileVerified: boolean;
  onboardingStep: number;
  isOnboardingCompleted: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
      login: async (email: string, password: string) => {
        // API returns: { data: { accessToken, user, expiresIn }, message, status, statusCode }
        const response = await http.post<{
          data: { accessToken: string; user: User; expiresIn?: number };
        }>(endpoints.auth.login, { email, password });

        const { accessToken, user } = response.data;

        if (!accessToken) {
          throw new Error('No token received from server');
        }

        localStorage.setItem('token', accessToken);
        set({ user, isAuthenticated: true, token: accessToken });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, token: null });
      },
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
      setToken: (token: string) => {
        localStorage.setItem('token', token);
        set({ token });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        // Called after rehydration completes
        state?.setHasHydrated(true);
      },
    },
  ),
);
