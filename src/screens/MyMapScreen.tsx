import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Brand } from '../components/Brand';
import { CourseMap } from '../components/CourseMap';
import { openNaverMap } from '../naverMaps';
import { colors, fonts } from '../theme';
import type { OutingRecord } from '../types';

type Props = { records: OutingRecord[]; onOpenRecord: (record: OutingRecord) => void; onCreate: () => void };
export function MyMapScreen({ records, onOpenRecord, onCreate }: Props) {
  const [recordId, setRecordId] = useState(records[0]?.id);
  const [placeId, setPlaceId] = useState<string>();
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<'코스' | '글'>('코스');
  const [error, setError] = useState('');
  const record = records.find(item => item.id === recordId) ?? records[0];
  const selected = record?.places.find(place => place.id === placeId) ?? record?.places[0];
  const matches = query.trim() ? records.flatMap(item => item.places
    .filter(place => `${place.name} ${place.address}`.includes(query.trim()))
    .map(place => ({ record: item, place }))) : [];
  const openMap = async (search: string, showSelected = false) => {
    setError('');
    try { await openNaverMap(search, showSelected ? selected : undefined); }
    catch { setError('지도를 열지 못했어요. 잠시 후 다시 시도해 주세요.'); }
  };
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Brand />
    <View style={styles.body}>
      <View style={styles.searchRow}>
        <TextInput accessibilityLabel="장소 검색" placeholder="어떤 장소를 찾고 있나요?" value={query} onChangeText={setQuery} onSubmitEditing={() => void openMap(query)} returnKeyType="search" style={styles.input} />
        <Pressable accessibilityRole="button" disabled={!query.trim()} onPress={() => void openMap(query)} style={[styles.button, !query.trim() && { opacity: .4 }]}><Text style={styles.buttonText}>네이버 검색</Text></Pressable>
      </View>
      {query.trim() !== '' && <View style={styles.panel}>
        <Text style={styles.meta}>내 지도에서 찾은 장소 · {matches.length}</Text>
        {matches.map(({ record: item, place }) => <Pressable accessibilityRole="button" key={`${item.id}:${place.id}`} style={styles.result} onPress={() => { setRecordId(item.id); setPlaceId(place.id); setQuery(''); }}><Text style={styles.title}>{place.name}</Text><Text style={styles.meta}>{place.address}</Text></Pressable>)}
        {!matches.length && <Text style={styles.meta}>내 기록에 없는 장소는 네이버 검색으로 찾아보세요.</Text>}
      </View>}
      {error !== '' && <Text accessibilityRole="alert" style={styles.meta}>{error}</Text>}
      <View style={styles.heading}><Text style={styles.headingText}>나의 지도</Text><Text style={styles.meta}>{records.length}개의 코스</Text></View>
      <View style={styles.map}>{record?.places.length ? <CourseMap key={record.id} record={record} selectedPlaceId={selected?.id} onSelectPlace={setPlaceId} /> : <View style={styles.empty}><Text style={styles.title}>첫 장소를 모아보세요</Text><Text style={styles.meta}>코스에 등록한 장소가 여기에 표시돼요.</Text></View>}</View>
      {record && <Text style={styles.meta}>{record.title}</Text>}
      {!!record?.places.length && <ScrollView horizontal contentContainerStyle={styles.chips} showsHorizontalScrollIndicator={false}>{record.places.map((place, index) => <Pressable accessibilityRole="button" accessibilityState={{ selected: selected?.id === place.id }} key={place.id} onPress={() => setPlaceId(place.id)} style={[styles.chip, selected?.id === place.id && styles.selected]}><Text style={styles.title}>{index + 1} · {place.name}</Text></Pressable>)}</ScrollView>}
      {selected && <View style={styles.panel}><Text style={styles.title}>{selected.name}</Text><Text style={styles.meta}>{selected.address}</Text><Text style={styles.meta}>{selected.category || '미분류'}</Text><Text style={styles.note}>{selected.memo || '아직 메모가 없어요.'}</Text><Pressable accessibilityRole="button" onPress={() => void openMap(selected.name, true)} style={styles.link}><Text style={styles.linkText}>네이버 지도에서 열기 ↗</Text></Pressable></View>}
      <View style={styles.heading}><Text style={styles.headingText}>내가 남긴 기록</Text><Pressable accessibilityRole="button" onPress={onCreate}><Text style={styles.linkText}>＋ 기록하기</Text></Pressable></View>
      <View style={styles.chips}>{(['코스', '글'] as const).map(item => <Pressable accessibilityRole="button" accessibilityState={{ selected: section === item }} key={item} onPress={() => setSection(item)} style={[styles.chip, section === item && styles.selected]}><Text style={styles.title}>내 {item}</Text></Pressable>)}</View>
      {!records.length && <Text style={styles.meta}>아직 기록이 없어요. 첫 코스와 이야기를 남겨보세요.</Text>}
      {records.map(item => <View key={item.id} style={styles.panel}>
        <Text style={styles.meta}>{item.date} · {item.visibility}</Text><Text style={styles.title}>{item.title}</Text>
        <Text style={styles.note}>{section === '글' ? item.note || '아직 작성한 글이 없어요.' : `${item.places.length}곳 · ${item.duration} · ${item.distance}`}</Text>
        <View style={styles.actions}><Pressable accessibilityRole="button" onPress={() => { setRecordId(item.id); setPlaceId(item.places[0]?.id); }} style={styles.link}><Text style={styles.linkText}>지도에 표시</Text></Pressable><Pressable accessibilityRole="button" onPress={() => onOpenRecord(item)} style={styles.link}><Text style={styles.linkText}>상세 보기 ↗</Text></Pressable></View>
      </View>)}
    </View>
  </ScrollView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper }, content: { paddingBottom: 32 }, body: { paddingHorizontal: 20, gap: 12 },
  searchRow: { flexDirection: 'row', gap: 8 }, input: { flex: 1, minWidth: 0, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, color: colors.ink, fontSize: 13 },
  button: { backgroundColor: colors.primary, padding: 12, borderRadius: 12, justifyContent: 'center' }, buttonText: { color: colors.white, fontSize: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }, headingText: { fontSize: 20, color: colors.ink, fontFamily: fonts.bold },
  map: { height: 310, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.primarySoft }, empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  panel: { backgroundColor: colors.white, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.line, gap: 7 }, title: { color: colors.ink, fontSize: 14, fontFamily: fonts.semibold },
  meta: { color: colors.muted, fontSize: 12, lineHeight: 19 }, note: { color: colors.ink, fontSize: 13, lineHeight: 22 }, chips: { flexDirection: 'row', gap: 8 }, chip: { padding: 12, borderRadius: 12, backgroundColor: colors.white }, selected: { backgroundColor: colors.accentSoft },
  link: { minHeight: 44, justifyContent: 'center' }, linkText: { color: colors.primary, fontSize: 13, fontFamily: fonts.semibold }, result: { paddingVertical: 10, gap: 5 }, actions: { flexDirection: 'row', justifyContent: 'space-between' },
});
