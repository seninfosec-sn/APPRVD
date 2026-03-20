import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { palette, semanticColors } from '../../src/constants/colors';
import { spacing, radius } from '../../src/constants/spacing';
import { formatDateTime, formatDuration } from '../../src/utils/dateUtils';
import { addHours } from 'date-fns';

export default function ConflictAlertModal() {
  const { roomName, conflictStart } = useLocalSearchParams<{ roomName: string; conflictStart: string }>();

  // Generate 3 alternative slots
  const alternatives = conflictStart
    ? [
        addHours(new Date(conflictStart), 1).toISOString(),
        addHours(new Date(conflictStart), 2).toISOString(),
        addHours(new Date(conflictStart), 3).toISOString(),
      ]
    : [];

  return (
    <View style={styles.container}>
      {/* Close */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color={palette.textPrimary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alert icon */}
        <View style={styles.alertIcon}>
          <Ionicons name="warning" size={40} color={semanticColors.warning} />
        </View>

        <Typography variant="h2" align="center" style={{ color: semanticColors.warning }}>
          Conflit de réservation
        </Typography>
        <Typography variant="body" color={palette.textSecondary} align="center">
          {roomName || 'Cette salle'} est déjà réservée pour le créneau sélectionné.
        </Typography>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <View style={styles.alternatives}>
            <Typography variant="label" color={palette.textSecondary}>
              Créneaux alternatifs disponibles
            </Typography>
            {alternatives.map((alt, i) => (
              <TouchableOpacity
                key={i}
                style={styles.altSlot}
                onPress={() => {
                  // In a real app, this would pre-fill the form
                  router.back();
                }}
                accessibilityRole="button"
              >
                <View style={styles.altDot} />
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium">{formatDateTime(alt)}</Typography>
                  <Typography variant="caption" color={palette.textSecondary}>
                    Durée : 1h (modifiable)
                  </Typography>
                </View>
                <View style={styles.altBadge}>
                  <Typography style={{ fontSize: 10, color: semanticColors.calendarAvailable, fontWeight: '700' }}>
                    Disponible
                  </Typography>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <Button
            label="Modifier le créneau"
            onPress={() => router.back()}
            fullWidth
            size="lg"
            icon={<Ionicons name="create-outline" size={20} color={palette.white} />}
          />
          <Button
            label="Annuler"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  closeBtn: {
    position: 'absolute',
    top: spacing.xl + 20,
    right: spacing.xl,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.xl,
    paddingTop: 80,
    alignItems: 'center',
    gap: spacing.lg,
  },
  alertIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: semanticColors.statusPendingBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alternatives: {
    width: '100%',
    gap: spacing.sm,
  },
  altSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: semanticColors.statusConfirmedBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: semanticColors.statusConfirmed + '40',
  },
  altDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: semanticColors.calendarAvailable,
  },
  altBadge: {
    backgroundColor: semanticColors.calendarAvailable + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  actions: { width: '100%', gap: spacing.sm },
});
