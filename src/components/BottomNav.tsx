import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassSurface } from './GlassSurface';
import { colors } from '../theme';
import type { TabKey } from '../types';

const items: { key: TabKey; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: 'explore', icon: 'search-outline', label: '탐색' },
  { key: 'create', icon: 'add-outline', label: '추가' },
  { key: 'home', icon: 'ellipsis-horizontal-outline', label: '더보기' },
  { key: 'settings', icon: 'settings-outline', label: '설정' },
];
type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

export function BottomNav({ active, onChange }: Props) {
  return (
    <View style={styles.dock}>
      <GlassSurface testID="layout-nav" fill level={3} radius={30} style={styles.pill} contentStyle={styles.pillContent}>
        {items.map((item) => {
          const selected = active === item.key;
          return (
            <Pressable
              testID={`layout-nav-${item.key}`}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected }}
              key={item.key}
              onPress={() => onChange(item.key)}
              style={styles.item}
            >
              <View style={[styles.iconBox, selected && styles.iconBoxActive]}>
                {item.key === 'profile' ? (
                  <View style={[styles.avatar, selected && styles.avatarActive]}>
                    <Text style={styles.avatarText}>Y</Text>
                    <View style={styles.avatarBadge}><Ionicons name="add" size={9} color={colors.white} /></View>
                  </View>
                ) : (
                  <Ionicons name={item.icon} size={22} color={selected ? colors.blue : colors.muted} />
                )}
              </View>
              <Text style={{fontSize:10,color:selected?colors.blue:colors.muted}}>{item.label}</Text>
            </Pressable>
          );
        })}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 6,
    alignItems: 'center',
  },
  pill: {
    width: '100%',
    maxWidth: 360,
    height: 72,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: 'rgba(220,238,255,0.65)',
    shadowColor: colors.ink,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  avatarActive: {
    borderColor: colors.blue,
  },
  avatarText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  avatarBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
