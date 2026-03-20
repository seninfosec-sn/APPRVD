import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { ReservationStatus } from '../../types';
import { semanticColors, palette } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';

interface StatusConfig {
  label: string;
  bg: string;
  color: string;
}

const statusConfig: Record<ReservationStatus, StatusConfig> = {
  proposed: { label: 'Proposé', bg: semanticColors.statusPendingBg, color: semanticColors.statusPending },
  pending: { label: 'En attente', bg: semanticColors.statusPendingBg, color: semanticColors.statusPending },
  confirmed: { label: 'Confirmé', bg: semanticColors.statusConfirmedBg, color: semanticColors.statusConfirmed },
  cancelled: { label: 'Annulé', bg: semanticColors.statusCancelledBg, color: semanticColors.statusCancelled },
  expired: { label: 'Expiré', bg: semanticColors.statusExpiredBg, color: semanticColors.statusExpired },
};

interface BadgeProps {
  status: ReservationStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: BadgeProps) {
  const config = statusConfig[status];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
          paddingVertical: isSmall ? 2 : spacing.xs,
        },
      ]}
      accessibilityLabel={`Statut: ${config.label}`}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Typography
        variant="label"
        color={config.color}
        style={{ fontSize: isSmall ? 10 : 11, fontWeight: '600' }}
      >
        {config.label}
      </Typography>
    </View>
  );
}

interface CountBadgeProps {
  count: number;
  color?: string;
}

export function CountBadge({ count, color = palette.red }: CountBadgeProps) {
  if (count <= 0) return null;
  return (
    <View style={[styles.countBadge, { backgroundColor: color }]}>
      <Typography variant="label" color={palette.white} style={{ fontSize: 9, fontWeight: '700' }}>
        {count > 99 ? '99+' : String(count)}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
});
