import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Typography } from '../ui/Typography';
import { palette, semanticColors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { Reservation } from '../../types';
import { toYMD, formatDayHeader } from '../../utils/dateUtils';
import { getStatusColor } from '../../utils/conflictUtils';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';

interface MonthViewProps {
  currentDate: Date;
  reservations: Reservation[];
  selectedDate: string;
  onDayPress: (ymd: string) => void;
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function MonthView({ currentDate, reservations, selectedDate, onDayPress }: MonthViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const reservationsByDay = useMemo(() => {
    const map: Record<string, Reservation[]> = {};
    reservations.forEach((r) => {
      const ymd = toYMD(new Date(r.slot.startAt));
      if (!map[ymd]) map[ymd] = [];
      map[ymd].push(r);
    });
    return map;
  }, [reservations]);

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Day labels */}
      <View style={styles.weekLabels}>
        {DAY_LABELS.map((d) => (
          <View key={d} style={styles.dayLabelCell}>
            <Typography variant="label" color={palette.textSecondary} style={styles.dayLabel}>
              {d}
            </Typography>
          </View>
        ))}
      </View>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => {
            const ymd = toYMD(day);
            const dayReservations = reservationsByDay[ymd] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate === ymd;
            const isDayToday = isToday(day);

            return (
              <TouchableOpacity
                key={di}
                style={styles.dayCell}
                onPress={() => onDayPress(ymd)}
                accessibilityLabel={`${ymd}, ${dayReservations.length} réservation(s)`}
                accessibilityRole="button"
              >
                {/* Day number */}
                <View
                  style={[
                    styles.dayNumber,
                    isDayToday && styles.todayCircle,
                    isSelected && !isDayToday && styles.selectedCircle,
                  ]}
                >
                  <Typography
                    style={{
                      fontSize: 14,
                      fontWeight: isDayToday || isSelected ? '700' : '400',
                      color: isDayToday
                        ? palette.white
                        : isSelected
                        ? semanticColors.primary
                        : isCurrentMonth
                        ? palette.textPrimary
                        : palette.textSecondary,
                    }}
                  >
                    {day.getDate()}
                  </Typography>
                </View>

                {/* Event dots */}
                <View style={styles.dots}>
                  {dayReservations.slice(0, 3).map((r, i) => (
                    <View
                      key={i}
                      style={[styles.dot, { backgroundColor: getStatusColor(r.status) }]}
                    />
                  ))}
                  {dayReservations.length > 3 && (
                    <View style={[styles.dot, { backgroundColor: palette.textSecondary }]} />
                  )}
                </View>

                {/* Mini event chips (for visible count) */}
                {dayReservations.length > 0 && (
                  <View style={styles.eventChips}>
                    {dayReservations.slice(0, 2).map((r, i) => (
                      <View
                        key={i}
                        style={[styles.eventChip, { backgroundColor: getStatusColor(r.status) + '20' }]}
                      >
                        <View style={[styles.chipDot, { backgroundColor: getStatusColor(r.status) }]} />
                        <Typography
                          style={{ fontSize: 9, color: getStatusColor(r.status), fontWeight: '600' }}
                          numberOfLines={1}
                        >
                          {r.title}
                        </Typography>
                      </View>
                    ))}
                    {dayReservations.length > 2 && (
                      <Typography style={{ fontSize: 9, color: palette.textSecondary }}>
                        +{dayReservations.length - 2}
                      </Typography>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  weekLabels: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: palette.borderLight,
  },
  dayLabelCell: { flex: 1, alignItems: 'center' },
  dayLabel: { fontSize: 10 },
  weekRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: palette.borderLight,
    minHeight: 80,
  },
  dayCell: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: palette.borderLight,
    alignItems: 'center',
  },
  dayNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  todayCircle: { backgroundColor: semanticColors.primary },
  selectedCircle: {
    backgroundColor: semanticColors.primaryLight,
    borderWidth: 1.5,
    borderColor: semanticColors.primary,
  },
  dots: { flexDirection: 'row', gap: 2, marginBottom: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  eventChips: { width: '100%', gap: 2 },
  eventChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
    gap: 2,
  },
  chipDot: { width: 4, height: 4, borderRadius: 2 },
});
