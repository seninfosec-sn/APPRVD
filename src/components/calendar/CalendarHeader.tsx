import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { palette, semanticColors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { CalendarView } from '../../types';
import { formatMonthYear } from '../../utils/dateUtils';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const VIEWS: { key: CalendarView; label: string }[] = [
  { key: 'month', label: 'Mois' },
  { key: 'week', label: 'Semaine' },
  { key: 'day', label: 'Jour' },
];

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <View style={styles.navGroup}>
          <TouchableOpacity
            onPress={onPrev}
            style={styles.navBtn}
            accessibilityLabel="Période précédente"
          >
            <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onToday} style={styles.todayBtn} accessibilityLabel="Aujourd'hui">
            <Typography variant="bodyMedium" color={semanticColors.primary} style={styles.todayText}>
              Aujourd'hui
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onNext}
            style={styles.navBtn}
            accessibilityLabel="Période suivante"
          >
            <Ionicons name="chevron-forward" size={22} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>
        <Typography variant="h3" style={styles.dateTitle}>
          {formatMonthYear(currentDate)}
        </Typography>
      </View>

      {/* View switcher */}
      <View style={styles.switcher}>
        {VIEWS.map((v) => (
          <TouchableOpacity
            key={v.key}
            onPress={() => onViewChange(v.key)}
            style={[styles.switchBtn, view === v.key && styles.switchActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: view === v.key }}
          >
            <Typography
              variant="caption"
              color={view === v.key ? palette.white : palette.textSecondary}
              style={{ fontWeight: '600' }}
            >
              {v.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  navBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
    backgroundColor: palette.surface,
  },
  todayBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: semanticColors.primaryLight,
  },
  todayText: { fontSize: 13 },
  dateTitle: {
    textTransform: 'capitalize',
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: radius.full,
    padding: 3,
    alignSelf: 'center',
  },
  switchBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  switchActive: {
    backgroundColor: semanticColors.primary,
  },
});
