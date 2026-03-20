import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { palette, semanticColors } from '../../constants/colors';
import { spacing, radius, shadow } from '../../constants/spacing';
import { useUIStore } from '../../store/uiStore';

const typeConfig = {
  success: { bg: semanticColors.statusConfirmed, icon: 'checkmark-circle' as const },
  error: { bg: semanticColors.danger, icon: 'alert-circle' as const },
  info: { bg: '#3B82F6', icon: 'information-circle' as const },
  warning: { bg: semanticColors.warning, icon: 'warning' as const },
};

export function SnackbarContainer() {
  const { snackbars, dismissSnackbar } = useUIStore();

  if (snackbars.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {snackbars.map((s) => {
        const config = typeConfig[s.type];
        return (
          <View key={s.id} style={[styles.snackbar, { backgroundColor: config.bg }, shadow.md]}>
            <Ionicons name={config.icon} size={20} color={palette.white} />
            <Typography variant="bodyMedium" color={palette.white} style={styles.message}>
              {s.message}
            </Typography>
            <TouchableOpacity onPress={() => dismissSnackbar(s.id)} style={styles.close}>
              <Ionicons name="close" size={18} color={palette.white} />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    gap: spacing.sm,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  message: { flex: 1, fontSize: 14 },
  close: { padding: 2 },
});
