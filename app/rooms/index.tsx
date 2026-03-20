import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/ui/Typography';
import { Input } from '../../src/components/ui/Input';
import { RoomCard } from '../../src/components/room/RoomCard';
import { palette, semanticColors } from '../../src/constants/colors';
import { spacing, radius } from '../../src/constants/spacing';
import { mockRooms } from '../../src/data/mockData';

type CapacityFilter = 'all' | 'small' | 'medium' | 'large';

const CAPACITY_FILTERS: { key: CapacityFilter; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'small', label: '1-5 pers.' },
  { key: 'medium', label: '6-12 pers.' },
  { key: 'large', label: '13+ pers.' },
];

export default function RoomsScreen() {
  const [search, setSearch] = useState('');
  const [capacityFilter, setCapacityFilter] = useState<CapacityFilter>('all');

  const filtered = mockRooms.filter((r) => {
    const matchSearch = search.length === 0 ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.building.toLowerCase().includes(search.toLowerCase());

    const matchCapacity =
      capacityFilter === 'all' ||
      (capacityFilter === 'small' && r.capacity <= 5) ||
      (capacityFilter === 'medium' && r.capacity >= 6 && r.capacity <= 12) ||
      (capacityFilter === 'large' && r.capacity >= 13);

    return matchSearch && matchCapacity && r.isActive;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <View>
          <Typography variant="h2">Salles disponibles</Typography>
          <Typography variant="caption" color={palette.textSecondary}>
            {filtered.length} salle{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
          </Typography>
        </View>
      </View>

      {/* Color legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: semanticColors.calendarAvailable }]} />
          <Typography variant="caption" color={palette.textSecondary}>Disponible</Typography>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: semanticColors.calendarOccupied }]} />
          <Typography variant="caption" color={palette.textSecondary}>Occupée</Typography>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher une salle…"
          icon="search-outline"
        />
      </View>

      {/* Capacity filters */}
      <View style={styles.filters}>
        {CAPACITY_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, capacityFilter === f.key && styles.filterChipActive]}
            onPress={() => setCapacityFilter(f.key)}
          >
            <Typography
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: capacityFilter === f.key ? palette.white : palette.textSecondary,
              }}
            >
              {f.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {/* Room list */}
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            isAvailable={Math.random() > 0.3}  // Demo: random availability
            onPress={() => router.push(`/rooms/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  searchBar: { padding: spacing.md, backgroundColor: palette.white },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  filterChipActive: {
    backgroundColor: semanticColors.primary,
    borderColor: semanticColors.primary,
  },
  list: { padding: spacing.md, paddingBottom: 100 },
});
