import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../src/components/ui/Typography';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Avatar } from '../../../src/components/ui/Avatar';
import { palette, semanticColors } from '../../../src/constants/colors';
import { spacing, radius, shadow } from '../../../src/constants/spacing';
import { useReservationStore } from '../../../src/store/reservationStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useUIStore } from '../../../src/store/uiStore';
import { mockUsers, mockRooms } from '../../../src/data/mockData';
import { UserRef, RoomRef } from '../../../src/types';
import { formatDate, formatTime } from '../../../src/utils/dateUtils';

type ReservationType = 'meeting' | 'room';
type Step = 'type' | 'form';

export default function NouveauScreen() {
  const [type, setType] = useState<ReservationType>('meeting');
  const [step, setStep] = useState<Step>('type');

  // Meeting fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRef | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomRef | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [locationType, setLocationType] = useState<'room' | 'video' | 'address'>('room');

  // Date/Time (mock: today + 1 hour)
  const getDefaultStart = () => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return d.toISOString();
  };
  const getDefaultEnd = () => {
    const d = new Date();
    d.setHours(d.getHours() + 3, 0, 0, 0);
    return d.toISOString();
  };
  const [startAt] = useState(getDefaultStart());
  const [endAt] = useState(getDefaultEnd());

  const { createMeeting, createRoomReservation } = useReservationStore();
  const { user } = useAuthStore();
  const { showSnackbar } = useUIStore();

  const filteredUsers = mockUsers.filter(
    (u) =>
      userSearch.length > 0 &&
      (u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Titre requis', 'Veuillez saisir un titre pour la réservation.');
      return;
    }
    if (!user) return;

    try {
      if (type === 'meeting') {
        if (!selectedUser) {
          Alert.alert('Invité requis', 'Veuillez sélectionner une personne à inviter.');
          return;
        }
        const res = await createMeeting({
          title,
          description,
          invitee: selectedUser,
          slot: { startAt, endAt, timezone: 'Africa/Dakar' },
          location: selectedRoom
            ? { type: 'room', roomId: selectedRoom.id, roomName: selectedRoom.name }
            : locationType === 'video'
            ? { type: 'video', videoLink: 'https://meet.google.com/abc-defg-hij' }
            : undefined,
          initiatorId: user.id,
          initiatorRef: {
            id: user.id,
            displayName: user.displayName,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
        });
        showSnackbar(`Invitation envoyée à ${selectedUser.displayName} !`, 'success');
        router.replace(`/(tabs)/reservations/${res.id}`);
      } else {
        if (!selectedRoom) {
          Alert.alert('Salle requise', 'Veuillez sélectionner une salle.');
          return;
        }
        const res = await createRoomReservation({
          title,
          description,
          room: selectedRoom,
          slot: { startAt, endAt, timezone: 'Africa/Dakar' },
          attendees: [],
          organizerRef: {
            id: user.id,
            displayName: user.displayName,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
        });
        showSnackbar(`Salle ${selectedRoom.name} réservée avec succès !`, 'success');
        router.replace(`/(tabs)/reservations/${res.id}`);
      }
    } catch {
      showSnackbar('Erreur lors de la création. Réessayez.', 'error');
    }
  };

  if (step === 'type') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={22} color={palette.textPrimary} />
          </TouchableOpacity>
          <Typography variant="h3">Nouvelle réservation</Typography>
        </View>

        <View style={styles.typeSelection}>
          <Typography variant="body" color={palette.textSecondary} align="center">
            Quel type de réservation souhaitez-vous créer ?
          </Typography>

          <View style={styles.typeCards}>
            {/* Bilateral meeting card */}
            <TouchableOpacity
              style={[styles.typeCard, type === 'meeting' && styles.typeCardActive]}
              onPress={() => setType('meeting')}
              accessibilityRole="radio"
              accessibilityState={{ selected: type === 'meeting' }}
            >
              <View style={[styles.typeIconBox, { backgroundColor: type === 'meeting' ? semanticColors.primary : palette.surface }]}>
                <Ionicons name="people" size={32} color={type === 'meeting' ? palette.white : semanticColors.primary} />
              </View>
              <Typography variant="h4" align="center">
                Rendez-vous bilatéral
              </Typography>
              <Typography variant="caption" color={palette.textSecondary} align="center">
                Invitation à une autre personne avec confirmation mutuelle
              </Typography>
              <View style={styles.features}>
                {['Invitation par email/SMS', 'Chat intégré', 'Confirmation bilatérale', 'QR code check-in'].map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={14} color={semanticColors.primary} />
                    <Typography variant="caption" color={palette.textSecondary}>{f}</Typography>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            {/* Room reservation card */}
            <TouchableOpacity
              style={[styles.typeCard, type === 'room' && styles.typeCardActive]}
              onPress={() => setType('room')}
              accessibilityRole="radio"
              accessibilityState={{ selected: type === 'room' }}
            >
              <View style={[styles.typeIconBox, { backgroundColor: type === 'room' ? semanticColors.primary : palette.surface }]}>
                <Ionicons name="business" size={32} color={type === 'room' ? palette.white : semanticColors.primary} />
              </View>
              <Typography variant="h4" align="center">
                Réservation de salle
              </Typography>
              <Typography variant="caption" color={palette.textSecondary} align="center">
                Réservez un espace partagé pour votre équipe
              </Typography>
              <View style={styles.features}>
                {['Calendrier visuel temps réel', 'Codes couleurs disponibilité', 'Anti-conflits automatique', 'QR code check-in'].map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={14} color={semanticColors.primary} />
                    <Typography variant="caption" color={palette.textSecondary}>{f}</Typography>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          </View>

          <Button
            label={`Continuer — ${type === 'meeting' ? 'Rendez-vous' : 'Salle'}`}
            onPress={() => setStep('form')}
            fullWidth
            size="lg"
            icon={<Ionicons name="arrow-forward" size={20} color={palette.white} />}
            iconPosition="right"
          />
        </View>
      </View>
    );
  }

  // Form step
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep('type')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons
            name={type === 'meeting' ? 'people-outline' : 'business-outline'}
            size={18}
            color={semanticColors.primary}
          />
          <Typography variant="h4" color={semanticColors.primary}>
            {type === 'meeting' ? 'Rendez-vous bilatéral' : 'Réservation de salle'}
          </Typography>
        </View>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <Input
          label="Titre *"
          value={title}
          onChangeText={setTitle}
          placeholder={type === 'meeting' ? 'Ex: Réunion de projet Q2' : 'Ex: Formation équipe produit'}
          icon="text-outline"
        />

        {/* Description */}
        <Input
          label="Description (optionnel)"
          value={description}
          onChangeText={setDescription}
          placeholder="Ajoutez des détails..."
          icon="document-text-outline"
          multiline
          numberOfLines={3}
          style={{ height: 80, paddingTop: 8 }}
        />

        {/* Date/time preview */}
        <View style={styles.datePreview}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={18} color={semanticColors.primary} />
            <View>
              <Typography variant="caption" color={palette.textSecondary}>Début</Typography>
              <Typography variant="bodyMedium">{formatDate(startAt, 'EEE d MMM')} à {formatTime(startAt)}</Typography>
            </View>
          </View>
          <View style={styles.dateSep} />
          <View style={styles.dateItem}>
            <Ionicons name="time-outline" size={18} color={semanticColors.primary} />
            <View>
              <Typography variant="caption" color={palette.textSecondary}>Fin</Typography>
              <Typography variant="bodyMedium">{formatTime(endAt)}</Typography>
            </View>
          </View>
        </View>

        {/* Meeting: invitee search */}
        {type === 'meeting' && (
          <View style={styles.fieldGroup}>
            <Typography variant="label" color={palette.textSecondary} style={styles.fieldLabel}>
              Inviter une personne *
            </Typography>
            <View style={styles.searchInput}>
              <Ionicons name="search-outline" size={18} color={palette.textSecondary} />
              <TextInput
                style={styles.searchField}
                value={userSearch}
                onChangeText={setUserSearch}
                placeholder="Rechercher par nom ou email…"
                placeholderTextColor={palette.textSecondary}
              />
            </View>
            {filteredUsers.map((u) => (
              <TouchableOpacity
                key={u.id}
                style={[styles.userRow, selectedUser?.id === u.id && styles.userRowSelected]}
                onPress={() => { setSelectedUser(u); setUserSearch(''); }}
              >
                <Avatar uri={u.avatarUrl} name={u.displayName} size={36} />
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium">{u.displayName}</Typography>
                  <Typography variant="caption" color={palette.textSecondary}>{u.email}</Typography>
                </View>
                {selectedUser?.id === u.id && (
                  <Ionicons name="checkmark-circle" size={20} color={semanticColors.primary} />
                )}
              </TouchableOpacity>
            ))}
            {selectedUser && (
              <View style={styles.selectedUser}>
                <Avatar uri={selectedUser.avatarUrl} name={selectedUser.displayName} size={36} />
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium">{selectedUser.displayName}</Typography>
                  <Typography variant="caption" color={palette.textSecondary}>{selectedUser.email}</Typography>
                </View>
                <TouchableOpacity onPress={() => setSelectedUser(null)}>
                  <Ionicons name="close-circle" size={20} color={palette.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Room: room selection */}
        {type === 'room' && (
          <View style={styles.fieldGroup}>
            <Typography variant="label" color={palette.textSecondary} style={styles.fieldLabel}>
              Choisir une salle *
            </Typography>
            {mockRooms.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.roomRow, selectedRoom?.id === r.id && styles.roomRowSelected]}
                onPress={() => setSelectedRoom({ id: r.id, name: r.name, building: r.building, capacity: r.capacity })}
              >
                <View style={[styles.roomDot, { backgroundColor: semanticColors.calendarAvailable }]} />
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium">{r.name}</Typography>
                  <Typography variant="caption" color={palette.textSecondary}>
                    {r.building} · {r.capacity} pers. max
                  </Typography>
                </View>
                {selectedRoom?.id === r.id && (
                  <Ionicons name="checkmark-circle" size={20} color={semanticColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Button
          label="Créer la réservation"
          onPress={handleCreate}
          fullWidth
          size="lg"
          icon={<Ionicons name="checkmark-circle-outline" size={20} color={palette.white} />}
          style={{ marginTop: spacing.md }}
        />

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  typeSelection: { flex: 1, padding: spacing.md, gap: spacing.xl, justifyContent: 'center' },
  typeCards: { gap: spacing.md },
  typeCard: {
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: palette.border,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: palette.white,
    ...shadow.sm,
  },
  typeCardActive: {
    borderColor: semanticColors.primary,
    backgroundColor: semanticColors.primaryLight,
  },
  typeIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  features: { gap: spacing.xs, width: '100%' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  form: { flex: 1 },
  formContent: { padding: spacing.md, gap: spacing.md },
  datePreview: {
    flexDirection: 'row',
    backgroundColor: semanticColors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  dateItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dateSep: { width: 1, height: 40, backgroundColor: semanticColors.primary, opacity: 0.3, marginHorizontal: spacing.md },
  fieldGroup: { gap: spacing.sm },
  fieldLabel: { marginBottom: 2 },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchField: { flex: 1, fontSize: 15, color: palette.textPrimary },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
  },
  userRowSelected: { backgroundColor: semanticColors.primaryLight },
  selectedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: semanticColors.primaryLight,
    borderWidth: 1.5,
    borderColor: semanticColors.primary,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  roomRowSelected: {
    backgroundColor: semanticColors.primaryLight,
    borderColor: semanticColors.primary,
  },
  roomDot: { width: 12, height: 12, borderRadius: 6 },
});
