import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export function Brand() {
  return <View style={styles.header}><Text accessibilityRole="header" style={styles.logo}>BeeNIN</Text><Text style={styles.caption}>발견한 장소가 나의 코스가 되다</Text></View>;
}
const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18, gap: 5 },
  logo: { color: colors.brand, fontSize: 30, fontFamily: fonts.black, letterSpacing: -1 },
  caption: { color: colors.muted, fontSize: 12 },
});
