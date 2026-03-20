import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { StatusBadge } from '../ui/Badge';
import { Avatar, AvatarGroup } from '../ui/Avatar';
import { palette, semanticColors } from '../../constants/colors';
import { spacing, radius, shadow } from '../../constants/spacing';
import { Reservation, MeetingInvite, RoomReservation } from '../../types';
import { formatRelative, formatTime, formatDuration } from '../../utils/dateUtils';
import { getStatusColor } from '../../utils/conflictUtils';

interface ReservationCardProps {
  reservation: Reservation;
  onPress?: () => void;
  compact?: boolean;
}

export function ReservationCard({ reservation: r, onPress, compact = false }: ReservationCardProps) {
  const color = getStatusColor(r.status);
  const isMeeting = r.type === 'meeting';
  const meeting = isMeeting ? (r as MeetingInvite) : null;
  const room = !isMeeting ? (r as RoomReservation) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, shadow.sm]}
      accessibilityRole="button"
      accessibilityLabel={`${r.title}, ${formatRelative(r.slot.startAt)}`}
    >
      {/* Left color bar */}
      <View style={[styles.colorBar, { backgroundColor: color }]} />

      <View style={styles.body}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.typeTag}>
            <Ionicons
              name={isMeeting ? 'people-outline' : 'business-outline'}
              size={12}
              color={color}
            />
            <Typography style={{ fontSize: 10, color, fontWeight: '600' }}>
              {isMeeting ? 'Rendez-vous' : 'Salle'}
            </Typography>
          </View>
          <StatusBadge status={r.status} size="sm" />
        </View>

        {/* Title */}
        <Typography variant="h4" numberOfLines={1} style={styles.title}>
          {r.title}
        </Typography>

        {/* Time */}
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={palette.textSecondary} />
          <Typography variant="caption" color={palette.textSecondary}>
            {formatRelative(r.slot.startAt)} · {formatDuration(r.slot.startAt, r.slot.endAt)}
          </Typography>
        </View>

        {/* Location / Room */}
        {meeting?.location && (
          <View style={styles.metaRow}>
            <Ionicons
              name={
                meeting.location.type === 'video'
                  ? 'videocam-outline'
                  : meeting.location.type === 'room'
                  ? 'business-outline'
                  : 'location-outline'
              }
              size={14}
              color={palette.textSecondary}
            />
            <Typography variant="caption" color={palette.textSecondary} numberOfLines={1}>
              {meeting.location.roomName || meeting.location.address || meeting.location.videoLink}
            </Typography>
          </View>
        )}

        {room && (
          <View style={styles.metaRow}>
            <Ionicons name="business-outline" size={14} color={palette.textSecondary} />
            <Typography variant="caption" color={palette.textSecondary}>
              {room.room.name} · {room.room.building}
            </Typography>
          </View>
        )}

        {/* Participants */}
        {!compact && (
          <View style={styles.footer}>
            {isMeeting && meeting ? (
              <View style={styles.participants}>
                <Avatar uri={meeting.initiator.avatarUrl} name={meeting.initiator.displayName} size={24} />
                <Ionicons name="swap-horizontal" size={14} color={palette.textSecondary} />
                <Avatar uri={meeting.invitee.avatarUrl} name={meeting.invitee.displayName} size={24} />
                <Typography variant="caption" color={palette.textSecondary} style={{ marginLeft: spacing.xs }}>
                  {meeting.initiator.displayName.split(' ')[0]} & {meeting.invitee.displayName.split(' ')[0]}
                </Typography>
              </View>
            ) : room ? (
              <View style={styles.participants}>
                <AvatarGroup
                  users={[
                    { displayName: room.organizer.displayName, avatarUrl: room.organizer.avatarUrl },
                    ...room.attendees,
                  ]}
                  size={24}
                  max={3}
                />
                <Typography variant="caption" color={palette.textSecondary} style={{ marginLeft: spacing.xs }}>
                  {room.attendees.length + 1} participant{room.attendees.length !== 0 ? 's' : ''}
                </Typography>
              </View>
            ) : null}

            {/* QR available badge */}
            {r.status === 'confirmed' && (
              <View style={styles.qrBadge}>
                <Ionicons name="qr-code-outline" size={14} color={semanticColors.primary} />
                <Typography style={{ fontSize: 10, color: semanticColors.primary, fontWeight: '600' }}>
                  Check-in
                </Typography>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={18} color={palette.border} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  colorBar: { width: 4 },
  body: { flex: 1, padding: spacing.md, gap: spacing.xs },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: { marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  participants: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  qrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: semanticColors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  chevron: { alignSelf: 'center', marginRight: spacing.sm },
});
