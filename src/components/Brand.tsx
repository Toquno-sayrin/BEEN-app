import { Image, StyleSheet, View } from 'react-native';

export function Brand() {
  return <View style={styles.header}><Image accessibilityRole="header" accessibilityLabel="BeeNIN" source={require('../../assets/beenin-logo.png')} style={styles.logo} resizeMode="contain" /></View>;
}
const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, alignItems: 'center' },
  logo: { width: 141, height: 32 },
});
