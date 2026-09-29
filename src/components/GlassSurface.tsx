import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { glass } from '../theme';

type Props = {
  testID?: string;
  level?: 1 | 2 | 3;
  /** Corner radius shared by the shadow host and the clipped blur layer. */
  radius?: number;
  /** Positioning/sizing for the outer, shadow-casting box (position, width, margin, maxWidth…). */
  style?: StyleProp<ViewStyle>;
  /** Padding/gap/layout for the content itself, applied inside the clipped blur box. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Fill a host with an explicitly assigned height, such as the navigation dock. */
  fill?: boolean;
  children: ReactNode;
};

export function GlassSurface({ testID, level = 2, radius = 16, style, contentStyle, fill = false, children }: Props) {
  const g = glass[level];
  return (
    <View testID={testID} style={[g.shadow, { borderRadius: radius }, style]}>
      <View style={[styles.clip, fill && StyleSheet.absoluteFill, { borderRadius: radius }]}>
        <BlurView intensity={g.blurIntensity} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.tintLayer, { backgroundColor: g.tint, borderColor: g.border }]} />
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  tintLayer: { borderWidth: 1 },
  content: { flex: 1 },
});
