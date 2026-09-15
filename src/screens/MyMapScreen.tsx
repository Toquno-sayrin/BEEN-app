import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Brand } from '../components/Brand';
import { PlaceExplorer } from '../components/PlaceExplorer';
import { colors, fonts } from '../theme';
import type { OutingRecord } from '../types';

type Props = { records: OutingRecord[]; onOpenRecord: (record: OutingRecord) => void; onCreate: () => void };
export function MyMapScreen({ records, onOpenRecord, onCreate }: Props) {
  const [recordId, setRecordId] = useState(records[0]?.id);
  const [section, setSection] = useState<'코스' | '글'>('코스');
  const record = records.find(item => item.id === recordId) ?? records[0];
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Brand />
    <View style={styles.body}>
      <PlaceExplorer key={record?.id ?? "empty"} record={record} />
      <View style={styles.heading}><Text style={styles.headingText}>내가 남긴 기록</Text><Pressable accessibilityRole="button" onPress={onCreate}><Text style={styles.linkText}>＋ 기록하기</Text></Pressable></View>
      <View style={styles.chips}>{(['코스', '글'] as const).map(item => <Pressable accessibilityRole="button" accessibilityState={{ selected: section === item }} key={item} onPress={() => setSection(item)} style={[styles.chip, section === item && styles.selected]}><Text style={styles.title}>내 {item}</Text></Pressable>)}</View>
      {!records.length && <Text style={styles.meta}>아직 기록이 없어요. 첫 코스와 이야기를 남겨보세요.</Text>}
      {records.map(item => <View key={item.id} style={styles.panel}>
        <Text style={styles.meta}>{item.date} · {item.visibility}</Text><Text style={styles.title}>{item.title}</Text>
        <Text style={styles.note}>{section === '글' ? item.note || '아직 작성한 글이 없어요.' : `${item.places.length}곳 · ${item.duration} · ${item.distance}`}</Text>
        <View style={styles.actions}><Pressable accessibilityRole="button" disabled={recordId === item.id} onPress={() => setRecordId(item.id)} style={[styles.link, recordId === item.id && { opacity: .4 }]}><Text style={styles.linkText}>{recordId === item.id ? '위 지도에 표시 중' : '이 코스를 지도에서 보기'}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => onOpenRecord(item)} style={styles.link}><Text style={styles.linkText}>상세 보기 ↗</Text></Pressable></View>
      </View>)}
    </View>
  </ScrollView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper }, content: { paddingBottom: 32 }, body: { paddingHorizontal: 20, gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }, headingText: { fontSize: 20, color: colors.ink, fontFamily: fonts.bold },
  panel: { backgroundColor: colors.white, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.line, gap: 7 }, title: { color: colors.ink, fontSize: 14, fontFamily: fonts.semibold },
  meta: { color: colors.muted, fontSize: 12, lineHeight: 19 }, note: { color: colors.ink, fontSize: 13, lineHeight: 22 }, chips: { flexDirection: 'row', gap: 8 }, chip: { padding: 12, borderRadius: 12, backgroundColor: colors.white }, selected: { backgroundColor: colors.accentSoft },
  link: { minHeight: 44, justifyContent: 'center' }, linkText: { color: colors.primary, fontSize: 13, fontFamily: fonts.semibold }, actions: { flexDirection: 'row', justifyContent: 'space-between' },
});
