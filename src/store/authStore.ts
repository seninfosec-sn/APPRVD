import { create } from 'zustand';
import { User, AuthSession } from '../types';
import { currentUser } from '../data/mockData';

interface AuthStore {
  session: AuthSession | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  loginWithSSO: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true });
    // Simulation d'un appel API
    await new Promise((r) => setTimeout(r, 1200));
    const mockSession: AuthSession = {
      accessToken: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600 * 1000,
      user: { ...currentUser, email },
    };
    set({
      session: mockSession,
      user: { ...currentUser, email },
      isAuthenticated: true,
      isLoading: false,
    });
  },

  loginWithSSO: async (provider: 'google' | 'apple') => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 1500));
    const mockSession: AuthSession = {
      accessToken: 'mock-sso-token-' + Date.now(),
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600 * 1000,
      user: { ...currentUser, provider },
    };
    set({
      session: mockSession,
      user: { ...currentUser, provider },
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    set({ session: null, user: null, isAuthenticated: false });
  },

  updateUser: (data: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },
}));
