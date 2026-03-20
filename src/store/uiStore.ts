import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';
type SnackbarType = 'success' | 'error' | 'info' | 'warning';

interface Snackbar {
  message: string;
  type: SnackbarType;
  id: string;
}

interface UIStore {
  theme: Theme;
  activeBottomSheet: string | null;
  snackbars: Snackbar[];
  unreadNotifications: number;

  setTheme: (t: Theme) => void;
  openBottomSheet: (id: string) => void;
  closeBottomSheet: () => void;
  showSnackbar: (message: string, type?: SnackbarType) => void;
  dismissSnackbar: (id: string) => void;
  setUnreadNotifications: (count: number) => void;
  decrementUnread: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'system',
  activeBottomSheet: null,
  snackbars: [],
  unreadNotifications: 2,

  setTheme: (t) => set({ theme: t }),

  openBottomSheet: (id) => set({ activeBottomSheet: id }),
  closeBottomSheet: () => set({ activeBottomSheet: null }),

  showSnackbar: (message, type = 'success') => {
    const id = 'snack_' + Date.now();
    set((state) => ({
      snackbars: [...state.snackbars, { message, type, id }],
    }));
    setTimeout(() => {
      set((state) => ({
        snackbars: state.snackbars.filter((s) => s.id !== id),
      }));
    }, 3500);
  },

  dismissSnackbar: (id) => {
    set((state) => ({
      snackbars: state.snackbars.filter((s) => s.id !== id),
    }));
  },

  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  decrementUnread: () =>
    set((state) => ({
      unreadNotifications: Math.max(0, state.unreadNotifications - 1),
    })),
}));
