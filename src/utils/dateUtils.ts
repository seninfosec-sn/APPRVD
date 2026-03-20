import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(iso: string, fmt = 'dd MMM yyyy'): string {
  return format(parseISO(iso), fmt, { locale: fr });
}

export function formatTime(iso: string): string {
  return format(parseISO(iso), 'HH:mm', { locale: fr });
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), "dd MMM 'à' HH:mm", { locale: fr });
}

export function formatRelative(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return `Aujourd'hui à ${formatTime(iso)}`;
  if (isTomorrow(date)) return `Demain à ${formatTime(iso)}`;
  if (isYesterday(date)) return `Hier à ${formatTime(iso)}`;
  return formatDateTime(iso);
}

export function formatDuration(startIso: string, endIso: string): string {
  const start = parseISO(startIso);
  const end = parseISO(endIso);
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

export function formatMessageTime(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return formatTime(iso);
  if (isYesterday(date)) return 'Hier';
  return format(date, 'dd/MM', { locale: fr });
}

export function formatDistanceShort(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: fr });
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function formatDayHeader(date: Date): { day: string; num: string } {
  return {
    day: format(date, 'EEE', { locale: fr }).slice(0, 3),
    num: format(date, 'd'),
  };
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: fr });
}

export function toYMD(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseYMD(ymd: string): Date {
  return parseISO(ymd);
}

export function hourFraction(iso: string): number {
  const d = parseISO(iso);
  return d.getHours() + d.getMinutes() / 60;
}
