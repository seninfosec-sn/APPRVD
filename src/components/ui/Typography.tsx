import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { palette } from '../../constants/colors';
import { textVariants } from '../../constants/typography';

type Variant = keyof typeof textVariants;

interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Typography({
  variant = 'body',
  color = palette.textPrimary,
  align = 'left',
  style,
  children,
  ...rest
}: TypographyProps) {
  return (
    <Text
      style={[
        textVariants[variant],
        { color, textAlign: align },
        style,
      ]}
      allowFontScaling
      {...rest}
    >
      {children}
    </Text>
  );
}
