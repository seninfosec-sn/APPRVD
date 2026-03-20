import React from 'react';
import { Tabs, router } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CountBadge } from '../../src/components/ui/Badge';
import { palette, semanticColors } from '../../src/constants/colors';
import { shadow } from '../../src/constants/spacing';
import { useReservationStore } from '../../src/store/reservationStore';

function TabBarIcon({
  name,
  color,
  size = 24,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size?: number;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

// Custom FAB button for the center tab
function NewReservationButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      accessibilityLabel="Nouvelle réservation"
      accessibilityRole="button"
    >
      <Ionicons name="add" size={28} color={palette.white} />
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const { getPending } = useReservationStore();
  const pendingCount = getPending().length;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: semanticColors.tabActive,
        tabBarInactiveTintColor: semanticColors.tabInactive,
        tabBarStyle: {
          backgroundColor: palette.white,
          borderTopWidth: 1,
          borderTopColor: palette.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          ...shadow.md,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: palette.white,
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: palette.textPrimary,
        },
      }}
    >
      <Tabs.Screen
        name="calendrier"
        options={{
          title: 'Calendrier',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'calendar' : 'calendar-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Réservations',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View>
              <TabBarIcon
                name={focused ? 'list' : 'list-outline'}
                color={color}
              />
              {pendingCount > 0 && (
                <CountBadge count={pendingCount} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="nouveau"
        options={{
          title: '',
          headerShown: false,
          tabBarIcon: () => null,
          tabBarButton: () => (
            <NewReservationButton onPress={() => router.push('/(tabs)/nouveau')} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'person' : 'person-outline'}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: semanticColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 16 : 0,
    ...shadow.lg,
  },
});
