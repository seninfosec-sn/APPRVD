import { create } from 'zustand';
import { MeetingInvite, RoomReservation, ReservationStatus } from '../types';

export type Reservation = MeetingInvite | RoomReservation;

interface CreateMeetingPayload {
  title: string;
  description?: string;
  initiator: { id: string; displayName: string; email: string; avatarUrl?: string };
  invitee: { id: string; displayName: string; email: string; avatarUrl?: string };
  slot: { startAt: string; endAt: string; timezone: string };
  location?: { type: 'room' | 'address' | 'video'; roomId?: string; address?: string; videoUrl?: string };
}

interface CreateRoomPayload {
  title: string;
  description?: string;
  organizer: { id: string; displayName: string; email: string; avatarUrl?: string };
  room: { id: string; name: string; building: string; capacity: number };
  slot: { startAt: string; endAt: string; timezone: string };
}

function getApiBase() {
  if (typeof window !== 'undefined') return '';
  return process.env.EXPO_PUBLIC_API_URL || '';
}

interface ReservationStore {
  reservations: Reservation[];
  isLoading: boolean;
  error: string | null;

  loadReservations: (userId: string) => Promise<void>;
  loadSingle: (id: string) => Promise<void>;
  createMeeting: (data: CreateMeetingPayload) => Promise<MeetingInvite>;
  createRoomReservation: (data: CreateRoomPayload) => Promise<RoomReservation>;
  confirmMeeting: (id: string, userId: string) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;

  getById: (id: string) => Reservation | undefined;
  getUpcoming: () => Reservation[];
  getPast: () => Reservation[];
  getPending: () => Reservation[];
}

export const useReservationStore = create<ReservationStore>((set, get) => ({
  reservations: [],
  isLoading: false,
  error: null,

  loadReservations: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${getApiBase()}/api/reservations?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      set({ reservations: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  loadSingle: async (id: string) => {
    try {
      const res = await fetch(`${getApiBase()}/api/reservations/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      set((state) => {
        const exists = state.reservations.find((r) => r.id === id);
        if (exists) {
          return { reservations: state.reservations.map((r) => (r.id === id ? data : r)) };
        }
        return { reservations: [data, ...state.reservations] };
      });
    } catch {}
  },

  createMeeting: async (data: CreateMeetingPayload) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${getApiBase()}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'meeting', ...data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur création');
      }
      const meeting: MeetingInvite = await res.json();
      set((state) => ({ reservations: [meeting, ...state.reservations], isLoading: false }));
      return meeting;
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  createRoomReservation: async (data: CreateRoomPayload) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${getApiBase()}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'room', ...data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur création');
      }
      const reservation: RoomReservation = await res.json();
      set((state) => ({ reservations: [reservation, ...state.reservations], isLoading: false }));
      return reservation;
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  confirmMeeting: async (id: string, userId: string) => {
    try {
      const res = await fetch(`${getApiBase()}/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm', userId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur confirmation');
      }
      const updated = await res.json();
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? updated : r)),
      }));
    } catch (err: any) {
      throw err;
    }
  },

  cancelReservation: async (id: string) => {
    try {
      const res = await fetch(`${getApiBase()}/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Erreur annulation');
      const updated = await res.json();
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? updated : r)),
      }));
    } catch (err: any) {
      throw err;
    }
  },

  deleteReservation: async (id: string) => {
    try {
      await fetch(`${getApiBase()}/api/reservations/${id}`, { method: 'DELETE' });
      set((state) => ({ reservations: state.reservations.filter((r) => r.id !== id) }));
    } catch {}
  },

  getById: (id: string) => get().reservations.find((r) => r.id === id),

  getUpcoming: () => {
    const now = new Date();
    return get()
      .reservations.filter((r) => {
        const slot = (r as any).slot;
        return slot && new Date(slot.startAt) >= now && r.status !== 'cancelled' && r.status !== 'expired';
      })
      .sort((a, b) => new Date((a as any).slot.startAt).getTime() - new Date((b as any).slot.startAt).getTime());
  },

  getPast: () => {
    const now = new Date();
    return get()
      .reservations.filter((r) => {
        const slot = (r as any).slot;
        return slot && new Date(slot.endAt) < now;
      })
      .sort((a, b) => new Date((b as any).slot.startAt).getTime() - new Date((a as any).slot.startAt).getTime());
  },

  getPending: () =>
    get().reservations.filter((r) => r.status === 'pending' || r.status === 'proposed'),
}));
