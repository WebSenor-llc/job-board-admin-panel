import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import http from '@/api/http';
import endpoints from '@/api/endpoints';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
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
      login: async (email: string, password: string) => {
        try {
          const response = await http.post<{ data: { user: User; token: string } }>(
            endpoints.auth.login,
            { email, password }
          );
          const { user, token } = response as any;
          localStorage.setItem('token', token);
          set({ user, isAuthenticated: true, token });
        } catch (error) {
          throw error;
        }
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
        token: state.token
      }),
    }
  )
);