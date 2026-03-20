import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { palette, semanticColors } from '../../src/constants/colors';
import { spacing, radius } from '../../src/constants/spacing';
import { mockRooms } from '../../src/data/mockData';
import { Equipment } from '../../src/types';

const equipmentLabels: Record<Equipment, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  projector: { label: 'Vidéoprojecteur', icon: 'film-outline' },
  whiteboard: { label: 'Tableau blanc', icon: 'create-outline' },
  videoconference: { label: 'Visioconférence', icon: 'videocam-outline' },
  tv_screen: { label: 'Écran TV', icon: 'tv-outline' },
  wifi: { label: 'Wi-Fi', icon: 'wifi-outline' },
  air_conditioning: { label: 'Climatisation', icon: 'thermometer-outline' },
  accessibility: { label: 'Accessible PMR', icon: 'accessibility-outline' },
  phone: { label: 'Téléphone', icon: 'call-outline' },
  coffee: { label: 'Machine à café', icon: 'cafe-outline' },
};

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [photoIndex, setPhotoIndex] = useState(0);
  const room = mockRooms.find((r) => r.id === id);

  if (!room) {
    return (
      <View style={styles.notFound}>
        <Typography variant="h3" color={palette.textSecondary}>Salle introuvable</Typography>
        <Button label="Retour" onPress={() => router.back()} variant="ghost" />
      </View>
    );
  }

  const isAvailable = Math.random() > 0.3; // Demo

  return (
    <View style={styles.container}>
      {/* Back button over photo */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={palette.white} />
      </TouchableOpacity>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Photo carousel */}
        <View style={styles.photoContainer}>
          {room.photos.length > 0 ? (
            <Image source={{ uri: room.photos[photoIndex] }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Ionicons name="business" size={60} color={palette.border} />
            </View>
          )}
          {/* Availability badge */}
          <View style={[styles.availBadge, { backgroundColor: isAvailable ? semanticColors.statusConfirmedBg : semanticColors.statusReservedBg }]}>
            <View style={[styles.availDot, { backgroundColor: isAvailable ? semanticColors.calendarAvailable : semanticColors.calendarOccupied }]} />
            <Typography style={{ fontSize: 12, fontWeight: '700', color: isAvailable ? semanticColors.calendarAvailable : semanticColors.calendarOccupied }}>
              {isAvailable ? 'Disponible maintenant' : 'Actuellement occupée'}
            </Typography>
          </View>
          {/* Photo indicators */}
          {room.photos.length > 1 && (
            <View style={styles.photoDots}>
              {room.photos.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setPhotoIndex(i)}>
                  <View style={[styles.photoDot, i === photoIndex && styles.photoDotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.roomHeader}>
            <View style={{ flex: 1 }}>
              <Typography variant="h1">{room.name}</Typography>
              <Typography variant="body" color={palette.textSecondary}>
                {room.building} · Étage {room.floor}
              </Typography>
            </View>
            <View style={styles.capacityBadge}>
              <Ionicons name="people" size={18} color={semanticColors.primary} />
              <Typography variant="h3" color={semanticColors.primary}>{room.capacity}</Typography>
              <Typography variant="caption" color={palette.textSecondary}>pers.</Typography>
            </View>
          </View>

          {/* Description */}
          {room.description && (
            <Typography variant="body" color={palette.textSecondary} style={styles.description}>
              {room.description}
            </Typography>
          )}

          {/* Equipment */}
          <Card style={styles.card}>
            <Typography variant="label" color={palette.textSecondary} style={styles.cardTitle}>
              Équipements
            </Typography>
            <View style={styles.equipment}>
              {room.equipment.map((eq) => {
                const { label, icon } = equipmentLabels[eq];
                return (
                  <View key={eq} style={styles.eqItem}>
                    <View style={styles.eqIcon}>
                      <Ionicons name={icon} size={18} color={semanticColors.primary} />
                    </View>
                    <Typography variant="caption" color={palette.textPrimary}>{label}</Typography>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Rules */}
          <Card style={styles.card}>
            <Typography variant="label" color={palette.textSecondary} style={styles.cardTitle}>
              Règles de réservation
            </Typography>
            <View style={styles.rules}>
              <View style={styles.ruleRow}>
                <Ionicons name="time-outline" size={16} color={semanticColors.primary} />
                <Typography variant="caption">
                  Durée : {room.rules.minDurationMinutes} min à {room.rules.maxDurationMinutes / 60}h max
                </Typography>
              </View>
              <View style={styles.ruleRow}>
                <Ionicons name="calendar-outline" size={16} color={semanticColors.primary} />
                <Typography variant="caption">
                  Horaires : {room.rules.openingTime} – {room.rules.closingTime}
                </Typography>
              </View>
            </View>
          </Card>

          {/* Tags */}
          {room.tags.length > 0 && (
            <View style={styles.tags}>
              {room.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Typography style={{ fontSize: 12, color: semanticColors.primary, fontWeight: '600' }}>
                    {tag}
                  </Typography>
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          <Button
            label="Réserver cette salle"
            onPress={() => router.push('/(tabs)/nouveau')}
            fullWidth
            size="lg"
            disabled={!isAvailable}
            icon={<Ionicons name="calendar" size={20} color={palette.white} />}
            style={{ marginTop: spacing.md }}
          />

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.surface },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  photoContainer: { height: 280, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  availDot: { width: 8, height: 8, borderRadius: 4 },
  photoDots: { position: 'absolute', bottom: spacing.sm, right: spacing.md, flexDirection: 'row', gap: 4 },
  photoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  photoDotActive: { backgroundColor: palette.white },
  content: { padding: spacing.md, gap: spacing.md },
  roomHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  capacityBadge: {
    alignItems: 'center',
    backgroundColor: semanticColors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 2,
  },
  description: { lineHeight: 22 },
  card: { padding: spacing.md, gap: spacing.md },
  cardTitle: { marginBottom: spacing.xs },
  equipment: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  eqItem: { alignItems: 'center', gap: spacing.xs, width: 80 },
  eqIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: semanticColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rules: { gap: spacing.sm },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    backgroundColor: semanticColors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
});
