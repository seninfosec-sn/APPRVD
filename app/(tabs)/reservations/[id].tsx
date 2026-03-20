import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../src/components/ui/Typography';
import { Button } from '../../../src/components/ui/Button';
import { StatusBadge } from '../../../src/components/ui/Badge';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Card } from '../../../src/components/ui/Card';
import { Divider } from '../../../src/components/ui/Divider';
import { QRCodeDisplay } from '../../../src/components/qr/QRCodeDisplay';
import { ChatThread } from '../../../src/components/chat/ChatThread';
import { StatusTimeline } from '../../../src/components/reservation/StatusTimeline';
import { palette, semanticColors } from '../../../src/constants/colors';
import { spacing, radius } from '../../../src/constants/spacing';
import { useReservationStore } from '../../../src/store/reservationStore';
import { useChatStore } from '../../../src/store/chatStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useUIStore } from '../../../src/store/uiStore';
import { MeetingInvite, RoomReservation } from '../../../src/types';
import { formatDate, formatTime, formatDuration } from '../../../src/utils/dateUtils';

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, confirmMeeting, cancelReservation, loadSingle, isLoading } = useReservationStore();
  const { loadThread } = useChatStore();
  const { user } = useAuthStore();
  const { showSnackbar } = useUIStore();
  const [actionLoading, setActionLoading] = useState(false);

  const reservation = getById(id);

  useEffect(() => {
    if (!reservation && id) {
      loadSingle(id);
    }
  }, [id]);

  useEffect(() => {
    if (reservation?.chatThreadId) {
      loadThread(reservation.chatThreadId);
    }
  }, [reservation?.chatThreadId]);

  if (!reservation && isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={semanticColors.primary} />
      </View>
    );
  }

  if (!reservation) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={palette.textSecondary} />
        <Typography variant="h3" style={{ marginTop: spacing.md }}>Réservation introuvable</Typography>
        <Button label="Retour" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  const isMeeting = reservation.type === 'meeting';
  const meeting = isMeeting ? (reservation as MeetingInvite) : null;
  const roomRes = !isMeeting ? (reservation as RoomReservation) : null;

  const slot = (reservation as any).slot;

  const isInitiator = user?.id === (meeting?.initiator as any)?.id;
  const isInvitee = user?.id === (meeting?.invitee as any)?.id;
  const myConfirmationDone = isInitiator
    ? meeting?.confirmations?.initiator
    : meeting?.confirmations?.invitee;
  const canConfirm =
    isMeeting &&
    meeting!.status !== 'confirmed' &&
    meeting!.status !== 'cancelled' &&
    meeting!.status !== 'expired' &&
    (isInitiator || isInvitee) &&
    !myConfirmationDone;

  const canCancel =
    reservation.status !== 'cancelled' && reservation.status !== 'expired';

  const handleConfirm = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await confirmMeeting(id, user.id);
      showSnackbar('Rendez-vous confirmé !', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Erreur lors de la confirmation.', 'error');
    } finally {
      setActionLoading(false);
    }
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
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelReservation(id);
              showSnackbar('Réservation annulée.', 'info');
              router.back();
            } catch {
              showSnackbar("Erreur lors de l'annulation.", 'error');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: reservation.title,
          headerBackTitle: 'Retour',
        }}
      />
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <StatusBadge status={reservation.status} />
          <Typography variant="h2" style={{ marginTop: spacing.sm }}>{reservation.title}</Typography>
          {reservation.description && (
            <Typography variant="body" color={palette.textSecondary} style={{ marginTop: spacing.xs }}>
              {reservation.description}
            </Typography>
          )}
        </View>

        {/* Timeline for meetings */}
        {isMeeting && meeting && (
          <Card style={styles.card}>
            <StatusTimeline status={meeting.status} />
          </Card>
        )}

        {/* Date & Time */}
        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color={semanticColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="bodyMedium">{slot ? formatDate(slot.startAt) : '-'}</Typography>
              <Typography variant="caption" color={palette.textSecondary}>
                {slot ? `${formatTime(slot.startAt)} → ${formatTime(slot.endAt)}` : '-'}
                {slot ? ` · ${formatDuration(slot.startAt, slot.endAt)}` : ''}
              </Typography>
            </View>
          </View>

          {isMeeting && meeting?.location && (
            <>
              <Divider margin={12} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name={
                      meeting.location.type === 'video'
                        ? 'videocam-outline'
                        : meeting.location.type === 'address'
                        ? 'location-outline'
                        : 'business-outline'
                    }
                    size={20}
                    color={semanticColors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium">
                    {meeting.location.type === 'video'
                      ? 'Visioconférence'
                      : meeting.location.type === 'address'
                      ? 'Adresse physique'
                      : 'Salle de réunion'}
                  </Typography>
                  <Typography variant="caption" color={palette.textSecondary}>
                    {meeting.location.videoLink || meeting.location.address || ''}
                  </Typography>
                </View>
              </View>
            </>
          )}

          {roomRes?.room && (
            <>
              <Divider margin={12} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="business-outline" size={20} color={semanticColors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium">{roomRes.room.name}</Typography>
                  <Typography variant="caption" color={palette.textSecondary}>
                    {roomRes.room.building} · {roomRes.room.capacity} personnes max
                  </Typography>
                </View>
              </View>
            </>
          )}
        </Card>

        {/* Participants */}
        <Card style={styles.card}>
          <Typography variant="bodyMedium" style={{ marginBottom: spacing.md }}>Participants</Typography>
          {isMeeting && meeting ? (
            <>
              <View style={styles.participantRow}>
                <Avatar name={meeting.initiator?.displayName || '?'} size={36} />
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium">{meeting.initiator?.displayName}</Typography>
                  <Typography variant="caption" color={palette.textSecondary}>Initiateur</Typography>
                </View>
                {meeting.confirmations?.initiator && (
                  <Ionicons name="checkmark-circle" size={20} color="#145847" />
                )}
              </View>
              <View style={[styles.participantRow, { marginTop: spacing.sm }]}>
                <Avatar name={meeting.invitee?.displayName || '?'} size={36} />
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium">{meeting.invitee?.displayName}</Typography>
                  <Typography variant="caption" color={palette.textSecondary}>Invité</Typography>
                </View>
                {meeting.confirmations?.invitee ? (
                  <Ionicons name="checkmark-circle" size={20} color="#145847" />
                ) : (
                  <Ionicons name="time-outline" size={20} color="#f0a500" />
                )}
              </View>
            </>
          ) : roomRes ? (
            <View style={styles.participantRow}>
              <Avatar name={roomRes.organizer?.displayName || '?'} size={36} />
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium">{roomRes.organizer?.displayName}</Typography>
                <Typography variant="caption" color={palette.textSecondary}>Organisateur</Typography>
              </View>
            </View>
          ) : null}
        </Card>

        {/* QR Code — only when confirmed and token exists */}
        {reservation.status === 'confirmed' && (reservation as any).qrToken && (
          <Card style={styles.card}>
            <Typography variant="bodyMedium" style={{ marginBottom: spacing.md }}>QR Code Check-in</Typography>
            <QRCodeDisplay
              token={(reservation as any).qrToken}
              reservationId={reservation.id}
              title={reservation.title}
              startAt={slot?.startAt || ''}
            />
          </Card>
        )}

        {/* Chat */}
        {reservation.chatThreadId && (
          <Card style={styles.card}>
            <Typography variant="bodyMedium" style={{ marginBottom: spacing.md }}>Discussion</Typography>
            <ChatThread threadId={reservation.chatThreadId} />
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {canConfirm && (
            <Button
              label="Confirmer le rendez-vous"
              onPress={handleConfirm}
              loading={actionLoading}
              fullWidth
              size="lg"
              style={{ marginBottom: spacing.sm }}
            />
          )}
          {canCancel && (
            <Button
              label="Annuler"
              onPress={handleCancel}
              loading={actionLoading}
              fullWidth
              size="lg"
              variant="outline"
            />
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.surface },
  container: { padding: spacing.xl, paddingBottom: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  header: { marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(20,88,71,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  actions: { marginTop: spacing.lg },
});
