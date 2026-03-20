import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Divider } from '../../src/components/ui/Divider';
import { palette, semanticColors } from '../../src/constants/colors';
import { spacing, radius } from '../../src/constants/spacing';
import { useAuthStore } from '../../src/store/authStore';
import { useUIStore } from '../../src/store/uiStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('aissatou.diallo@afcac.org');
  const [password, setPassword] = useState('Afcac2025!');
  const [emailError, setEmailError] = useState('');
  const { login, loginWithSSO, isLoading } = useAuthStore();
  const { showSnackbar } = useUIStore();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWide = width >= 768;

  const handleLogin = async () => {
    setEmailError('');
    if (!email.includes('@')) {
      setEmailError('Adresse email invalide');
      return;
    }
    try {
      await login(email, password);
      router.replace('/(tabs)/calendrier');
    } catch {
      showSnackbar('Erreur de connexion. Vérifiez vos identifiants.', 'error');
    }
  };

  const handleSSO = async (provider: 'google' | 'apple') => {
    try {
      await loginWithSSO(provider);
      router.replace('/(tabs)/calendrier');
    } catch {
      showSnackbar('Connexion SSO impossible pour le moment.', 'error');
    }
  };

  // Layout côte à côte sur grand écran (web ≥ 768px)
  if (isWeb && isWide) {
    return (
      <View style={styles.wideRoot}>
        {/* Panel gauche — branding */}
        <View style={styles.wideSide}>
          <View style={styles.logoBox}>
            <Ionicons name="calendar" size={48} color={palette.white} />
          </View>
          <Typography variant="display" color={palette.white} style={styles.appName}>
            Afcac-Expo-Meet
          </Typography>
          <Typography variant="h3" color="rgba(255,255,255,0.85)" style={{ fontWeight: '400', marginTop: spacing.sm }}>
            Gérez vos rendez-vous{'\n'}& salles en toute simplicité
          </Typography>
          <View style={styles.featureList}>
            {[
              { icon: 'people-outline', text: 'Rendez-vous bilatéraux' },
              { icon: 'business-outline', text: 'Réservation de salles' },
              { icon: 'qr-code-outline', text: 'Check-in QR code' },
              { icon: 'notifications-outline', text: 'Rappels intelligents' },
            ].map((f) => (
              <View key={f.text} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon as any} size={18} color={semanticColors.primary} />
                </View>
                <Typography variant="body" color="rgba(255,255,255,0.9)">{f.text}</Typography>
              </View>
            ))}
          </View>
        </View>

        {/* Panel droit — formulaire centré */}
        <View style={styles.wideForm}>
          <View style={styles.wideCard}>
            <View style={styles.wideCardInner}>
              <Typography variant="h1" style={{ marginBottom: spacing.xs }}>Connexion</Typography>
              <Typography variant="body" color={palette.textSecondary} style={{ marginBottom: spacing.xl }}>
                Bienvenue ! Connectez-vous à votre compte.
              </Typography>

              <View style={styles.form}>
                <Input
                  label="Adresse email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  icon="mail-outline"
                  placeholder="votre@email.com"
                  error={emailError}
                />
                <Input
                  label="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  isPassword
                  icon="lock-closed-outline"
                  placeholder="••••••••"
                />
                <TouchableOpacity style={styles.forgotPassword}>
                  <Typography variant="caption" color={semanticColors.primary} style={{ fontWeight: '600' }}>
                    Mot de passe oublié ?
                  </Typography>
                </TouchableOpacity>
                <Button label="Se connecter" onPress={handleLogin} loading={isLoading} fullWidth size="lg" />
              </View>

              <View style={styles.ssoSection}>
                <Divider margin={0} />
                <Typography variant="caption" color={palette.textSecondary} align="center" style={styles.orText}>
                  ou continuer avec
                </Typography>
                <View style={styles.ssoButtons}>
                  <TouchableOpacity style={styles.ssoBtn} onPress={() => handleSSO('google')}>
                    <Ionicons name="logo-google" size={20} color="#EA4335" />
                    <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>Google</Typography>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.ssoBtn} onPress={() => handleSSO('apple')}>
                    <Ionicons name="logo-apple" size={20} color={palette.textPrimary} />
                    <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>Apple</Typography>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.registerRow}>
                <Typography variant="body" color={palette.textSecondary}>Pas encore de compte ? </Typography>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Typography variant="bodyMedium" color={semanticColors.primary} style={{ fontWeight: '700' }}>
                    S'inscrire
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Layout mobile (plein écran)
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + Hero */}
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Ionicons name="calendar" size={40} color={palette.white} />
          </View>
          <Typography variant="display" color={palette.white} align="center" style={styles.appName}>
            Afcac-Expo-Meet
          </Typography>
          <Typography variant="body" color="rgba(255,255,255,0.8)" align="center">
            Gérez vos rendez-vous & salles en toute simplicité
          </Typography>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Typography variant="h2" style={styles.formTitle}>
            Connexion
          </Typography>
          <Typography variant="body" color={palette.textSecondary} style={styles.formSubtitle}>
            Bienvenue ! Connectez-vous à votre compte.
          </Typography>

          <View style={styles.form}>
            <Input
              label="Adresse email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              icon="mail-outline"
              placeholder="votre@email.com"
              error={emailError}
            />
            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              isPassword
              icon="lock-closed-outline"
              placeholder="••••••••"
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Typography variant="caption" color={semanticColors.primary} style={{ fontWeight: '600' }}>
                Mot de passe oublié ?
              </Typography>
            </TouchableOpacity>

            <Button
              label="Se connecter"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>

          {/* SSO */}
          <View style={styles.ssoSection}>
            <Divider margin={0} />
            <Typography variant="caption" color={palette.textSecondary} align="center" style={styles.orText}>
              ou continuer avec
            </Typography>

            <View style={styles.ssoButtons}>
              <TouchableOpacity
                style={styles.ssoBtn}
                onPress={() => handleSSO('google')}
                accessibilityLabel="Connexion avec Google"
              >
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                  Google
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ssoBtn}
                onPress={() => handleSSO('apple')}
                accessibilityLabel="Connexion avec Apple"
              >
                <Ionicons name="logo-apple" size={20} color={palette.textPrimary} />
                <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                  Apple
                </Typography>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Typography variant="body" color={palette.textSecondary}>
              Pas encore de compte ?{' '}
            </Typography>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Typography variant="bodyMedium" color={semanticColors.primary} style={{ fontWeight: '700' }}>
                S'inscrire
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ── Mobile ──────────────────────────────────────────
  flex: { flex: 1, backgroundColor: semanticColors.primary },
  container: { flexGrow: 1 },
  hero: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  appName: { letterSpacing: -1 },
  card: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    paddingBottom: 40,
    flex: 1,
    gap: spacing.md,
  },
  formTitle: { marginTop: spacing.sm },
  formSubtitle: {},
  form: { gap: spacing.md },
  forgotPassword: { alignSelf: 'flex-end', marginTop: -spacing.sm },
  ssoSection: { gap: spacing.md },
  orText: { marginVertical: spacing.sm },
  ssoButtons: { flexDirection: 'row', gap: spacing.md },
  ssoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  // ── Web large (≥ 768px) ──────────────────────────────
  wideRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: semanticColors.primary,
  },
  wideSide: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 60,
    gap: spacing.lg,
  },
  featureList: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wideForm: {
    flex: 1,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  wideCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: palette.white,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  wideCardInner: {
    padding: 40,
    gap: spacing.sm,
  },
});
