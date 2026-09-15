import { StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, fonts } from '../theme';

export function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader eyebrow="BEEN" title="설정" />
      {['프로필 편집', '기본 공개 범위', '위치정보 사용', '알림', '로그아웃'].map((item) => (
        <View key={item} accessibilityState={{ disabled: true }} style={styles.row}><Text style={styles.label}>{item}</Text><Text style={styles.soon}>준비 중</Text></View>
      ))}
      <Text style={styles.caption}>설정 기능은 핵심 기록 흐름 검증 이후 연결합니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  row: { marginHorizontal: 20, minHeight: 58, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700', fontFamily: fonts.bold },
  soon: { color: colors.muted, fontSize: 11 },
  caption: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 24 },
});
