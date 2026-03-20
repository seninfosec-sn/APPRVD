import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SnackbarContainer } from '../src/components/ui/Snackbar';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal/qr-code"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modal/conflict-alert"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
      <SnackbarContainer />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
