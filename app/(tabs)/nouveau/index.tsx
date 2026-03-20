import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../src/components/ui/Typography';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { palette, semanticColors } from '../../../src/constants/colors';
import { spacing, radius } from '../../../src/constants/spacing';
import { useAuthStore } from '../../../src/store/authStore';
import { useReservationStore } from '../../../src/store/reservationStore';
import { useUIStore } from '../../../src/store/uiStore';

type ReservationType = 'meeting' | 'room';
type LocationType = 'video' | 'address' | 'room';

interface UserResult {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

interface RoomResult {
  id: string;
  name: string;
  building: string;
  capacity: number;
  isAvailableNow?: boolean;
}

function toLocalDateTimeValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalDateTimeValue(val: string): string {
  return new Date(val).toISOString();
}

function getDefaultStart() {
  const d = new Date();
  d.setHours(d.getHours() + 2, 0, 0, 0);
  return d.toISOString();
}

function getDefaultEnd() {
  const d = new Date();
  d.setHours(d.getHours() + 3, 0, 0, 0);
  return d.toISOString();
}

export default function NouveauScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<ReservationType>('meeting');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState(getDefaultStart());
  const [endAt, setEndAt] = useState(getDefaultEnd());
  const [locationType, setLocationType] = useState<LocationType>('video');
  const [address, setAddress] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Meeting
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Room
  const [rooms, setRooms] = useState<RoomResult[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomResult | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  // Salle pour le rendez-vous bilatéral
  const [selectedMeetingRoom, setSelectedMeetingRoom] = useState<RoomResult | null>(null);
  const [meetingRoomOpen, setMeetingRoomOpen] = useState(false);

  const { user } = useAuthStore();
  const { createMeeting, createRoomReservation, isLoading } = useReservationStore();
  const { showSnackbar } = useUIStore();

  // Load rooms on mount
  useEffect(() => {
    setLoadingRooms(true);
    fetch('/api/rooms')
      .then((r) => r.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : []);
        setLoadingRooms(false);
      })
      .catch(() => setLoadingRooms(false));
  }, []);

  // Search users with debounce
  useEffect(() => {
    if (userSearch.length < 2) {
      setUserResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(userSearch)}`);
        const data = await res.json();
        setUserResults(Array.isArray(data) ? data.filter((u: UserResult) => u.id !== user?.id) : []);
      } catch {
        setUserResults([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [userSearch, user?.id]);

  const handleCreate = async () => {
    if (!title.trim()) {
      showSnackbar('Le titre est requis.', 'error');
      return;
    }
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (end <= start) {
      showSnackbar("L'heure de fin doit être après l'heure de début.", 'error');
      return;
    }
    if (type === 'meeting' && !selectedUser) {
      showSnackbar('Veuillez sélectionner un invité.', 'error');
      return;
    }
    if (type === 'room' && !selectedRoom) {
      showSnackbar('Veuillez sélectionner une salle.', 'error');
      return;
    }
    if (!user) return;

    const initiatorRef = { id: user.id, displayName: user.displayName, email: user.email, avatarUrl: user.avatarUrl };
    const slot = { startAt, endAt, timezone: 'Africa/Dakar' };

    try {
      if (type === 'meeting') {
        let location: any = undefined;
        if (locationType === 'video') location = { type: 'video', videoUrl: videoUrl || 'https://meet.google.com' };
        else if (locationType === 'address') location = { type: 'address', address };
        else if (locationType === 'room' && selectedMeetingRoom) location = { type: 'room', roomId: selectedMeetingRoom.id, address: `${selectedMeetingRoom.name} — ${selectedMeetingRoom.building}` };
        await createMeeting({
          title: title.trim(),
          description: description.trim() || undefined,
          initiator: initiatorRef,
          invitee: selectedUser!,
          slot,
          location,
        });
        showSnackbar('Invitation envoyée avec succès !', 'success');
      } else {
        await createRoomReservation({
          title: title.trim(),
          description: description.trim() || undefined,
          organizer: initiatorRef,
          room: {
            id: selectedRoom!.id,
            name: selectedRoom!.name,
            building: selectedRoom!.building,
            capacity: selectedRoom!.capacity,
          },
          slot,
        });
        showSnackbar('Salle réservée avec succès !', 'success');
      }
      router.replace('/(tabs)/reservations');
    } catch (err: any) {
      showSnackbar(err.message || 'Erreur lors de la création.', 'error');
    }
  };

  if (step === 1) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.container}>
        <Typography variant="h2" style={styles.heading}>Nouvelle réservation</Typography>
        <Typography variant="body" color={palette.textSecondary} style={styles.subheading}>
          Choisissez le type de réservation
        </Typography>

        <TouchableOpacity
          style={[styles.typeCard, type === 'meeting' && styles.typeCardActive]}
          onPress={() => setType('meeting')}
        >
          <View style={[styles.typeIcon, type === 'meeting' && styles.typeIconActive]}>
            <Ionicons name="people-outline" size={28} color={type === 'meeting' ? palette.white : semanticColors.primary} />
          </View>
          <View style={styles.typeText}>
            <Typography variant="h3" color={type === 'meeting' ? semanticColors.primary : palette.textPrimary}>
              Rendez-vous bilatéral
            </Typography>
            <Typography variant="caption" color={palette.textSecondary}>
              Invitez une personne — confirmation mutuelle requise
            </Typography>
          </View>
          {type === 'meeting' && <Ionicons name="checkmark-circle" size={22} color={semanticColors.primary} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeCard, type === 'room' && styles.typeCardActive]}
          onPress={() => setType('room')}
        >
          <View style={[styles.typeIcon, type === 'room' && styles.typeIconActive]}>
            <Ionicons name="business-outline" size={28} color={type === 'room' ? palette.white : semanticColors.primary} />
          </View>
          <View style={styles.typeText}>
            <Typography variant="h3" color={type === 'room' ? semanticColors.primary : palette.textPrimary}>
              Réservation de salle
            </Typography>
            <Typography variant="caption" color={palette.textSecondary}>
              Réservez une salle de réunion disponible
            </Typography>
          </View>
          {type === 'room' && <Ionicons name="checkmark-circle" size={22} color={semanticColors.primary} />}
        </TouchableOpacity>

        <Button
          label="Continuer"
          onPress={() => setStep(2)}
          fullWidth
          size="lg"
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={palette.textPrimary} />
        </TouchableOpacity>
        <Typography variant="h2">
          {type === 'meeting' ? 'Rendez-vous bilatéral' : 'Réservation de salle'}
        </Typography>
      </View>

      <View style={styles.section}>
        <Input
          label="Titre *"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Réunion de suivi projet"
          icon="pencil-outline"
        />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Optionnel"
          icon="document-text-outline"
        />
      </View>

      {/* Date / Time */}
      <View style={styles.section}>
        <Typography variant="bodyMedium" style={styles.sectionLabel}>Date et heure</Typography>
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Typography variant="caption" color={palette.textSecondary}>Début</Typography>
            {Platform.OS === 'web' ? (
              <input
                type="datetime-local"
                value={toLocalDateTimeValue(startAt)}
                onChange={(e) => setStartAt(fromLocalDateTimeValue(e.target.value))}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${palette.border}`,
                  fontSize: 14,
                  width: '100%',
                  marginTop: 4,
                } as any}
              />
            ) : (
              <TouchableOpacity style={styles.dateBtn} onPress={() => Alert.alert('Sélection', startAt)}>
                <Ionicons name="calendar-outline" size={16} color={semanticColors.primary} />
                <Typography variant="body">
                  {new Date(startAt).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.dateField}>
            <Typography variant="caption" color={palette.textSecondary}>Fin</Typography>
            {Platform.OS === 'web' ? (
              <input
                type="datetime-local"
                value={toLocalDateTimeValue(endAt)}
                onChange={(e) => setEndAt(fromLocalDateTimeValue(e.target.value))}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${palette.border}`,
                  fontSize: 14,
                  width: '100%',
                  marginTop: 4,
                } as any}
              />
            ) : (
              <TouchableOpacity style={styles.dateBtn} onPress={() => Alert.alert('Sélection', endAt)}>
                <Ionicons name="calendar-outline" size={16} color={semanticColors.primary} />
                <Typography variant="body">
                  {new Date(endAt).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Meeting specific */}
      {type === 'meeting' && (
        <>
          <View style={styles.section}>
            <Typography variant="bodyMedium" style={styles.sectionLabel}>Invité *</Typography>
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color={palette.textSecondary}
                style={{ marginRight: spacing.sm }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher par nom ou email..."
                placeholderTextColor={palette.textSecondary}
                value={userSearch}
                onChangeText={(t) => {
                  setUserSearch(t);
                  setSelectedUser(null);
                }}
              />
              {searchingUsers && <ActivityIndicator size="small" color={semanticColors.primary} />}
            </View>
            {selectedUser && (
              <View style={styles.selectedUser}>
                <Ionicons name="person-circle-outline" size={24} color={semanticColors.primary} />
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium">{selectedUser.displayName}</Typography>
                  <Typography variant="caption" color={palette.textSecondary}>{selectedUser.email}</Typography>
                </View>
                <TouchableOpacity onPress={() => { setSelectedUser(null); setUserSearch(''); }}>
                  <Ionicons name="close-circle" size={20} color={palette.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
            {!selectedUser && userResults.length > 0 && (
              <View style={styles.dropdown}>
                {userResults.map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedUser(u);
                      setUserSearch(u.displayName);
                      setUserResults([]);
                    }}
                  >
                    <Ionicons name="person-outline" size={18} color={semanticColors.primary} />
                    <View>
                      <Typography variant="bodyMedium">{u.displayName}</Typography>
                      <Typography variant="caption" color={palette.textSecondary}>{u.email}</Typography>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {!selectedUser && userSearch.length >= 2 && !searchingUsers && userResults.length === 0 && (
              <Typography variant="caption" color={palette.textSecondary} style={{ marginTop: spacing.sm }}>
                Aucun utilisateur trouvé
              </Typography>
            )}
          </View>

          <View style={styles.section}>
            <Typography variant="bodyMedium" style={styles.sectionLabel}>Type de lieu</Typography>
            <View style={styles.locRow}>
              {(['video', 'address', 'room'] as LocationType[]).map((lt) => (
                <TouchableOpacity
                  key={lt}
                  style={[styles.locBtn, locationType === lt && styles.locBtnActive]}
                  onPress={() => setLocationType(lt)}
                >
                  <Ionicons
                    name={
                      lt === 'video'
                        ? 'videocam-outline'
                        : lt === 'address'
                        ? 'location-outline'
                        : 'business-outline'
                    }
                    size={16}
                    color={locationType === lt ? palette.white : palette.textSecondary}
                  />
                  <Typography variant="caption" color={locationType === lt ? palette.white : palette.textSecondary}>
                    {lt === 'video' ? 'Visio' : lt === 'address' ? 'Adresse' : 'Salle'}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
            {locationType === 'address' && (
              <Input
                label="Adresse"
                value={address}
                onChangeText={setAddress}
                placeholder="Ex: 12 avenue Cheikh Anta Diop"
                icon="location-outline"
              />
            )}
            {locationType === 'video' && (
              <Input
                label="Lien visio"
                value={videoUrl}
                onChangeText={setVideoUrl}
                placeholder="https://meet.google.com/..."
                icon="link-outline"
              />
            )}
            {locationType === 'room' && (
              <View style={{ gap: spacing.xs }}>
                {loadingRooms ? (
                  <ActivityIndicator color={semanticColors.primary} style={{ marginVertical: spacing.sm }} />
                ) : Platform.OS === 'web' ? (
                  <View style={styles.selectWrapper}>
                    <Ionicons name="business-outline" size={18} color={semanticColors.primary} style={styles.selectIcon} />
                    <select
                      value={selectedMeetingRoom?.id || ''}
                      onChange={(e) => {
                        const room = rooms.find((r) => r.id === e.target.value) || null;
                        setSelectedMeetingRoom(room);
                      }}
                      style={{
                        flex: 1, border: 'none', outline: 'none', background: 'transparent',
                        fontSize: 15,
                        color: selectedMeetingRoom ? palette.textPrimary : palette.textSecondary,
                        cursor: 'pointer', paddingRight: 8,
                      } as any}
                    >
                      <option value="">— Choisir une salle —</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id} disabled={room.isAvailableNow === false}>
                          {room.isAvailableNow === false ? '🔴' : '🟢'} {room.name} — {room.building} · {room.capacity} pers.
                        </option>
                      ))}
                    </select>
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity
                      style={styles.selectWrapper}
                      onPress={() => setMeetingRoomOpen((o) => !o)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="business-outline" size={18} color={semanticColors.primary} style={styles.selectIcon} />
                      <Typography
                        variant="body"
                        color={selectedMeetingRoom ? palette.textPrimary : palette.textSecondary}
                        style={{ flex: 1 }}
                      >
                        {selectedMeetingRoom
                          ? `${selectedMeetingRoom.name} — ${selectedMeetingRoom.building} · ${selectedMeetingRoom.capacity} pers.`
                          : '— Choisir une salle —'}
                      </Typography>
                      <Ionicons
                        name={meetingRoomOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={palette.textSecondary}
                      />
                    </TouchableOpacity>
                    {meetingRoomOpen && (
                      <View style={styles.dropdownList}>
                        {rooms.map((room, idx) => (
                          <TouchableOpacity
                            key={room.id}
                            style={[
                              styles.dropdownListItem,
                              idx < rooms.length - 1 && styles.dropdownListItemBorder,
                              room.isAvailableNow === false && styles.dropdownListItemDisabled,
                              selectedMeetingRoom?.id === room.id && styles.dropdownListItemActive,
                            ]}
                            onPress={() => {
                              if (room.isAvailableNow === false) return;
                              setSelectedMeetingRoom(room);
                              setMeetingRoomOpen(false);
                            }}
                          >
                            <View style={[styles.availDot, { backgroundColor: room.isAvailableNow !== false ? '#145847' : '#e24b4a' }]} />
                            <View style={{ flex: 1 }}>
                              <Typography variant="bodyMedium" color={selectedMeetingRoom?.id === room.id ? semanticColors.primary : palette.textPrimary}>
                                {room.name}
                              </Typography>
                              <Typography variant="caption" color={palette.textSecondary}>
                                {room.building} · {room.capacity} personnes
                              </Typography>
                            </View>
                            {selectedMeetingRoom?.id === room.id && (
                              <Ionicons name="checkmark-circle" size={18} color={semanticColors.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
                {selectedMeetingRoom && (
                  <View style={styles.roomDetail}>
                    <Ionicons name="information-circle-outline" size={16} color={semanticColors.primary} />
                    <Typography variant="caption" color={semanticColors.primary}>
                      {selectedMeetingRoom.name} · {selectedMeetingRoom.building} · {selectedMeetingRoom.capacity} pers. max
                      {selectedMeetingRoom.isAvailableNow !== false ? ' · Disponible' : ' · Occupée'}
                    </Typography>
                  </View>
                )}
              </View>
            )}
          </View>
        </>
      )}

      {/* Room specific — liste déroulante */}
      {type === 'room' && (
        <View style={styles.section}>
          <Typography variant="bodyMedium" style={styles.sectionLabel}>Sélectionner une salle *</Typography>

          {loadingRooms ? (
            <ActivityIndicator color={semanticColors.primary} style={{ marginVertical: spacing.md }} />
          ) : Platform.OS === 'web' ? (
            /* ── Web : <select> natif ── */
            <View style={styles.selectWrapper}>
              <Ionicons name="business-outline" size={18} color={semanticColors.primary} style={styles.selectIcon} />
              <select
                value={selectedRoom?.id || ''}
                onChange={(e) => {
                  const room = rooms.find((r) => r.id === e.target.value) || null;
                  setSelectedRoom(room);
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 15,
                  color: selectedRoom ? palette.textPrimary : palette.textSecondary,
                  cursor: 'pointer',
                  paddingRight: 8,
                } as any}
              >
                <option value="">— Choisir une salle —</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id} disabled={room.isAvailableNow === false}>
                    {room.isAvailableNow === false ? '🔴' : '🟢'} {room.name} — {room.building} · {room.capacity} pers.
                  </option>
                ))}
              </select>
            </View>
          ) : (
            /* ── Mobile : dropdown custom ── */
            <View>
              <TouchableOpacity
                style={styles.selectWrapper}
                onPress={() => setRoomDropdownOpen((o) => !o)}
                activeOpacity={0.8}
              >
                <Ionicons name="business-outline" size={18} color={semanticColors.primary} style={styles.selectIcon} />
                <Typography
                  variant="body"
                  color={selectedRoom ? palette.textPrimary : palette.textSecondary}
                  style={{ flex: 1 }}
                >
                  {selectedRoom
                    ? `${selectedRoom.name} — ${selectedRoom.building} · ${selectedRoom.capacity} pers.`
                    : '— Choisir une salle —'}
                </Typography>
                <Ionicons
                  name={roomDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={palette.textSecondary}
                />
              </TouchableOpacity>

              {roomDropdownOpen && (
                <View style={styles.dropdownList}>
                  {rooms.map((room, idx) => (
                    <TouchableOpacity
                      key={room.id}
                      style={[
                        styles.dropdownListItem,
                        idx < rooms.length - 1 && styles.dropdownListItemBorder,
                        room.isAvailableNow === false && styles.dropdownListItemDisabled,
                        selectedRoom?.id === room.id && styles.dropdownListItemActive,
                      ]}
                      onPress={() => {
                        if (room.isAvailableNow === false) return;
                        setSelectedRoom(room);
                        setRoomDropdownOpen(false);
                      }}
                    >
                      <View style={[styles.availDot, { backgroundColor: room.isAvailableNow !== false ? '#145847' : '#e24b4a' }]} />
                      <View style={{ flex: 1 }}>
                        <Typography
                          variant="bodyMedium"
                          color={selectedRoom?.id === room.id ? semanticColors.primary : palette.textPrimary}
                        >
                          {room.name}
                        </Typography>
                        <Typography variant="caption" color={palette.textSecondary}>
                          {room.building} · {room.capacity} personnes
                        </Typography>
                      </View>
                      {selectedRoom?.id === room.id && (
                        <Ionicons name="checkmark-circle" size={18} color={semanticColors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Détail salle sélectionnée */}
          {selectedRoom && (
            <View style={styles.roomDetail}>
              <Ionicons name="information-circle-outline" size={16} color={semanticColors.primary} />
              <Typography variant="caption" color={semanticColors.primary}>
                {selectedRoom.name} · {selectedRoom.building} · {selectedRoom.capacity} personnes max
                {selectedRoom.isAvailableNow !== false ? ' · Disponible maintenant' : ' · Occupée actuellement'}
              </Typography>
            </View>
          )}
        </View>
      )}

      <Button
        label={type === 'meeting' ? "Envoyer l'invitation" : 'Réserver la salle'}
        onPress={handleCreate}
        loading={isLoading}
        fullWidth
        size="lg"
        style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.surface },
  container: { padding: spacing.xl, paddingBottom: 80 },
  heading: { marginBottom: spacing.xs },
  subheading: { marginBottom: spacing.xl },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  typeCardActive: { borderColor: semanticColors.primary },
  typeIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(20,88,71,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIconActive: { backgroundColor: semanticColors.primary },
  typeText: { flex: 1, gap: 2 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  section: { marginBottom: spacing.lg, gap: spacing.sm },
  sectionLabel: { marginBottom: spacing.xs },
  dateRow: { flexDirection: 'row', gap: spacing.md },
  dateField: { flex: 1 },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: palette.textPrimary,
    outlineStyle: 'none',
  } as any,
  selectedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(20,88,71,0.06)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  dropdown: {
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
    marginTop: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  locRow: { flexDirection: 'row', gap: spacing.sm },
  locBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.white,
  },
  locBtnActive: {
    backgroundColor: semanticColors.primary,
    borderColor: semanticColors.primary,
  },
  selectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  selectIcon: { marginRight: 2 },
  dropdownList: {
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: semanticColors.primary,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dropdownListItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  dropdownListItemDisabled: { opacity: 0.4 },
  dropdownListItemActive: { backgroundColor: 'rgba(20,88,71,0.06)' },
  availDot: { width: 10, height: 10, borderRadius: 5 },
  roomDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(20,88,71,0.06)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: 4,
  },
});
