import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Brand } from '../components/Brand';
import { courseThemes, filterRecords, type SearchMode } from '../recordSearch';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, fonts, radius } from '../theme';
import type { OutingRecord } from '../types';

type Props = { records: OutingRecord[]; onOpenRecord: (record: OutingRecord) => void };

export function HomeScreen({ records, onOpenRecord }: Props) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('코스');
  const [theme, setTheme] = useState('');
  const visible = filterRecords(records.filter(record => record.visibility === '전체 공개'), query, mode, theme);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Brand />
      <ScreenHeader eyebrow="DISCOVER" title="새로운 코스 발견" />
      <View style={styles.filters}>
        <View style={styles.filterRow}>{(['코스', '지역', '테마'] as const).map(item => <Pressable accessibilityRole="button" accessibilityState={{ selected: mode === item }} key={item} onPress={() => setMode(item)} style={[styles.filter, mode === item && styles.filterSelected]}><Text>{item} 검색</Text></Pressable>)}</View>
        <TextInput accessibilityLabel={`${mode} 검색`} placeholder={mode === '지역' ? '지역이나 주소를 검색하세요' : mode === '테마' ? '라이딩, 러닝, 카페공부, 데이트' : '코스 이름이나 장소를 검색하세요'} value={query} onChangeText={setQuery} style={styles.search} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>{['', ...courseThemes].map(item => <Pressable accessibilityRole="button" accessibilityState={{ selected: theme === item }} key={item} onPress={() => setTheme(item)} style={[styles.filter, theme === item && styles.filterSelected]}><Text>{item || '전체'}</Text></Pressable>)}</ScrollView>
        <Text style={styles.note}>샘플 피드 · {visible.length}개의 코스</Text>
        {!visible.length && <Text style={styles.note}>검색 결과가 없어요. 검색어나 테마를 바꿔보세요.</Text>}
      </View>
      <Text style={styles.intro}>나와 비슷한 속도로 걷는 사람들의 기록을 발견해보세요.</Text>
      {visible.map((record) => (
        <View key={record.id} style={styles.card}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{record.author.slice(0, 1)}</Text></View>
            <View><Text style={styles.author}>{record.author}</Text><Text style={styles.handle}>{record.handle}</Text></View>
            <Pressable onPress={() => onOpenRecord(record)} style={styles.follow}><Text style={styles.followText}>기록 보기</Text></Pressable>
          </View>
          <Pressable onPress={() => onOpenRecord(record)}>
            {record.images.length > 0 && <Image source={record.images[1] ?? record.images[0]} style={styles.image} />}
          </Pressable>
          <View style={styles.copy}>
            <Text style={styles.date}>{record.date} · {record.duration}</Text>
            <Text style={styles.title}>{record.title}</Text>
            <Text style={styles.note}>{record.note}</Text>
            <View style={styles.actions}>
              <Pressable onPress={() => onOpenRecord(record)} style={styles.save}><Text style={styles.saveText}>코스와 장소 살펴보기 ↗</Text></Pressable>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filters: { paddingHorizontal: 20, gap: 12, marginBottom: 18 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filter: { paddingHorizontal: 12, paddingVertical: 12, backgroundColor: colors.white, borderRadius: 12 },
  filterSelected: { backgroundColor: colors.accentSoft },
  search: { padding: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: 12, fontSize: 13, color: colors.ink },
  screen: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingBottom: 30 },
  intro: { color: colors.muted, fontSize: 12, lineHeight: 19, paddingHorizontal: 20, marginBottom: 18 },
  card: { marginHorizontal: 16, marginBottom: 18, borderRadius: radius.large, overflow: 'hidden', backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  authorRow: { padding: 14, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: colors.white, fontSize: 13, fontWeight: '800', fontFamily: fonts.extrabold },
  author: { color: colors.ink, fontSize: 12, fontWeight: '800', fontFamily: fonts.extrabold },
  handle: { color: colors.muted, fontSize: 9, marginTop: 2 },
  follow: { marginLeft: 'auto', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 15, backgroundColor: colors.primarySoft },
  followText: { color: colors.primary, fontSize: 9, fontWeight: '800', fontFamily: fonts.extrabold },
  image: { width: '100%', height: 420, backgroundColor: colors.line },
  copy: { padding: 17 },
  date: { color: colors.accent, fontSize: 9, fontWeight: '800', fontFamily: fonts.extrabold },
  title: { color: colors.ink, fontSize: 18, fontWeight: '800', fontFamily: fonts.extrabold, marginTop: 7 },
  note: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 15 },
  save: { flex: 1, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center' },
  saveText: { color: colors.white, fontSize: 10, fontWeight: '800', fontFamily: fonts.extrabold },
});
