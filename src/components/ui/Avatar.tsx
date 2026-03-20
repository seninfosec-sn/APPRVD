import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Typography } from './Typography';
import { palette, semanticColors } from '../../constants/colors';
import { radius } from '../../constants/spacing';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  borderColor?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function stringToColor(str: string): string {
  const colors = [
    '#145847', '#b3ae41', '#f0a500', '#4a90d9', '#9b59b6',
    '#e67e22', '#1abc9c', '#e74c3c', '#2980b9', '#27ae60',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ uri, name = '', size = 40, borderColor }: AvatarProps) {
  const initials = getInitials(name || '?');
  const bg = stringToColor(name || 'x');
  const fontSize = Math.max(10, size * 0.35);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth: borderColor ? 2 : 0,
          borderColor,
        },
      ]}
      accessibilityLabel={name}
    >
      {uri ? (
        <Image source={{ uri }} style={[styles.image, { borderRadius: size / 2 }]} />
      ) : (
        <Typography style={{ fontSize, fontWeight: '700', color: palette.white }}>
          {initials}
        </Typography>
      )}
    </View>
  );
}

export function AvatarGroup({ users, size = 32, max = 3 }: { users: Array<{ displayName: string; avatarUrl?: string }>; size?: number; max?: number }) {
  const visible = users.slice(0, max);
  const extra = users.length - max;

  return (
    <View style={styles.group}>
      {visible.map((u, i) => (
        <View key={i} style={[styles.groupItem, { marginLeft: i === 0 ? 0 : -(size * 0.3) }]}>
          <Avatar uri={u.avatarUrl} name={u.displayName} size={size} borderColor={palette.white} />
        </View>
      ))}
      {extra > 0 && (
        <View
          style={[
            styles.groupItem,
            styles.extraBadge,
            { marginLeft: -(size * 0.3), width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Typography style={{ fontSize: size * 0.3, fontWeight: '700', color: palette.white }}>
            +{extra}
          </Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupItem: {
    zIndex: 1,
  },
  extraBadge: {
    backgroundColor: palette.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.white,
  },
});
