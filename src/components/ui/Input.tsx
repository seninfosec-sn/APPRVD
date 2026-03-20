import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { palette, semanticColors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { fontSize } from '../../constants/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  hint,
  icon,
  rightIcon,
  onRightIconPress,
  isPassword,
  style,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? semanticColors.danger
    : focused
    ? semanticColors.primary
    : palette.border;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Typography variant="caption" color={palette.textSecondary} style={styles.label}>
          {label}
        </Typography>
      )}
      <View style={[styles.container, { borderColor }]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? semanticColors.primary : palette.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[styles.input, { paddingLeft: icon ? 0 : spacing.md }, style]}
          placeholderTextColor={palette.textSecondary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
            accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={palette.textSecondary}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons name={rightIcon} size={20} color={palette.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Typography variant="caption" color={semanticColors.danger} style={styles.message}>
          {error}
        </Typography>
      ) : hint ? (
        <Typography variant="caption" color={palette.textSecondary} style={styles.message}>
          {hint}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { marginBottom: 2 },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    height: 52,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    color: palette.textPrimary,
    paddingVertical: 0,
  },
  leftIcon: {},
  rightIcon: { padding: spacing.xs },
  message: { marginTop: 2 },
});
