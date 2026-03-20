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
import { palette, semanticColors } from '../../src/constants/colors';
import { spacing, radius } from '../../src/constants/spacing';
import { useAuthStore } from '../../src/store/authStore';
import { useUIStore } from '../../src/store/uiStore';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useAuthStore();
  const { showSnackbar } = useUIStore();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 768;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nom requis';
    if (!email.includes('@')) e.email = 'Email invalide';
    if (password.length < 8) e.password = 'Minimum 8 caractères';
    if (password !== confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await login(email, password);
      showSnackbar('Compte créé avec succès ! Bienvenue.', 'success');
      router.replace('/(tabs)/calendrier');
    } catch {
      showSnackbar('Erreur lors de la création du compte.', 'error');
    }
  };

  const formContent = (
    <>
      <View style={styles.form}>
        <Input label="Nom complet" value={name} onChangeText={setName} autoCapitalize="words" icon="person-outline" placeholder="Jean Dupont" error={errors.name} />
        <Input label="Adresse email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" icon="mail-outline" placeholder="votre@email.com" error={errors.email} />
        <Input label="Mot de passe" value={password} onChangeText={setPassword} isPassword icon="lock-closed-outline" placeholder="Minimum 8 caractères" error={errors.password} />
        <Input label="Confirmer le mot de passe" value={confirmPassword} onChangeText={setConfirmPassword} isPassword icon="lock-closed-outline" placeholder="Répéter le mot de passe" error={errors.confirmPassword} />
      </View>
      <Typography variant="caption" color={palette.textSecondary} style={styles.terms}>
        En créant un compte, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
      </Typography>
      <Button label="Créer mon compte" onPress={handleRegister} loading={isLoading} fullWidth size="lg" />
      <View style={styles.loginRow}>
        <Typography variant="body" color={palette.textSecondary}>Déjà un compte ? </Typography>
        <TouchableOpacity onPress={() => router.back()}>
          <Typography variant="bodyMedium" color={semanticColors.primary} style={{ fontWeight: '700' }}>Se connecter</Typography>
        </TouchableOpacity>
      </View>
    </>
  );

  if (isWide) {
    return (
      <View style={styles.wideRoot}>
        <View style={styles.wideSide}>
          <View style={styles.logoBox}>
            <Ionicons name="calendar" size={48} color={palette.white} />
          </View>
          <Typography variant="display" color={palette.white} style={{ letterSpacing: -1 }}>Afcac-Expo-Meet</Typography>
          <Typography variant="h3" color="rgba(255,255,255,0.85)" style={{ fontWeight: '400', marginTop: spacing.sm }}>
            Créer votre compte
          </Typography>
        </View>
        <View style={styles.wideForm}>
          <View style={styles.wideCard}>
            <View style={styles.wideCardInner}>
              <Typography variant="h1" style={{ marginBottom: spacing.xl }}>Inscription</Typography>
              {formContent}
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={palette.white} />
          </TouchableOpacity>
          <View style={styles.heroText}>
            <Typography variant="display" color={palette.white} style={{ letterSpacing: -1 }}>
              Afcac-Expo-Meet
            </Typography>
            <Typography variant="h3" color="rgba(255,255,255,0.9)">
              Créer un compte
            </Typography>
          </View>
        </View>

        {/* Form */}
        <View style={styles.card}>
          {formContent}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: semanticColors.primary },
  container: { flexGrow: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroText: { gap: spacing.xs },
  card: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    paddingBottom: 40,
    flex: 1,
    gap: spacing.lg,
  },
  form: { gap: spacing.md },
  terms: { textAlign: 'center', lineHeight: 18 },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
