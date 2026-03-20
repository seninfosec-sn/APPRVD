import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { palette } from '../../constants/colors';
import { spacing, radius, shadow } from '../../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  elevation?: 'none' | 'sm' | 'md';
}

export function Card({
  children,
  onPress,
  style,
  padding = spacing.md,
  elevation = 'sm',
}: CardProps) {
  const containerStyle = [
    styles.card,
    elevation !== 'none' ? shadow[elevation] : {},
    { padding },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={containerStyle}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});
