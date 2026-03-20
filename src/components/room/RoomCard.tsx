import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { palette, semanticColors } from '../../constants/colors';
import { spacing, radius, shadow } from '../../constants/spacing';
import { Room, Equipment } from '../../types';

const equipmentIcons: Record<Equipment, keyof typeof Ionicons.glyphMap> = {
  projector: 'film-outline',
  whiteboard: 'create-outline',
  videoconference: 'videocam-outline',
  tv_screen: 'tv-outline',
  wifi: 'wifi-outline',
  air_conditioning: 'thermometer-outline',
  accessibility: 'accessibility-outline',
  phone: 'call-outline',
  coffee: 'cafe-outline',
};

interface RoomCardProps {
  room: Room;
  onPress?: () => void;
  isAvailable?: boolean;
}

export function RoomCard({ room, onPress, isAvailable = true }: RoomCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, shadow.sm]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${room.name}, capacité ${room.capacity} personnes`}
    >
      {/* Room photo */}
      <View style={styles.imageContainer}>
        {room.photos.length > 0 ? (
          <Image source={{ uri: room.photos[0] }} style={styles.image} />
        ) : (
          <View style={[styles.imagePlaceholder]}>
            <Ionicons name="business" size={40} color={palette.border} />
          </View>
        )}
        {/* Availability indicator */}
        <View
          style={[
            styles.availabilityDot,
            { backgroundColor: isAvailable ? semanticColors.calendarAvailable : semanticColors.calendarOccupied },
          ]}
        />
        <View
          style={[
            styles.availabilityBadge,
            { backgroundColor: isAvailable ? semanticColors.statusConfirmedBg : semanticColors.statusReservedBg },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: isAvailable ? semanticColors.calendarAvailable : semanticColors.calendarOccupied }]} />
          <Typography style={{ fontSize: 10, fontWeight: '700', color: isAvailable ? semanticColors.calendarAvailable : semanticColors.calendarOccupied }}>
            {isAvailable ? 'Disponible' : 'Occupé'}
          </Typography>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Typography variant="h4" style={{ flex: 1 }} numberOfLines={1}>
            {room.name}
          </Typography>
          <View style={styles.capacityBadge}>
            <Ionicons name="people-outline" size={12} color={semanticColors.primary} />
            <Typography style={{ fontSize: 11, fontWeight: '700', color: semanticColors.primary }}>
              {room.capacity}
            </Typography>
          </View>
        </View>

        <Typography variant="caption" color={palette.textSecondary}>
          {room.building} · Étage {room.floor}
        </Typography>

        {/* Equipment icons */}
        <View style={styles.equipment}>
          {room.equipment.slice(0, 5).map((eq) => (
            <View key={eq} style={styles.eqIcon}>
              <Ionicons name={equipmentIcons[eq]} size={16} color={palette.textSecondary} />
            </View>
          ))}
          {room.equipment.length > 5 && (
            <Typography variant="caption" color={palette.textSecondary}>
              +{room.equipment.length - 5}
            </Typography>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: palette.white,
  },
  availabilityBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  content: { padding: spacing.md, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: semanticColors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  equipment: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  eqIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
