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
    try {
      // Try to find user in DB
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(email)}`);
      let dbUser = null;
      if (res.ok) {
        const users = await res.json();
        dbUser = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
      }

      // Mock user fallback (keeps existing mock data working)
      const mockUser = {
        id: dbUser?.id || 'u1',
        email: dbUser?.email || email,
        displayName: dbUser?.displayName || email.split('@')[0],
        avatarUrl: dbUser?.avatarUrl || undefined,
        phone: undefined,
        provider: 'email' as const,
        role: 'admin' as const,
        organizationId: 'org1',
        createdAt: new Date().toISOString(),
        notificationPrefs: { pushEnabled: true, emailEnabled: true, smsEnabled: false, reminderMinutesBefore: 15 as const },
        stats: { totalReservations: 0, confirmedReservations: 0, attendanceRate: 0 },
      };

      const session: AuthSession = {
        accessToken: 'mock-token-' + Date.now(),
        refreshToken: 'mock-refresh',
        expiresAt: Date.now() + 3600000,
        user: mockUser,
      };
      set({ session, user: mockUser, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error('Login failed');
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
