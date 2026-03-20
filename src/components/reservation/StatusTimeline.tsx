import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { palette, semanticColors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { ReservationStatus } from '../../types';

interface Step {
  key: ReservationStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const MEETING_STEPS: Step[] = [
  { key: 'proposed', label: 'Proposé', icon: 'send-outline' },
  { key: 'pending', label: 'En attente', icon: 'hourglass-outline' },
  { key: 'confirmed', label: 'Confirmé', icon: 'checkmark-circle-outline' },
];

const STATUS_ORDER: ReservationStatus[] = ['proposed', 'pending', 'confirmed', 'cancelled', 'expired'];

function getStepIndex(status: ReservationStatus): number {
  if (status === 'cancelled' || status === 'expired') return -1;
  return STATUS_ORDER.indexOf(status);
}

interface StatusTimelineProps {
  status: ReservationStatus;
}

export function StatusTimeline({ status }: StatusTimelineProps) {
  const currentIdx = getStepIndex(status);
  const isFinalNegative = status === 'cancelled' || status === 'expired';

  return (
    <View style={styles.container}>
      {isFinalNegative ? (
        <View style={styles.finalState}>
          <View style={[styles.finalIcon, { backgroundColor: status === 'cancelled' ? semanticColors.statusCancelledBg : semanticColors.statusExpiredBg }]}>
            <Ionicons
              name={status === 'cancelled' ? 'close-circle' : 'time'}
              size={24}
              color={status === 'cancelled' ? semanticColors.danger : semanticColors.statusExpired}
            />
          </View>
          <Typography variant="bodyMedium" color={status === 'cancelled' ? semanticColors.danger : semanticColors.statusExpired}>
            {status === 'cancelled' ? 'Réservation annulée' : 'Délai dépassé'}
          </Typography>
        </View>
      ) : (
        <View style={styles.steps}>
          {MEETING_STEPS.map((step, i) => {
            const isCompleted = currentIdx > i;
            const isActive = currentIdx === i;
            const stepColor = isCompleted || isActive ? semanticColors.primary : palette.border;
            const bgColor = isCompleted ? semanticColors.primary : isActive ? semanticColors.primaryLight : palette.surface;
            const iconColor = isCompleted ? palette.white : isActive ? semanticColors.primary : palette.textSecondary;

            return (
              <View key={step.key} style={styles.step}>
                {/* Connector line before */}
                {i > 0 && (
                  <View style={[styles.connector, { backgroundColor: i <= currentIdx ? semanticColors.primary : palette.border }]} />
                )}

                {/* Step circle */}
                <View style={[styles.circle, { backgroundColor: bgColor, borderColor: stepColor }]}>
                  <Ionicons name={step.icon} size={14} color={iconColor} />
                </View>

                {/* Label */}
                <Typography
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? semanticColors.primary : isCompleted ? palette.textPrimary : palette.textSecondary,
                    textAlign: 'center',
                    marginTop: 4,
                  }}
                >
                  {step.label}
                </Typography>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  step: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    top: 15,
    left: -'50%' as unknown as number,
    right: '50%',
    height: 2,
    width: '100%',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finalState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
  },
  finalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
