import React from 'react';
import { View, ViewStyle } from 'react-native';
import { palette } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

interface DividerProps {
  margin?: number;
  color?: string;
  style?: ViewStyle;
}

export function Divider({ margin = spacing.md, color = palette.border, style }: DividerProps) {
  return (
    <View
      style={[
        { height: 1, backgroundColor: color, marginVertical: margin },
        style,
      ]}
    />
  );
}
