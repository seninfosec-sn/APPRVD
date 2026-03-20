import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { StatusBadge } from '../ui/Badge';
import { palette, semanticColors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { Reservation } from '../../types';
import { formatTime, formatDuration, formatDate, toYMD, hourFraction } from '../../utils/dateUtils';
import { getStatusColor } from '../../utils/conflictUtils';
import { parseISO, isToday } from 'date-fns';

const HOUR_HEIGHT = 80;
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

interface DayViewProps {
  currentDate: Date;
  reservations: Reservation[];
  onEventPress: (id: string) => void;
}

export function DayView({ currentDate, reservations, onEventPress }: DayViewProps) {
  const ymd = toYMD(currentDate);
  const dayRes = reservations.filter((r) => toYMD(new Date(r.slot.startAt)) === ymd);
  const isDayToday = isToday(currentDate);

  return (
    <View style={styles.container}>
      {/* Day title */}
      <View style={[styles.dayTitle, isDayToday && styles.todayBg]}>
        <Typography variant="h3" color={isDayToday ? semanticColors.primary : palette.textPrimary}>
          {formatDate(currentDate.toISOString(), 'EEEE d MMMM')}
        </Typography>
        <Typography variant="caption" color={palette.textSecondary}>
          {dayRes.length} réservation{dayRes.length !== 1 ? 's' : ''}
        </Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {/* Hours column */}
          <View style={styles.hoursCol}>
            {HOURS.map((h) => (
              <View key={h} style={[styles.hourCell, { height: HOUR_HEIGHT }]}>
                <Typography style={{ fontSize: 11, color: palette.textSecondary }}>
                  {h.toString().padStart(2, '0')}:00
                </Typography>
              </View>
            ))}
          </View>

          {/* Events column */}
          <View style={styles.eventsCol}>
            {HOURS.map((h) => (
              <View key={h} style={[styles.hourLine, { height: HOUR_HEIGHT }]} />
            ))}

            {dayRes.map((r) => {
              const startH = hourFraction(r.slot.startAt);
              const endH = hourFraction(r.slot.endAt);
              const top = Math.max(0, (startH - 7) * HOUR_HEIGHT);
              const height = Math.max(48, (endH - startH) * HOUR_HEIGHT - 4);
              const color = getStatusColor(r.status);

              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.event, { top, height, borderLeftColor: color, backgroundColor: color + '15' }]}
                  onPress={() => onEventPress(r.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${r.title}, ${formatTime(r.slot.startAt)} à ${formatTime(r.slot.endAt)}`}
                >
                  <View style={styles.eventHeader}>
                    <Typography
                      style={{ fontSize: 13, fontWeight: '700', color, flex: 1 }}
                      numberOfLines={1}
                    >
                      {r.title}
                    </Typography>
                    <StatusBadge status={r.status} size="sm" />
                  </View>
                  <View style={styles.eventMeta}>
                    <Ionicons name="time-outline" size={12} color={palette.textSecondary} />
                    <Typography style={{ fontSize: 11, color: palette.textSecondary }}>
                      {formatTime(r.slot.startAt)} – {formatTime(r.slot.endAt)}
                      {' · '}{formatDuration(r.slot.startAt, r.slot.endAt)}
                    </Typography>
                  </View>
                  {r.type === 'room' && height > 60 && (
                    <View style={styles.eventMeta}>
                      <Ionicons name="location-outline" size={12} color={palette.textSecondary} />
                      <Typography style={{ fontSize: 11, color: palette.textSecondary }} numberOfLines={1}>
                        {r.room.name}
                      </Typography>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {dayRes.length === 0 && (
          <View style={styles.emptyDay}>
            <Ionicons name="calendar-outline" size={36} color={palette.border} />
            <Typography variant="body" color={palette.textSecondary} align="center">
              Aucune réservation pour aujourd'hui
            </Typography>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  dayTitle: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  todayBg: { backgroundColor: semanticColors.primaryLight },
  grid: { flexDirection: 'row', flex: 1 },
  hoursCol: { width: 52 },
  hourCell: {
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingRight: spacing.xs,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: palette.borderLight,
  },
  eventsCol: {
    flex: 1,
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: palette.border,
  },
  hourLine: {
    borderTopWidth: 1,
    borderTopColor: palette.borderLight,
  },
  event: {
    position: 'absolute',
    left: spacing.xs,
    right: spacing.xs,
    borderLeftWidth: 4,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 4,
    overflow: 'hidden',
  },
  eventHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  emptyDay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
});
