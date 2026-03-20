import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Typography } from './Typography';
import { palette, semanticColors } from '../../constants/colors';
import { spacing, radius, touchTarget } from '../../constants/spacing';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: semanticColors.primary, text: palette.white },
  secondary: { bg: semanticColors.primaryLight, text: semanticColors.primary },
  ghost: { bg: 'transparent', text: semanticColors.primary },
  danger: { bg: semanticColors.danger, text: palette.white },
  outline: { bg: 'transparent', text: semanticColors.primary, border: semanticColors.primary },
};

const sizeStyles: Record<Size, { height: number; px: number; fontSize: number }> = {
  sm: { height: 36, px: spacing.md, fontSize: 13 },
  md: { height: 48, px: spacing.lg, fontSize: 15 },
  lg: { height: 56, px: spacing.xl, fontSize: 17 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}: ButtonProps) {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.base,
        {
          backgroundColor: vs.bg,
          height: ss.height,
          paddingHorizontal: ss.px,
          borderRadius: radius.lg,
          borderWidth: vs.border ? 1.5 : 0,
          borderColor: vs.border,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Typography
            variant="bodyMedium"
            color={vs.text}
            style={{ fontSize: ss.fontSize, fontWeight: '600' }}
          >
            {label}
          </Typography>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: touchTarget,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
});
