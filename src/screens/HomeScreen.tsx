import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, fonts, radius } from '../theme';
import type { OutingRecord } from '../types';

type Props = { records: OutingRecord[]; onOpenRecord: (record: OutingRecord) => void };

export function HomeScreen({ records, onOpenRecord }: Props) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader eyebrow="DISCOVER" title="다른 사람의 하루" action="추천" />
      <Text style={styles.intro}>나와 비슷한 속도로 걷는 사람들의 기록을 발견해보세요.</Text>
      {records.map((record) => (
        <View key={record.id} style={styles.card}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{record.author.slice(0, 1)}</Text></View>
            <View><Text style={styles.author}>{record.author}</Text><Text style={styles.handle}>{record.handle}</Text></View>
            <Pressable style={styles.follow}><Text style={styles.followText}>기록 보기</Text></Pressable>
          </View>
          <Pressable onPress={() => onOpenRecord(record)}>
            <Image source={record.images[1]} style={styles.image} />
          </Pressable>
          <View style={styles.copy}>
            <Text style={styles.date}>{record.date} · {record.duration}</Text>
            <Text style={styles.title}>{record.title}</Text>
            <Text style={styles.note}>{record.note}</Text>
            <View style={styles.actions}>
              <Pressable onPress={() => onOpenRecord(record)} style={styles.detail}><Text style={styles.detailText}>자세히 보기</Text></Pressable>
              <Pressable style={styles.save}><Text style={styles.saveText}>＋ 내 코스로 가져오기</Text></Pressable>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
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
  detail: { paddingHorizontal: 13, paddingVertical: 11, borderRadius: 18, borderWidth: 1, borderColor: colors.line },
  detailText: { color: colors.ink, fontSize: 10, fontWeight: '800', fontFamily: fonts.extrabold },
  save: { flex: 1, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center' },
  saveText: { color: colors.white, fontSize: 10, fontWeight: '800', fontFamily: fonts.extrabold },
});
