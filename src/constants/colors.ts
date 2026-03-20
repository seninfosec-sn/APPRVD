// Afcac-Expo-Meet — Palette de couleurs officielle
// Définie par le PRD v1.0

export const palette = {
  // Brand
  green: '#145847',       // Disponible / Confirmé
  olive: '#b3ae41',       // Réservé / Occupé
  amber: '#f0a500',       // En attente / Proposé
  red: '#e24b4a',         // Annulé
  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  // Base
  white: '#FFFFFF',
  black: '#000000',
  // Surfaces
  surface: '#F7F8FA',
  surfaceElevated: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F0F0F0',
  // Overlay
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.08)',
} as const;

export const darkPalette = {
  ...palette,
  textPrimary: '#F0F0F0',
  textSecondary: '#AAAAAA',
  surface: '#1A1A1A',
  surfaceElevated: '#252525',
  border: '#333333',
  borderLight: '#2A2A2A',
  white: '#1E1E1E',
  black: '#FFFFFF',
} as const;

export const semanticColors = {
  // Statuts de réservation
  statusConfirmed: palette.green,
  statusConfirmedBg: '#E8F2EE',
  statusPending: palette.amber,
  statusPendingBg: '#FEF3E2',
  statusCancelled: palette.red,
  statusCancelledBg: '#FDE8E8',
  statusExpired: palette.textSecondary,
  statusExpiredBg: '#F0F0F0',
  statusReserved: palette.olive,
  statusReservedBg: '#F4F3E3',
  // Calendrier
  calendarAvailable: palette.green,
  calendarOccupied: palette.olive,
  calendarSelected: palette.green,
  calendarToday: '#E8F2EE',
  // Actions
  primary: palette.green,
  primaryLight: '#E8F2EE',
  danger: palette.red,
  dangerLight: '#FDE8E8',
  warning: palette.amber,
  warningLight: '#FEF3E2',
  // Navigation
  tabActive: palette.green,
  tabInactive: '#9CA3AF',
} as const;
