// Afcac-Expo-Meet — Types centralisés

export type AuthProvider = 'email' | 'google' | 'apple';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  phone?: string;
  provider: AuthProvider;
  organizationId?: string;
  role: 'admin' | 'user';
  createdAt: string;
  notificationPrefs: NotificationPreferences;
  stats: UserStats;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  reminderMinutesBefore: 15 | 30 | 60 | 120;
}

export interface UserStats {
  totalReservations: number;
  confirmedReservations: number;
  attendanceRate: number;
  favoriteRoomId?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

export interface UserRef {
  id: string;
  displayName: string;
  avatarUrl?: string;
  email: string;
}

// ─── Reservation ─────────────────────────────────────────

export type ReservationType = 'meeting' | 'room';

export type ReservationStatus =
  | 'proposed'
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'expired';

export interface TimeSlot {
  startAt: string;    // ISO 8601
  endAt: string;
  timezone: string;
}

export interface MeetingInvite {
  id: string;
  type: 'meeting';
  title: string;
  description?: string;
  status: ReservationStatus;
  initiator: UserRef;
  invitee: UserRef;
  slot: TimeSlot;
  location?: MeetingLocation;
  chatThreadId: string;
  qrToken?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  confirmations: {
    initiator: boolean;
    invitee: boolean;
  };
}

export type LocationType = 'room' | 'address' | 'video';

export interface MeetingLocation {
  type: LocationType;
  roomId?: string;
  roomName?: string;
  address?: string;
  videoLink?: string;
}

export interface RoomReservation {
  id: string;
  type: 'room';
  title: string;
  description?: string;
  status: ReservationStatus;
  organizer: UserRef;
  attendees: UserRef[];
  room: RoomRef;
  slot: TimeSlot;
  recurrence?: RecurrenceRule;
  chatThreadId: string;
  qrToken?: string;
  createdAt: string;
  updatedAt: string;
}

export type Reservation = MeetingInvite | RoomReservation;

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  until?: string;
  daysOfWeek?: number[];
}

// ─── Room ─────────────────────────────────────────────────

export type Equipment =
  | 'projector'
  | 'whiteboard'
  | 'videoconference'
  | 'tv_screen'
  | 'wifi'
  | 'air_conditioning'
  | 'accessibility'
  | 'phone'
  | 'coffee';

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  equipment: Equipment[];
  photos: string[];
  description?: string;
  isActive: boolean;
  tags: string[];
  rules: RoomRules;
}

export interface RoomRules {
  minDurationMinutes: number;
  maxDurationMinutes: number;
  openingTime: string;   // "HH:mm"
  closingTime: string;
  openDays: number[];    // 0=Dim … 6=Sam
}

export interface RoomRef {
  id: string;
  name: string;
  building: string;
  capacity: number;
}

export interface RoomAvailability {
  roomId: string;
  date: string;          // YYYY-MM-DD
  slots: BusySlot[];
}

export interface BusySlot {
  startAt: string;
  endAt: string;
  reservationId: string;
  isOwn: boolean;
}

// ─── Chat ────────────────────────────────────────────────

export interface ChatThread {
  id: string;
  reservationId: string;
  participants: UserRef[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'system' | 'slot_proposal';
  sentAt: string;
  readBy: string[];
  proposedSlot?: TimeSlot;
}

// ─── Notification ────────────────────────────────────────

export type NotificationType =
  | 'invitation'
  | 'confirmation'
  | 'cancellation'
  | 'reminder'
  | 'counter_proposal'
  | 'no_show'
  | 'conflict';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  reservationId?: string;
  readAt?: string;
  createdAt: string;
}

// ─── Calendar ─────────────────────────────────────────────

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarEvent {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  type: ReservationType;
  color: string;
}
