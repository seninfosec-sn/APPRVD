import React, { useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../ui/Typography';
import { palette, semanticColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { Reservation } from '../../types';
import { getWeekDays, formatDayHeader, toYMD, hourFraction } from '../../utils/dateUtils';
import { getStatusColor } from '../../utils/conflictUtils';
import { isToday } from 'date-fns';

const HOUR_HEIGHT = 64;
const TIME_COL_WIDTH = 48;
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 → 20:00

interface WeekViewProps {
  currentDate: Date;
  reservations: Reservation[];
  selectedDate: string;
  onEventPress: (id: string) => void;
  onDayPress: (ymd: string) => void;
}

export function WeekView({ currentDate, reservations, selectedDate, onEventPress, onDayPress }: WeekViewProps) {
  const days = getWeekDays(currentDate);
  const scrollRef = useRef<ScrollView>(null);

  const resByDay: Record<string, Reservation[]> = {};
  days.forEach((d) => { resByDay[toYMD(d)] = []; });
  reservations.forEach((r) => {
    const ymd = toYMD(new Date(r.slot.startAt));
    if (resByDay[ymd]) resByDay[ymd].push(r);
  });

  return (
    <View style={styles.container}>
      {/* Day headers */}
      <View style={styles.header}>
        <View style={{ width: TIME_COL_WIDTH }} />
        {days.map((d) => {
          const { day, num } = formatDayHeader(d);
          const ymd = toYMD(d);
          const isSelected = selectedDate === ymd;
          const isDayToday = isToday(d);
          return (
            <TouchableOpacity
              key={ymd}
              style={styles.dayHeader}
              onPress={() => onDayPress(ymd)}
            >
              <Typography
                style={{ fontSize: 10, color: palette.textSecondary, textTransform: 'uppercase', fontWeight: '600' }}
              >
                {day}
              </Typography>
              <View
                style={[
                  styles.dayNum,
                  isDayToday && { backgroundColor: semanticColors.primary },
                  isSelected && !isDayToday && { backgroundColor: semanticColors.primaryLight },
                ]}
              >
                <Typography
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: isDayToday ? palette.white : isSelected ? semanticColors.primary : palette.textPrimary,
                  }}
                >
                  {num}
                </Typography>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Time grid */}
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} style={styles.grid}>
        <View style={styles.gridInner}>
          {/* Hour labels */}
          <View style={{ width: TIME_COL_WIDTH }}>
            {HOURS.map((h) => (
              <View key={h} style={[styles.hourCell, { height: HOUR_HEIGHT }]}>
                <Typography style={{ fontSize: 10, color: palette.textSecondary }}>
                  {h.toString().padStart(2, '0')}:00
                </Typography>
              </View>
            ))}
          </View>

          {/* Day columns */}
          {days.map((d) => {
            const ymd = toYMD(d);
            const dayRes = resByDay[ymd] || [];
            return (
              <View key={ymd} style={styles.dayCol}>
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <View key={h} style={[styles.hourLine, { height: HOUR_HEIGHT }]} />
                ))}
                {/* Events */}
                {dayRes.map((r) => {
                  const startH = hourFraction(r.slot.startAt);
                  const endH = hourFraction(r.slot.endAt);
                  const top = Math.max(0, (startH - 7) * HOUR_HEIGHT);
                  const height = Math.max(20, (endH - startH) * HOUR_HEIGHT - 2);
                  const color = getStatusColor(r.status);
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.event, { top, height, backgroundColor: color + '20', borderLeftColor: color }]}
                      onPress={() => onEventPress(r.id)}
                      accessibilityLabel={r.title}
                      accessibilityRole="button"
                    >
                      <Typography style={{ fontSize: 10, fontWeight: '700', color }}>
                        {r.title}
                      </Typography>
                      {height > 28 && (
                        <Typography style={{ fontSize: 9, color: palette.textSecondary }}>
                          {r.type === 'room' ? r.room.name : ''}
                        </Typography>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingVertical: spacing.sm,
    backgroundColor: palette.white,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  dayNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: { flex: 1 },
  gridInner: { flexDirection: 'row' },
  hourCell: {
    justifyContent: 'flex-start',
    paddingTop: 2,
    paddingRight: spacing.xs,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: palette.borderLight,
  },
  dayCol: {
    flex: 1,
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: palette.borderLight,
  },
  hourLine: {
    borderTopWidth: 1,
    borderTopColor: palette.borderLight,
  },
  event: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderLeftWidth: 3,
    borderRadius: 4,
    padding: 3,
    overflow: 'hidden',
  },
});
