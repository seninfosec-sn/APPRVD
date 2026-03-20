import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../src/components/ui/Typography';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Card } from '../../../src/components/ui/Card';
import { Divider } from '../../../src/components/ui/Divider';
import { Button } from '../../../src/components/ui/Button';
import { palette, semanticColors } from '../../../src/constants/colors';
import { spacing, radius, shadow } from '../../../src/constants/spacing';
import { useAuthStore } from '../../../src/store/authStore';
import { useUIStore } from '../../../src/store/uiStore';
import { useReservationStore } from '../../../src/store/reservationStore';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  color?: string;
}

function MenuItem({ icon, label, sublabel, onPress, rightElement, color = palette.textPrimary }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.menuIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.menuText}>
        <Typography variant="bodyMedium" color={color}>{label}</Typography>
        {sublabel && <Typography variant="caption" color={palette.textSecondary}>{sublabel}</Typography>}
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={18} color={palette.border} />}
    </TouchableOpacity>
  );
}

export default function ProfilScreen() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const { reservations } = useReservationStore();

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    upcoming: reservations.filter((r) => new Date(r.slot.startAt) > new Date() && r.status !== 'cancelled').length,
  };

  const isDark = theme === 'dark';

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          <Avatar
            uri={user?.avatarUrl}
            name={user?.displayName || 'U'}
            size={80}
            borderColor={palette.white}
          />
          <TouchableOpacity style={styles.editAvatarBtn} accessibilityLabel="Modifier la photo">
            <Ionicons name="camera" size={14} color={palette.white} />
          </TouchableOpacity>
        </View>
        <Typography variant="h2" align="center">{user?.displayName}</Typography>
        <Typography variant="body" color={palette.textSecondary} align="center">{user?.email}</Typography>
        {user?.role === 'admin' && (
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={12} color={semanticColors.primary} />
            <Typography style={{ fontSize: 11, fontWeight: '700', color: semanticColors.primary }}>
              Administrateur
            </Typography>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total, icon: 'calendar-outline' as const },
          { label: 'Confirmées', value: stats.confirmed, icon: 'checkmark-circle-outline' as const },
          { label: 'À venir', value: stats.upcoming, icon: 'time-outline' as const },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Ionicons name={s.icon} size={20} color={semanticColors.primary} />
            <Typography variant="h2" color={semanticColors.primary}>{s.value}</Typography>
            <Typography variant="caption" color={palette.textSecondary}>{s.label}</Typography>
          </View>
        ))}
      </View>

      {/* Mon compte */}
      <Card style={styles.section}>
        <Typography variant="label" color={palette.textSecondary} style={styles.sectionTitle}>
          Mon compte
        </Typography>
        <MenuItem
          icon="person-outline"
          label="Modifier le profil"
          sublabel="Nom, photo, email"
          onPress={() => {}}
          color={semanticColors.primary}
        />
        <Divider margin={0} />
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          sublabel="Push, email, rappels"
          onPress={() => {}}
          color={semanticColors.primary}
        />
        <Divider margin={0} />
        <MenuItem
          icon="lock-closed-outline"
          label="Mot de passe"
          sublabel="Modifier le mot de passe"
          onPress={() => {}}
          color={semanticColors.primary}
        />
      </Card>

      {/* Préférences */}
      <Card style={styles.section}>
        <Typography variant="label" color={palette.textSecondary} style={styles.sectionTitle}>
          Préférences
        </Typography>
        <MenuItem
          icon="moon-outline"
          label="Mode sombre"
          onPress={() => {}}
          color={palette.textPrimary}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
              trackColor={{ false: palette.border, true: semanticColors.primary }}
              thumbColor={palette.white}
            />
          }
        />
        <Divider margin={0} />
        <MenuItem
          icon="language-outline"
          label="Langue"
          sublabel="Français"
          color={palette.textPrimary}
        />
        <Divider margin={0} />
        <MenuItem
          icon="time-outline"
          label="Fuseau horaire"
          sublabel="Africa/Dakar (GMT+0)"
          color={palette.textPrimary}
        />
      </Card>

      {/* Mes données */}
      <Card style={styles.section}>
        <Typography variant="label" color={palette.textSecondary} style={styles.sectionTitle}>
          Mes données (RGPD)
        </Typography>
        <MenuItem
          icon="download-outline"
          label="Exporter mes données"
          color={palette.textPrimary}
          onPress={() => Alert.alert('Export', 'Votre fichier sera envoyé par email sous 24h.')}
        />
        <Divider margin={0} />
        <MenuItem
          icon="trash-outline"
          label="Supprimer mon compte"
          color={semanticColors.danger}
          onPress={() => Alert.alert('Suppression', 'Cette action est irréversible. Contactez le support.')}
        />
      </Card>

      {/* À propos */}
      <Card style={styles.section}>
        <Typography variant="label" color={palette.textSecondary} style={styles.sectionTitle}>
          Application
        </Typography>
        <MenuItem
          icon="information-circle-outline"
          label="À propos"
          sublabel="Afcac-Expo-Meet v1.0.0"
          color={palette.textPrimary}
        />
        <Divider margin={0} />
        <MenuItem
          icon="document-text-outline"
          label="Mentions légales"
          color={palette.textPrimary}
        />
        <Divider margin={0} />
        <MenuItem
          icon="shield-outline"
          label="Politique de confidentialité"
          color={palette.textPrimary}
        />
      </Card>

      {/* Logout */}
      <Button
        label="Se déconnecter"
        onPress={handleLogout}
        variant="danger"
        fullWidth
        size="lg"
        icon={<Ionicons name="log-out-outline" size={20} color={palette.white} />}
        style={styles.logoutBtn}
      />

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.surface },
  content: { padding: spacing.md, gap: spacing.md },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: palette.white,
    borderRadius: radius.xl,
    gap: spacing.sm,
    ...shadow.sm,
  },
  avatarWrapper: { position: 'relative', marginBottom: spacing.sm },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: semanticColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.white,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: semanticColors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadow.sm,
  },
  section: { padding: 0, overflow: 'hidden', gap: 0 },
  sectionTitle: { padding: spacing.md, paddingBottom: spacing.sm },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: { flex: 1, gap: 2 },
  logoutBtn: { marginTop: spacing.sm },
});
