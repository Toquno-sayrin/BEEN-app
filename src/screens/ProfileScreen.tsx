import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, fonts, radius } from '../theme';
import type { OutingRecord } from '../types';

type Props = {
  records: OutingRecord[];
  onOpenRecord: (record: OutingRecord) => void;
  onOpenMap: () => void;
};

export function ProfileScreen({ records, onOpenRecord, onOpenMap }: Props) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader eyebrow="BEEN" title="나의 외출 기록" action="이번 달" />

      <View style={styles.profile}>
        <View style={styles.avatar}><Text style={styles.avatarText}>Y</Text></View>
        <View style={styles.profileCopy}>
          <Text style={styles.name}>예림</Text>
          <Text style={styles.handle}>@been_yerim</Text>
          <Text style={styles.bio}>걷다가 마음에 남은 장면을 기록해요.</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat value={`${records.length}`} label="올린 코스" />
        <Stat value="12" label="본 사람" />
        <Stat value="4" label="저장한 사람" />
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>기억 모음</Text>
        <Text style={styles.sectionHint}>분위기로 다시 보기</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlights}>
        {['저녁 산책', '노을', '공원', '음악'].map((label, index) => (
          <View key={label} style={styles.highlightItem}>
            <View style={[styles.highlightCircle, index === 0 && styles.highlightActive]}>
              <Text style={styles.highlightEmoji}>{['🌿', '🌇', '🪴', '♫'][index]}</Text>
            </View>
            <Text style={styles.highlightLabel}>{label}</Text>
          </View>
        ))}
      </ScrollView>

      <Pressable onPress={onOpenMap} style={styles.mapSummary}>
        <View>
          <Text style={styles.mapEyebrow}>MY BEEN MAP</Text>
          <Text style={styles.mapTitle}>이번 달, 한 곳의 기억을 남겼어요</Text>
          <Text style={styles.mapCaption}>사진과 장소를 지도에서 다시 보기</Text>
        </View>
        <View style={styles.mapArrow}><Text style={styles.mapArrowText}>→</Text></View>
      </Pressable>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>최근 기록</Text>
        <Text style={styles.sectionHint}>{records.length}개의 하루</Text>
      </View>
      <View style={styles.grid}>
        {records.map((record) => (
          <Pressable key={record.id} onPress={() => onOpenRecord(record)} style={styles.gridItem}>
            <Image source={record.images[0]} style={styles.gridImage} />
            <View style={styles.gridOverlay}>
              <Text numberOfLines={2} style={styles.gridTitle}>{record.title}</Text>
              <Text style={styles.gridDate}>{record.date}</Text>
            </View>
          </Pressable>
        ))}
        <Pressable style={styles.emptyTile}>
          <Text style={styles.emptyPlus}>＋</Text>
          <Text style={styles.emptyText}>다음 외출</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingBottom: 24 },
  profile: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '800', fontFamily: fonts.extrabold, fontSize: 24 },
  profileCopy: { flex: 1 },
  name: { color: colors.ink, fontWeight: '800', fontFamily: fonts.extrabold, fontSize: 18 },
  handle: { color: colors.muted, fontSize: 12, marginTop: 1 },
  bio: { color: colors.ink, fontSize: 12, marginTop: 7 },
  stats: { marginHorizontal: 20, marginTop: 20, paddingVertical: 15, flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.ink, fontWeight: '800', fontFamily: fonts.extrabold, fontSize: 18 },
  statLabel: { color: colors.muted, fontSize: 10, marginTop: 3 },
  sectionHeading: { marginTop: 24, marginBottom: 12, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { color: colors.ink, fontWeight: '800', fontFamily: fonts.extrabold, fontSize: 17 },
  sectionHint: { color: colors.muted, fontSize: 11 },
  highlights: { paddingHorizontal: 20, gap: 15 },
  highlightItem: { alignItems: 'center', gap: 7 },
  highlightCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.paper },
  highlightActive: { borderColor: colors.accent },
  highlightEmoji: { fontSize: 22 },
  highlightLabel: { color: colors.muted, fontSize: 10 },
  mapSummary: { marginHorizontal: 20, marginTop: 24, padding: 18, borderRadius: radius.medium, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mapEyebrow: { color: colors.primarySoft, fontSize: 10, fontWeight: '800', fontFamily: fonts.extrabold, letterSpacing: 1.2 },
  mapTitle: { color: colors.white, fontWeight: '800', fontFamily: fonts.extrabold, fontSize: 15, marginTop: 5 },
  mapCaption: { color: colors.primarySoft, fontSize: 11, marginTop: 4 },
  mapArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  mapArrowText: { color: colors.white, fontSize: 20 },
  grid: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: { width: '48.8%', aspectRatio: 0.8, borderRadius: radius.small, overflow: 'hidden', backgroundColor: colors.line },
  gridImage: { width: '100%', height: '100%' },
  gridOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 11, paddingTop: 30, backgroundColor: 'rgba(30,20,50,0.5)' },
  gridTitle: { color: colors.white, fontWeight: '800', fontFamily: fonts.extrabold, fontSize: 12 },
  gridDate: { color: '#F0ECFB', fontSize: 9, marginTop: 4 },
  emptyTile: { width: '48.8%', aspectRatio: 0.8, borderRadius: radius.small, borderWidth: 1, borderStyle: 'dashed', borderColor: '#D8CFEE', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F4FD' },
  emptyPlus: { color: colors.primary, fontSize: 25 },
  emptyText: { color: colors.muted, fontSize: 11, marginTop: 4 },
});
