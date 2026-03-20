import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../src/components/ui/Typography';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ReservationCard } from '../../../src/components/reservation/ReservationCard';
import { palette, semanticColors } from '../../../src/constants/colors';
import { spacing, radius } from '../../../src/constants/spacing';
import { useReservationStore } from '../../../src/store/reservationStore';
import { useAuthStore } from '../../../src/store/authStore';
import { Reservation } from '../../../src/types';

type FilterKey = 'all' | 'meeting' | 'room' | 'pending';

const FILTERS: { key: FilterKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'Tous', icon: 'list-outline' },
  { key: 'meeting', label: 'Rendez-vous', icon: 'people-outline' },
  { key: 'room', label: 'Salles', icon: 'business-outline' },
  { key: 'pending', label: 'En attente', icon: 'hourglass-outline' },
];

export default function ReservationsScreen() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { reservations, loadReservations, getPending } = useReservationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) loadReservations(user.id);
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.id) await loadReservations(user.id);
    setRefreshing(false);
  };

  const filtered: Reservation[] = reservations.filter((r) => {
    if (filter === 'meeting') return r.type === 'meeting';
    if (filter === 'room') return r.type === 'room';
    if (filter === 'pending') return r.status === 'pending' || r.status === 'proposed';
    return true;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const pendingCount = getPending().length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Typography variant="h2">Mes réservations</Typography>
          <Typography variant="caption" color={palette.textSecondary}>
            {reservations.length} réservation{reservations.length !== 1 ? 's' : ''}
          </Typography>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => {}}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={24} color={palette.textPrimary} />
          {pendingCount > 0 && (
            <View style={styles.notifBadge}>
              <Typography style={{ fontSize: 9, color: palette.white, fontWeight: '700' }}>
                {pendingCount}
              </Typography>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          const count = f.key === 'pending' ? pendingCount : undefined;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setFilter(f.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={f.icon}
                size={14}
                color={isActive ? palette.white : palette.textSecondary}
              />
              <Typography
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: isActive ? palette.white : palette.textSecondary,
                }}
              >
                {f.label}
              </Typography>
              {count !== undefined && count > 0 && (
                <View style={styles.chipBadge}>
                  <Typography style={{ fontSize: 9, color: palette.white, fontWeight: '700' }}>
                    {count}
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReservationCard
            reservation={item}
            onPress={() => router.push(`/(tabs)/reservations/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={semanticColors.primary}
            colors={[semanticColors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="Aucune réservation"
            description={
              filter === 'pending'
                ? "Vous n'avez pas de réservation en attente."
                : "Créez votre première réservation en appuyant sur +"
            }
            actionLabel="Nouvelle réservation"
            onAction={() => router.push('/(tabs)/nouveau')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.surface },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: palette.white,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: semanticColors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: palette.white,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    position: 'relative',
  },
  chipActive: {
    backgroundColor: semanticColors.primary,
    borderColor: semanticColors.primary,
  },
  chipBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: semanticColors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing.md,
    paddingBottom: 100,
    flexGrow: 1,
  },
});
