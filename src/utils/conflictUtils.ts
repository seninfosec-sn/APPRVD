import { TimeSlot, Reservation } from '../types';

export function hasConflict(candidate: TimeSlot, existing: TimeSlot[]): TimeSlot[] {
  const start = new Date(candidate.startAt).getTime();
  const end = new Date(candidate.endAt).getTime();
  return existing.filter((slot) => {
    const s = new Date(slot.startAt).getTime();
    const e = new Date(slot.endAt).getTime();
    return !(end <= s || start >= e);
  });
}

export function getConflictsForRoom(
  roomId: string,
  candidate: TimeSlot,
  reservations: Reservation[]
): Reservation[] {
  const start = new Date(candidate.startAt).getTime();
  const end = new Date(candidate.endAt).getTime();
  return reservations.filter((r) => {
    if (r.status === 'cancelled' || r.status === 'expired') return false;
    if (r.type !== 'room') return false;
    if (r.room.id !== roomId) return false;
    const s = new Date(r.slot.startAt).getTime();
    const e = new Date(r.slot.endAt).getTime();
    return !(end <= s || start >= e);
  });
}

export function getStatusColor(status: Reservation['status']): string {
  const map: Record<string, string> = {
    proposed: '#f0a500',
    pending: '#f0a500',
    confirmed: '#145847',
    cancelled: '#e24b4a',
    expired: '#555555',
  };
  return map[status] || '#555555';
}
