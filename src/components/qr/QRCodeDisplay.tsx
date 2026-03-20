import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { palette, semanticColors } from '../../constants/colors';
import { spacing, radius, shadow } from '../../constants/spacing';
import { formatDateTime } from '../../utils/dateUtils';

interface QRCodeDisplayProps {
  token: string;
  reservationId: string;
  title: string;
  startAt: string;
  onExpand?: () => void;
}

export function QRCodeDisplay({ token, reservationId, title, startAt, onExpand }: QRCodeDisplayProps) {
  return (
    <View style={[styles.container, shadow.md]}>
      <View style={styles.header}>
        <Ionicons name="qr-code" size={20} color={semanticColors.primary} />
        <Typography variant="h4" color={semanticColors.primary}>
          QR Code de check-in
        </Typography>
      </View>

      <TouchableOpacity
        style={styles.qrWrapper}
        onPress={onExpand}
        accessibilityLabel="Agrandir le QR code"
        accessibilityRole="button"
      >
        <View style={styles.qrFrame}>
          <QRCode
            value={token}
            size={160}
            color={palette.textPrimary}
            backgroundColor={palette.white}
            logo={undefined}
          />
        </View>
        {onExpand && (
          <View style={styles.expandHint}>
            <Ionicons name="expand-outline" size={14} color={palette.textSecondary} />
            <Typography variant="caption" color={palette.textSecondary}>
              Appuyer pour agrandir
            </Typography>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={16} color={palette.textSecondary} />
          <Typography variant="caption" color={palette.textSecondary} style={{ flex: 1 }}>
            Valide ±15 min autour de l'heure de début
          </Typography>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={palette.textSecondary} />
          <Typography variant="caption" color={palette.textSecondary}>
            {formatDateTime(startAt)}
          </Typography>
        </View>
      </View>

      <View style={styles.badge}>
        <Ionicons name="shield-checkmark" size={14} color={semanticColors.primary} />
        <Typography style={{ fontSize: 11, color: semanticColors.primary, fontWeight: '600' }}>
          Token JWT sécurisé
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: semanticColors.primaryLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qrWrapper: { alignItems: 'center', gap: spacing.sm },
  qrFrame: {
    padding: spacing.md,
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: palette.border,
  },
  expandHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  info: { gap: spacing.xs, width: '100%' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: semanticColors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
});
