import { create } from 'zustand';
import {
  Reservation,
  MeetingInvite,
  RoomReservation,
  ReservationStatus,
  TimeSlot,
  UserRef,
  MeetingLocation,
  RoomRef,
} from '../types';
import { allReservations } from '../data/mockData';

interface ReservationStore {
  reservations: Reservation[];
  isLoading: boolean;

  // Actions
  loadReservations: () => Promise<void>;
  createMeeting: (data: CreateMeetingPayload) => Promise<MeetingInvite>;
  createRoomReservation: (data: CreateRoomPayload) => Promise<RoomReservation>;
  updateStatus: (id: string, status: ReservationStatus) => void;
  confirmMeeting: (id: string, userId: string) => void;
  cancelReservation: (id: string) => void;
  deleteReservation: (id: string) => void;

  // Selectors (computed)
  getById: (id: string) => Reservation | undefined;
  getUpcoming: () => Reservation[];
  getPast: () => Reservation[];
  getPending: () => Reservation[];
}

interface CreateMeetingPayload {
  title: string;
  description?: string;
  invitee: UserRef;
  slot: TimeSlot;
  location?: MeetingLocation;
  initiatorId: string;
  initiatorRef: UserRef;
}

interface CreateRoomPayload {
  title: string;
  description?: string;
  room: RoomRef;
  slot: TimeSlot;
  attendees: UserRef[];
  organizerRef: UserRef;
}

function generateId() {
  return 'res_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

export const useReservationStore = create<ReservationStore>((set, get) => ({
  reservations: [],
  isLoading: false,

  loadReservations: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800));
    set({ reservations: allReservations, isLoading: false });
  },

  createMeeting: async (data) => {
    const newMeeting: MeetingInvite = {
      id: generateId(),
      type: 'meeting',
      title: data.title,
      description: data.description,
      status: 'pending',
      initiator: data.initiatorRef,
      invitee: data.invitee,
      slot: data.slot,
      location: data.location,
      chatThreadId: 'ct_' + generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confirmations: { initiator: true, invitee: false },
    };
    set((state) => ({ reservations: [newMeeting, ...state.reservations] }));
    return newMeeting;
  },

  createRoomReservation: async (data) => {
    const newRes: RoomReservation = {
      id: generateId(),
      type: 'room',
      title: data.title,
      description: data.description,
      status: 'confirmed',
      organizer: data.organizerRef,
      attendees: data.attendees,
      room: data.room,
      slot: data.slot,
      chatThreadId: 'ct_' + generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ reservations: [newRes, ...state.reservations] }));
    return newRes;
  },

  updateStatus: (id, status) => {
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
      ),
    }));
  },

  confirmMeeting: (id, userId) => {
    set((state) => ({
      reservations: state.reservations.map((r) => {
        if (r.id !== id || r.type !== 'meeting') return r;
        const meeting = r as MeetingInvite;
        const isInitiator = meeting.initiator.id === userId;
        const updatedConf = {
          ...meeting.confirmations,
          [isInitiator ? 'initiator' : 'invitee']: true,
        };
        const bothConfirmed = updatedConf.initiator && updatedConf.invitee;
        return {
          ...meeting,
          confirmations: updatedConf,
          status: bothConfirmed ? 'confirmed' : 'pending',
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  cancelReservation: (id) => {
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, status: 'cancelled', updatedAt: new Date().toISOString() } : r
      ),
    }));
  },

  deleteReservation: (id) => {
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    }));
  },

  getById: (id) => get().reservations.find((r) => r.id === id),

  getUpcoming: () => {
    const now = new Date();
    return get()
      .reservations.filter(
        (r) => new Date(r.slot.startAt) >= now && r.status !== 'cancelled'
      )
      .sort((a, b) => new Date(a.slot.startAt).getTime() - new Date(b.slot.startAt).getTime());
  },

  getPast: () => {
    const now = new Date();
    return get()
      .reservations.filter((r) => new Date(r.slot.endAt) < now)
      .sort((a, b) => new Date(b.slot.startAt).getTime() - new Date(a.slot.startAt).getTime());
  },

  getPending: () => {
    return get().reservations.filter(
      (r) => r.status === 'pending' || r.status === 'proposed'
    );
  },
}));
