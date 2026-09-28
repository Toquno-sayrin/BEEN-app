import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function Brand() {
  return <View style={styles.header}><Image accessibilityRole="header" accessibilityLabel="BeeNIN" source={require('../../assets/beenin-logo.png')} style={styles.logo} resizeMode="contain" /><Text style={styles.caption}>발견한 장소가 나의 코스가 되다</Text></View>;
}
const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18, gap: 5 },
  logo: { width: 210, height: 40, marginLeft: -8 },
  caption: { color: colors.muted, fontSize: 12 },
});
