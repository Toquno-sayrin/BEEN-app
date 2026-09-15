import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import type { TabKey } from '../types';

const items: { key: TabKey; icon: string; label: string }[] = [
  { key: 'map', icon: '⌖', label: '내 지도' },
  { key: 'home', icon: '⌂', label: '발견' },
  { key: 'create', icon: '+', label: '기록' },
  { key: 'profile', icon: '▦', label: '내 피드' },
  { key: 'settings', icon: '◦', label: '설정' },
];

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

export function BottomNav({ active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const selected = active === item.key;
        const isCreate = item.key === 'create';
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.label}
            key={item.key}
            onPress={() => onChange(item.key)}
            style={styles.item}
          >
            <View style={[styles.iconBox, isCreate && styles.createBox]}>
              <Text style={[styles.icon, selected && styles.active, isCreate && styles.createIcon]}>
                {item.icon}
              </Text>
            </View>
            {!isCreate && (
              <Text style={[styles.label, selected && styles.active]}>{item.label}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 76,
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  item: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconBox: {
    width: 36,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBox: {
    width: 52,
    height: 52,
    marginTop: -18,
    borderRadius: 26,
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  icon: {
    color: colors.muted,
    fontSize: 25,
    lineHeight: 27,
  },
  createIcon: {
    color: colors.white,
    fontSize: 31,
    fontWeight: '300', fontFamily: fonts.light,
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600', fontFamily: fonts.semibold,
  },
  active: {
    color: colors.primary,
    fontWeight: '800', fontFamily: fonts.extrabold,
  },
});
