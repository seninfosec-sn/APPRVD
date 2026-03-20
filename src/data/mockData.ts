import {
  User,
  Room,
  MeetingInvite,
  RoomReservation,
  ChatThread,
  ChatMessage,
  AppNotification,
} from '../types';

// ─── Utilisateurs ────────────────────────────────────────

export const currentUser: User = {
  id: 'u1',
  email: 'aissatou.diallo@entreprise.sn',
  displayName: 'Aissatou Diallo',
  avatarUrl: 'https://i.pravatar.cc/150?img=47',
  phone: '+221 77 123 45 67',
  provider: 'email',
  role: 'admin',
  createdAt: '2026-01-15T09:00:00Z',
  notificationPrefs: {
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    reminderMinutesBefore: 30,
  },
  stats: {
    totalReservations: 42,
    confirmedReservations: 38,
    attendanceRate: 91,
    favoriteRoomId: 'r1',
  },
};

export const mockUsers = [
  {
    id: 'u2',
    displayName: 'Mamadou Konaté',
    email: 'mamadou.konate@entreprise.sn',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'u3',
    displayName: 'Fatou Mbaye',
    email: 'fatou.mbaye@entreprise.sn',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
  },
  {
    id: 'u4',
    displayName: 'Oumar Traoré',
    email: 'oumar.traore@entreprise.sn',
    avatarUrl: 'https://i.pravatar.cc/150?img=52',
  },
  {
    id: 'u5',
    displayName: 'Kadiatou Bah',
    email: 'kadiatou.bah@entreprise.sn',
    avatarUrl: 'https://i.pravatar.cc/150?img=25',
  },
];

// ─── Salles ──────────────────────────────────────────────

export const mockRooms: Room[] = [
  {
    id: 'r1',
    name: 'Salle Baobab',
    building: 'Bâtiment A',
    floor: 1,
    capacity: 10,
    equipment: ['projector', 'whiteboard', 'videoconference', 'wifi', 'air_conditioning'],
    photos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600',
    ],
    description: 'Grande salle de conférence avec vue sur le jardin, équipée d\'un système de visioconférence haute définition.',
    isActive: true,
    tags: ['Réunions', 'Formation', 'Présentations'],
    rules: {
      minDurationMinutes: 30,
      maxDurationMinutes: 480,
      openingTime: '08:00',
      closingTime: '19:00',
      openDays: [1, 2, 3, 4, 5],
    },
  },
  {
    id: 'r2',
    name: 'Salle Manguier',
    building: 'Bâtiment A',
    floor: 2,
    capacity: 6,
    equipment: ['tv_screen', 'whiteboard', 'wifi'],
    photos: [
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600',
    ],
    description: 'Salle de réunion intimiste idéale pour les petits groupes et les entretiens.',
    isActive: true,
    tags: ['Entretiens', 'Brainstorming'],
    rules: {
      minDurationMinutes: 30,
      maxDurationMinutes: 240,
      openingTime: '08:00',
      closingTime: '18:00',
      openDays: [1, 2, 3, 4, 5],
    },
  },
  {
    id: 'r3',
    name: 'Salle Téranga',
    building: 'Bâtiment B',
    floor: 0,
    capacity: 20,
    equipment: ['projector', 'whiteboard', 'videoconference', 'wifi', 'air_conditioning', 'phone'],
    photos: [
      'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=600',
      'https://images.unsplash.com/photo-1505409628601-edc9af17fda6?w=600',
    ],
    description: 'Grande salle polyvalente pour séminaires et formations. Disposition modulable.',
    isActive: true,
    tags: ['Séminaires', 'Formation', 'Grands groupes'],
    rules: {
      minDurationMinutes: 60,
      maxDurationMinutes: 720,
      openingTime: '07:30',
      closingTime: '20:00',
      openDays: [1, 2, 3, 4, 5, 6],
    },
  },
  {
    id: 'r4',
    name: 'Espace Detente',
    building: 'Bâtiment C',
    floor: 1,
    capacity: 4,
    equipment: ['wifi', 'coffee'],
    photos: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600',
    ],
    description: 'Espace informel pour des échanges décontractés ou du travail individuel.',
    isActive: true,
    tags: ['Informel', 'Individuel'],
    rules: {
      minDurationMinutes: 15,
      maxDurationMinutes: 120,
      openingTime: '07:00',
      closingTime: '20:00',
      openDays: [1, 2, 3, 4, 5],
    },
  },
];

