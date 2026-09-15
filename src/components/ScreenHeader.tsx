import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

type Props = {
  title: string;
  eyebrow?: string;
  action?: string;
  onAction?: () => void;
};

export function ScreenHeader({ title, eyebrow, action, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action ? (
        <Pressable onPress={onAction} style={styles.actionButton}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 72,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.paper,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800', fontFamily: fonts.extrabold,
    letterSpacing: 1.4,
    marginBottom: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '800', fontFamily: fonts.extrabold,
    letterSpacing: -0.8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  action: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800', fontFamily: fonts.extrabold,
  },
});
