import React from 'react';
import { View, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { palette, semanticColors } from '../../src/constants/colors';
import { spacing, radius, shadow } from '../../src/constants/spacing';
import { useReservationStore } from '../../src/store/reservationStore';
import { formatDateTime } from '../../src/utils/dateUtils';

export default function QRCodeModal() {
  const { token, id } = useLocalSearchParams<{ token: string; id: string }>();
  const { getById } = useReservationStore();
  const reservation = getById(id);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `QR Code check-in — ${reservation?.title}\n${token}`,
        title: 'Partager le QR Code',
      });
    } catch {
      Alert.alert('Partage impossible', 'Impossible de partager le QR code.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => router.back()}
        accessibilityLabel="Fermer"
      >
        <Ionicons name="close" size={24} color={palette.textPrimary} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBg}>
          <Ionicons name="qr-code" size={32} color={semanticColors.primary} />
        </View>
        <Typography variant="h2" align="center">
          QR Code de check-in
        </Typography>
        {reservation && (
          <Typography variant="body" color={palette.textSecondary} align="center">
            {reservation.title}
          </Typography>
        )}
      </View>

      {/* QR Code — large format */}
      <View style={[styles.qrContainer, shadow.lg]}>
        <QRCode
          value={token || 'afcac-expo-meet://invalid'}
          size={240}
          color={palette.textPrimary}
          backgroundColor={palette.white}
        />
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color={semanticColors.primary} />
          <Typography variant="caption" color={palette.textSecondary}>
            Token JWT sécurisé — usage unique
          </Typography>
        </View>
        {reservation && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={semanticColors.warning} />
            <Typography variant="caption" color={palette.textSecondary}>
              Valide ±15 min autour de {formatDateTime(reservation.slot.startAt)}
            </Typography>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="phone-portrait-outline" size={16} color={palette.textSecondary} />
          <Typography variant="caption" color={palette.textSecondary}>
            Présentez ce code au scanner d'entrée
          </Typography>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          label="Partager"
          onPress={handleShare}
          variant="secondary"
          size="lg"
          fullWidth
          icon={<Ionicons name="share-outline" size={20} color={semanticColors.primary} />}
        />
        <Button
          label="Fermer"
          onPress={() => router.back()}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xl,
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.xl + 20,
    right: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: { alignItems: 'center', gap: spacing.sm },
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: semanticColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  qrContainer: {
    padding: spacing.xl,
    backgroundColor: palette.white,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: semanticColors.primaryLight,
  },
  infoBox: {
    width: '100%',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actions: { width: '100%', gap: spacing.sm },
});
