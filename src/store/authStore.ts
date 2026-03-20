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

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        set({ isLoading: false });
        throw new Error(err.error || 'Email ou mot de passe incorrect');
      }
      const dbUser = await res.json();
      const user: User = {
        id: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.displayName,
        avatarUrl: dbUser.avatarUrl || undefined,
        phone: undefined,
        provider: 'email' as const,
        role: dbUser.role || 'user',
        organizationId: 'afcac',
        createdAt: dbUser.createdAt || new Date().toISOString(),
        notificationPrefs: { pushEnabled: true, emailEnabled: true, smsEnabled: false, reminderMinutesBefore: 15 as const },
        stats: { totalReservations: 0, confirmedReservations: 0, attendanceRate: 0 },
      };
      const session: AuthSession = {
        accessToken: 'token-' + Date.now(),
        refreshToken: 'refresh-' + Date.now(),
        expiresAt: Date.now() + 3600000,
        user,
      };
      set({ session, user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
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
