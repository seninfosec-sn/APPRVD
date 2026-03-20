import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../src/components/ui/Typography';
import { StatusBadge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { Avatar, AvatarGroup } from '../../../src/components/ui/Avatar';
import { Divider } from '../../../src/components/ui/Divider';
import { StatusTimeline } from '../../../src/components/reservation/StatusTimeline';
import { QRCodeDisplay } from '../../../src/components/qr/QRCodeDisplay';
import { ChatThread } from '../../../src/components/chat/ChatThread';
import { palette, semanticColors } from '../../../src/constants/colors';
import { spacing, radius } from '../../../src/constants/spacing';
import { useReservationStore } from '../../../src/store/reservationStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useUIStore } from '../../../src/store/uiStore';
import { MeetingInvite, RoomReservation } from '../../../src/types';
import { formatRelative, formatTime, formatDuration, formatDate } from '../../../src/utils/dateUtils';

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, confirmMeeting, cancelReservation } = useReservationStore();
  const { user } = useAuthStore();
  const { showSnackbar } = useUIStore();

  const reservation = getById(id);

  if (!reservation) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={48} color={palette.textSecondary} />
        <Typography variant="h3" color={palette.textSecondary}>Réservation introuvable</Typography>
        <Button label="Retour" onPress={() => router.back()} variant="ghost" />
      </View>
    );
  }

  const isMeeting = reservation.type === 'meeting';
  const meeting = isMeeting ? (reservation as MeetingInvite) : null;
  const roomRes = !isMeeting ? (reservation as RoomReservation) : null;

  const canConfirm = isMeeting && meeting &&
    (reservation.status === 'pending' || reservation.status === 'proposed') &&
    meeting.invitee.id === user?.id && !meeting.confirmations.invitee;

  const canCancel = reservation.status !== 'cancelled' && reservation.status !== 'expired';

  const handleConfirm = () => {
    if (!user) return;
    confirmMeeting(reservation.id, user.id);
    showSnackbar('Réservation confirmée ! QR code disponible.', 'success');
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler la réservation',
      'Êtes-vous sûr de vouloir annuler cette réservation ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => {
            cancelReservation(reservation.id);
            showSnackbar('Réservation annulée.', 'info');
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Retour"
        >
          <Ionicons name="arrow-back" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Typography variant="h4" numberOfLines={1} style={{ flex: 1 }}>
            {reservation.type === 'meeting' ? 'Rendez-vous' : 'Salle réservée'}
          </Typography>
          <StatusBadge status={reservation.status} />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleSection}>
          <View style={styles.typeIcon}>
            <Ionicons
              name={isMeeting ? 'people' : 'business'}
              size={24}
              color={palette.white}
            />
          </View>
          <View style={styles.titleText}>
            <Typography variant="h2">{reservation.title}</Typography>
            {reservation.description && (
              <Typography variant="body" color={palette.textSecondary} style={{ marginTop: 4 }}>
                {reservation.description}
              </Typography>
            )}
          </View>
        </View>

        {/* Status Timeline */}
        <Card style={styles.section}>
          <Typography variant="label" color={palette.textSecondary} style={styles.sectionLabel}>
            Statut
          </Typography>
          <StatusTimeline status={reservation.status} />
        </Card>

        {/* Date & Time */}
        <Card style={styles.section}>
          <Typography variant="label" color={palette.textSecondary} style={styles.sectionLabel}>
            Date & heure
          </Typography>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={18} color={semanticColors.primary} />
            </View>
            <View>
              <Typography variant="bodyMedium">
                {formatRelative(reservation.slot.startAt)}
              </Typography>
              <Typography variant="caption" color={palette.textSecondary}>
                {formatTime(reservation.slot.startAt)} → {formatTime(reservation.slot.endAt)}
                {' · '}{formatDuration(reservation.slot.startAt, reservation.slot.endAt)}
              </Typography>
            </View>
          </View>
        </Card>

        {/* Location / Room */}
        <Card style={styles.section}>
          <Typography variant="label" color={palette.textSecondary} style={styles.sectionLabel}>
            Lieu
          </Typography>
          {meeting?.location && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name={
                    meeting.location.type === 'video'
                      ? 'videocam'
                      : meeting.location.type === 'room'
                      ? 'business'
                      : 'location'
                  }
                  size={18}
                  color={semanticColors.primary}
                />
              </View>
              <View>
                <Typography variant="bodyMedium">
                  {meeting.location.type === 'video'
                    ? 'Visioconférence'
                    : meeting.location.type === 'room'
                    ? meeting.location.roomName
                    : meeting.location.address}
                </Typography>
                {meeting.location.type === 'video' && meeting.location.videoLink && (
                  <Typography variant="caption" color={semanticColors.primary}>
                    {meeting.location.videoLink}
                  </Typography>
                )}
              </View>
            </View>
          )}
          {roomRes && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="business" size={18} color={semanticColors.primary} />
              </View>
              <View>
                <Typography variant="bodyMedium">{roomRes.room.name}</Typography>
                <Typography variant="caption" color={palette.textSecondary}>
                  {roomRes.room.building} · Capacité {roomRes.room.capacity} pers.
                </Typography>
              </View>
            </View>
          )}
        </Card>

        {/* Participants */}
        <Card style={styles.section}>
          <Typography variant="label" color={palette.textSecondary} style={styles.sectionLabel}>
            Participants
          </Typography>
          {isMeeting && meeting ? (
            <View style={styles.participantList}>
              {[
                { user: meeting.initiator, role: 'Organisateur', confirmed: meeting.confirmations.initiator },
                { user: meeting.invitee, role: 'Invité', confirmed: meeting.confirmations.invitee },
              ].map(({ user: u, role, confirmed }) => (
                <View key={u.id} style={styles.participantRow}>
                  <Avatar uri={u.avatarUrl} name={u.displayName} size={40} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyMedium">{u.displayName}</Typography>
                    <Typography variant="caption" color={palette.textSecondary}>{role}</Typography>
                  </View>
                  <Ionicons
                    name={confirmed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={confirmed ? semanticColors.statusConfirmed : palette.textSecondary}
                  />
                </View>
              ))}
            </View>
          ) : roomRes ? (
            <View style={styles.participantList}>
              {[{ user: roomRes.organizer, role: 'Organisateur' }, ...roomRes.attendees.map(a => ({ user: a, role: 'Participant' }))].map(({ user: u, role }) => (
                <View key={u.id} style={styles.participantRow}>
                  <Avatar uri={u.avatarUrl} name={u.displayName} size={40} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyMedium">{u.displayName}</Typography>
                    <Typography variant="caption" color={palette.textSecondary}>{role}</Typography>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        {/* QR Code */}
        {reservation.status === 'confirmed' && reservation.qrToken && (
          <View style={styles.section}>
            <QRCodeDisplay
              token={reservation.qrToken}
              reservationId={reservation.id}
              title={reservation.title}
              startAt={reservation.slot.startAt}
              onExpand={() => router.push({ pathname: '/modal/qr-code', params: { token: reservation.qrToken, id: reservation.id } })}
            />
          </View>
        )}

        {/* Chat */}
        <Card style={[styles.section, { minHeight: 300 }]}>
          <ChatThread threadId={reservation.chatThreadId} />
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          {canConfirm && (
            <Button
              label="Confirmer ma présence"
              onPress={handleConfirm}
              fullWidth
              size="lg"
              icon={<Ionicons name="checkmark-circle-outline" size={20} color={palette.white} />}
            />
          )}
          {canCancel && (
            <Button
              label="Annuler la réservation"
              onPress={handleCancel}
              variant="outline"
              fullWidth
              size="lg"
              icon={<Ionicons name="close-circle-outline" size={20} color={semanticColors.danger} />}
              style={{ borderColor: semanticColors.danger }}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.surface },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md },
  titleSection: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  typeIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: semanticColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: { flex: 1 },
  section: { padding: spacing.md, gap: spacing.sm },
  sectionLabel: { marginBottom: spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: semanticColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantList: { gap: spacing.md },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actions: { gap: spacing.sm },
});
