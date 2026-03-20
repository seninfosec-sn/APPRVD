import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  // Redirect to login or main app based on auth state
  // For demo, always go to login
  return <Redirect href="/(auth)/login" />;
}