// ─── Réservations ─────────────────────────────────────────

const now = new Date();
const today = now.toISOString().split('T')[0];

function dateTime(daysOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const mockMeetings: MeetingInvite[] = [
  {
    id: 'm1',
    type: 'meeting',
    title: 'Revue de projet trimestrielle',
    description: 'Point avancement Q1 2026 avec l\'équipe produit.',
    status: 'confirmed',
    initiator: { id: 'u1', displayName: 'Aissatou Diallo', email: 'aissatou.diallo@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=47' },
    invitee: { id: 'u2', displayName: 'Mamadou Konaté', email: 'mamadou.konate@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=12' },
    slot: {
      startAt: dateTime(1, 10, 0),
      endAt: dateTime(1, 11, 0),
      timezone: 'Africa/Dakar',
    },
    location: { type: 'room', roomId: 'r1', roomName: 'Salle Baobab' },
    chatThreadId: 'ct1',
    qrToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNlcnZhdGlvbklkIjoibTEiLCJ1c2VySWQiOiJ1MSIsImlzc3VlZEF0IjoiMjAyNi0wMy0yMFQwODowMDowMFoiLCJleHBpcmVzQXQiOiIyMDI2LTAzLTIxVDEwOjE1OjAwWiJ9.signature',
    createdAt: dateTime(-3, 9, 0),
    updatedAt: dateTime(-1, 14, 0),
    confirmations: { initiator: true, invitee: true },
  },
  {
    id: 'm2',
    type: 'meeting',
    title: 'Entretien candidat - Développeur Senior',
    description: 'Entretien technique avec Fatou pour le poste de Dev Senior.',
    status: 'pending',
    initiator: { id: 'u1', displayName: 'Aissatou Diallo', email: 'aissatou.diallo@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=47' },
    invitee: { id: 'u3', displayName: 'Fatou Mbaye', email: 'fatou.mbaye@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=32' },
    slot: {
      startAt: dateTime(2, 14, 0),
      endAt: dateTime(2, 15, 30),
      timezone: 'Africa/Dakar',
    },
    location: { type: 'video', videoLink: 'https://meet.google.com/xxx-yyyy-zzz' },
    chatThreadId: 'ct2',
    createdAt: dateTime(-1, 9, 0),
    updatedAt: dateTime(0, 10, 0),
    confirmations: { initiator: true, invitee: false },
  },
  {
    id: 'm3',
    type: 'meeting',
    title: 'Déjeuner de travail',
    description: 'Discussion sur la stratégie commerciale Q2.',
    status: 'proposed',
    initiator: { id: 'u4', displayName: 'Oumar Traoré', email: 'oumar.traore@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=52' },
    invitee: { id: 'u1', displayName: 'Aissatou Diallo', email: 'aissatou.diallo@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=47' },
    slot: {
      startAt: dateTime(3, 12, 30),
      endAt: dateTime(3, 14, 0),
      timezone: 'Africa/Dakar',
    },
    location: { type: 'address', address: 'Restaurant Le Terrou-Bi, Dakar' },
    chatThreadId: 'ct3',
    createdAt: dateTime(0, 8, 0),
    updatedAt: dateTime(0, 8, 0),
    confirmations: { initiator: true, invitee: false },
  },
  {
    id: 'm4',
    type: 'meeting',
    title: 'Point RH mensuel',
    status: 'cancelled',
    initiator: { id: 'u5', displayName: 'Kadiatou Bah', email: 'kadiatou.bah@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=25' },
    invitee: { id: 'u1', displayName: 'Aissatou Diallo', email: 'aissatou.diallo@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=47' },
    slot: {
      startAt: dateTime(-2, 11, 0),
      endAt: dateTime(-2, 12, 0),
      timezone: 'Africa/Dakar',
    },
    location: { type: 'room', roomId: 'r2', roomName: 'Salle Manguier' },
    chatThreadId: 'ct4',
    createdAt: dateTime(-5, 10, 0),
    updatedAt: dateTime(-3, 16, 0),
    confirmations: { initiator: true, invitee: true },
  },
];

export const mockRoomReservations: RoomReservation[] = [
  {
    id: 'rr1',
    type: 'room',
    title: 'Formation onboarding nouvelles recrues',
    description: 'Session d\'intégration pour les 5 nouvelles recrues de mars.',
    status: 'confirmed',
    organizer: { id: 'u1', displayName: 'Aissatou Diallo', email: 'aissatou.diallo@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=47' },
    attendees: [
      { id: 'u2', displayName: 'Mamadou Konaté', email: 'mamadou.konate@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=12' },
      { id: 'u3', displayName: 'Fatou Mbaye', email: 'fatou.mbaye@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=32' },
    ],
    room: { id: 'r3', name: 'Salle Téranga', building: 'Bâtiment B', capacity: 20 },
    slot: {
      startAt: dateTime(0, 9, 0),
      endAt: dateTime(0, 17, 0),
      timezone: 'Africa/Dakar',
    },
    chatThreadId: 'ct5',
    qrToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNlcnZhdGlvbklkIjoicnIxIiwidXNlcklkIjoidTEiLCJpc3N1ZWRBdCI6IjIwMjYtMDMtMjBUMDg6MDA6MDBaIiwiZXhwaXJlc0F0IjoiMjAyNi0wMy0yMFQwOToxNTowMFoifQ.signature',
    createdAt: dateTime(-7, 10, 0),
    updatedAt: dateTime(-5, 11, 0),
  },
  {
    id: 'rr2',
    type: 'room',
    title: 'Réunion commerciale hebdo',
    status: 'confirmed',
    organizer: { id: 'u2', displayName: 'Mamadou Konaté', email: 'mamadou.konate@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=12' },
    attendees: [
      { id: 'u1', displayName: 'Aissatou Diallo', email: 'aissatou.diallo@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=47' },
      { id: 'u4', displayName: 'Oumar Traoré', email: 'oumar.traore@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=52' },
    ],
    room: { id: 'r1', name: 'Salle Baobab', building: 'Bâtiment A', capacity: 10 },
    slot: {
      startAt: dateTime(1, 14, 0),
      endAt: dateTime(1, 15, 30),
      timezone: 'Africa/Dakar',
    },
    chatThreadId: 'ct6',
    createdAt: dateTime(-2, 14, 0),
    updatedAt: dateTime(-2, 14, 0),
  },
  {
    id: 'rr3',
    type: 'room',
    title: 'Brainstorming nouveau produit',
    status: 'confirmed',
    organizer: { id: 'u1', displayName: 'Aissatou Diallo', email: 'aissatou.diallo@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=47' },
    attendees: [
      { id: 'u3', displayName: 'Fatou Mbaye', email: 'fatou.mbaye@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=32' },
      { id: 'u5', displayName: 'Kadiatou Bah', email: 'kadiatou.bah@entreprise.sn', avatarUrl: 'https://i.pravatar.cc/150?img=25' },
    ],
    room: { id: 'r2', name: 'Salle Manguier', building: 'Bâtiment A', capacity: 6 },
    slot: {
      startAt: dateTime(4, 10, 0),
      endAt: dateTime(4, 12, 0),
      timezone: 'Africa/Dakar',
    },
    chatThreadId: 'ct7',
    createdAt: dateTime(-1, 11, 0),
    updatedAt: dateTime(-1, 11, 0),
  },
];

export const allReservations = [...mockMeetings, ...mockRoomReservations];

// ─── Threads de chat ────────────────────────────────────

export const mockChatMessages: Record<string, ChatMessage[]> = {
  ct1: [
    {
      id: 'msg1',
      threadId: 'ct1',
      senderId: 'u1',
      senderName: 'Aissatou',
      content: 'Bonjour Mamadou, peux-tu confirmer ta présence pour la revue de demain ?',
      type: 'text',
      sentAt: dateTime(-2, 10, 0),
      readBy: ['u1', 'u2'],
    },
    {
      id: 'msg2',
      threadId: 'ct1',
      senderId: 'u2',
      senderName: 'Mamadou',
      content: 'Oui, je serai là. Peux-tu me confirmer l\'ordre du jour ?',
      type: 'text',
      sentAt: dateTime(-2, 10, 30),
      readBy: ['u1', 'u2'],
    },
    {
      id: 'msg3',
      threadId: 'ct1',
      senderId: 'u1',
      senderName: 'Aissatou',
      content: '1. Avancement sprints\n2. KPIs Q1\n3. Planning Q2\nÀ demain !',
      type: 'text',
      sentAt: dateTime(-2, 11, 0),
      readBy: ['u1', 'u2'],
    },
    {
      id: 'msg4',
      threadId: 'ct1',
      senderId: 'system',
      senderName: 'Système',
      content: 'Réservation confirmée par les deux parties.',
      type: 'system',
      sentAt: dateTime(-1, 14, 0),
      readBy: ['u1', 'u2'],
    },
  ],
  ct2: [
    {
      id: 'msg5',
      threadId: 'ct2',
      senderId: 'u1',
      senderName: 'Aissatou',
      content: 'Bonjour Fatou ! Je vous propose un entretien le mercredi à 14h. Êtes-vous disponible ?',
      type: 'text',
      sentAt: dateTime(-1, 9, 0),
      readBy: ['u1'],
    },
    {
      id: 'msg6',
      threadId: 'ct2',
      senderId: 'u3',
      senderName: 'Fatou',
      content: 'Bonjour Aissatou ! Merci pour l\'invitation. Le mercredi 14h me convient parfaitement.',
      type: 'text',
      sentAt: dateTime(-1, 14, 0),
      readBy: ['u1', 'u3'],
    },
  ],
  ct3: [
    {
      id: 'msg7',
      threadId: 'ct3',
      senderId: 'u4',
      senderName: 'Oumar',
      content: 'Aissatou, que penses-tu d\'un déjeuner de travail jeudi ? J\'aimerais discuter de la stratégie Q2.',
      type: 'text',
      sentAt: dateTime(0, 8, 0),
      readBy: ['u4'],
    },
  ],
};

// ─── Notifications ───────────────────────────────────────

export const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'invitation',
    title: 'Nouvelle invitation',
    body: 'Oumar Traoré vous invite à un déjeuner de travail jeudi à 12h30.',
    reservationId: 'm3',
    createdAt: dateTime(0, 8, 5),
  },
  {
    id: 'n2',
    type: 'reminder',
    title: 'Rappel — Formation onboarding',
    body: 'Votre réservation de la Salle Téranga commence dans 1 heure.',
    reservationId: 'rr1',
    readAt: dateTime(0, 8, 30),
    createdAt: dateTime(0, 8, 0),
  },
  {
    id: 'n3',
    type: 'confirmation',
    title: 'Rendez-vous confirmé',
    body: 'Mamadou Konaté a confirmé votre réunion de demain à 10h.',
    reservationId: 'm1',
    readAt: dateTime(-1, 14, 10),
    createdAt: dateTime(-1, 14, 0),
  },
  {
    id: 'n4',
    type: 'cancellation',
    title: 'Réservation annulée',
    body: 'Le point RH mensuel avec Kadiatou Bah a été annulé.',
    reservationId: 'm4',
    readAt: dateTime(-3, 16, 5),
    createdAt: dateTime(-3, 16, 0),
  },
];
