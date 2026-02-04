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
  permissions?: string[]; // RBAC permissions
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  permissions: string[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setPermissions: (permissions: string[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      permissions: [],
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
      login: async (email: string, password: string) => {
        // API returns: { data: { accessToken, user, expiresIn, permissions }, message, status, statusCode }
        const response = await http.post<{
          data: { accessToken: string; user: User; expiresIn?: number; permissions?: string[] };
        }>(endpoints.auth.login, { email, password });

        const { accessToken, user, permissions = [] } = response.data;

        if (!accessToken) {
          throw new Error('No token received from server');
        }

        localStorage.setItem('token', accessToken);
        localStorage.setItem('permissions', JSON.stringify(permissions));
        set({ user, isAuthenticated: true, token: accessToken, permissions });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('permissions');
        set({ user: null, isAuthenticated: false, token: null, permissions: [] });
      },
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
      setToken: (token: string) => {
        localStorage.setItem('token', token);
        set({ token });
      },
      setPermissions: (permissions: string[]) => {
        localStorage.setItem('permissions', JSON.stringify(permissions));
        set({ permissions });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        permissions: state.permissions,
      }),
      onRehydrateStorage: () => (state) => {
        // Called after rehydration completes
        state?.setHasHydrated(true);
      },
    },
  ),
);
