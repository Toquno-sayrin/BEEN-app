import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { openNaverMap } from '../naverMaps';
import { shareCourse } from '../shareCourse';
import { CourseMap } from '../components/CourseMap';
import { fonts } from '../theme';
import type { OutingRecord } from '../types';

type Props = {
  record: OutingRecord;
  onBack: () => void;
  onOpenMap: () => void;
};

const colors = { paper: '#FFFFFF', white: '#FFFFFF', ink: '#171717', muted: '#61616B', line: '#E5E5EA', primary: '#E2578F', primarySoft: '#FBF2F5', accent: '#E2578F' };
const radius = { small: 8, medium: 12, large: 12 };

export function RecordDetailScreen({ record, onBack, onOpenMap }: Props) {
  const [selectedPlaceId, setSelectedPlaceId] = useState(record.places[0]?.id);
  const isOwnRecord = record.handle === '@been_yerim';
  useEffect(() => setSelectedPlaceId(record.places[0]?.id), [record]);
  const selectedPlace = record.places.find(place => place.id === selectedPlaceId) ?? record.places[0];
  const selectedIndex = record.places.findIndex(place => place.id === selectedPlace?.id);

  return (
    <View style={styles.screen}>
      <View style={styles.topbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="내 기록으로 돌아가기" onPress={onBack} style={styles.roundButton}><Text style={styles.back}>‹</Text></Pressable>
        <View style={styles.topCopy}>
          <Text style={styles.topEyebrow}>{isOwnRecord ? 'MY BEEN' : record.author.toUpperCase()}</Text>
          <Text style={styles.topTitle}>BeENoN · 코스 상세</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapWrap}>
          <CourseMap record={record} selectedPlaceId={selectedPlaceId} onSelectPlace={setSelectedPlaceId} detailTheme />
          <View style={styles.mapSummary}>
            <View><Text style={styles.mapLabel}>TODAY'S COURSE</Text><Text style={styles.mapValue}>{record.places.length}곳의 외출</Text></View>
            <View style={styles.summaryDivider} />
            <View><Text style={styles.mapLabel}>TIME</Text><Text style={styles.mapValue}>{record.duration}</Text></View>
            <View style={styles.summaryDivider} />
            <View><Text style={styles.mapLabel}>DISTANCE</Text><Text style={styles.mapValue}>{record.distance}</Text></View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.selectedPanel}>
            <Text style={styles.sectionEyebrow}>선택한 장소 · {selectedPlace ? selectedIndex + 1 : 0} / {record.places.length}</Text>
            {selectedPlace ? <>
              <Text style={styles.selectedName}>{selectedPlace.name}</Text>
              <Text style={styles.address}>{selectedPlace.address}</Text><Text style={styles.address}>{selectedPlace.category || '미분류'}</Text>
              <Text style={styles.stay}>{selectedPlace.stay} 머묾</Text>
              <Text style={styles.note}>{selectedPlace.memo || '남겨진 메모가 없습니다.'}</Text>
              <Pressable accessibilityRole="button" style={styles.fullMapButton} onPress={() => { void openNaverMap(selectedPlace.name, selectedPlace).catch(() => Alert.alert('지도 열기', '지도를 열지 못했어요. 다시 시도해 주세요.')); }}><Text style={styles.fullMapText}>네이버 지도에서 열기 ↗</Text></Pressable>
              <View style={styles.pagination}>
                <Pressable accessibilityRole="button" disabled={selectedIndex <= 0} onPress={() => setSelectedPlaceId(record.places[selectedIndex - 1].id)} style={[styles.fullMapButton, selectedIndex <= 0 && { opacity: .4 }]}><Text style={styles.fullMapText}>← 이전 장소</Text></Pressable>
                <Pressable accessibilityRole="button" disabled={selectedIndex >= record.places.length - 1} onPress={() => setSelectedPlaceId(record.places[selectedIndex + 1].id)} style={[styles.fullMapButton, selectedIndex >= record.places.length - 1 && { opacity: .4 }]}><Text style={styles.fullMapText}>다음 장소 →</Text></Pressable>
              </View>
            </> : <Text style={styles.note}>아직 등록된 장소가 없습니다.</Text>}
          </View>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionEyebrow}>{record.date} · COURSE</Text>
              <Text style={styles.sectionTitle}>다녀온 장소</Text>
            </View>
            <Pressable onPress={onOpenMap} style={styles.fullMapButton}><Text style={styles.fullMapText}>전체 지도 ↗</Text></Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.placeList}>
            {record.places.map((place, index) => {
              const selected = selectedPlaceId === place.id;
              return (
                <Pressable
                  key={place.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedPlaceId(place.id)}
                  style={[styles.placeCard, selected && styles.placeCardSelected]}
                >
                  {record.images.length > 0 && <Image source={record.images[index % record.images.length]} style={styles.placeImage} />}
                  <View style={styles.placeBody}>
                    <View style={styles.placeTopline}>
                      <View style={[styles.placeNumber, selected && styles.placeNumberSelected]}><Text style={styles.placeNumberText}>{index + 1}</Text></View>
                      <Text style={styles.stay}>{place.stay} 머묾</Text>
                    </View>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.address}>{place.address}</Text>
                    <Text style={styles.placeMemo}>{place.memo}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.courseOrder}>
            {record.places.map((place, index) => (
              <View key={place.id} style={styles.orderItem}>
                <View style={[styles.orderDot, selectedPlaceId === place.id && styles.orderDotSelected]}><Text style={styles.orderNumber}>{index + 1}</Text></View>
                <Text numberOfLines={1} style={styles.orderName}>{place.name}</Text>
                {index < record.places.length - 1 ? <Text style={styles.orderArrow}>→</Text> : null}
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.diaryHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>MEMORY</Text>
              <Text style={styles.diaryTitle}>{record.title}</Text>
            </View>
            <View style={styles.visibility}><Text style={styles.visibilityText}>● {record.visibility}</Text></View>
          </View>
          <Text style={styles.note}>{record.note}</Text>
          <Pressable accessibilityRole="button" style={styles.fullMapButton} onPress={() => { void shareCourse(record).catch(() => Alert.alert('코스 공유', '공유를 완료하지 못했어요.')); }}><Text style={styles.fullMapText}>코스 공유하기 ↗</Text></Pressable>
          <Text style={styles.address}>{record.author} · {record.handle}</Text>

          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoList}>
            {record.images.map((image, index) => <Image key={index} resizeMode="cover" source={image} style={styles.diaryImage} />)}
          </ScrollView>

          <Pressable accessibilityRole="button" onPress={onOpenMap} style={[styles.primaryButton, styles.importButton]}>
            <Text style={styles.primaryButtonText}>내 지도 열기 ↗</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  selectedPanel: { paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 8 },
  selectedName: { fontSize: 24, fontFamily: fonts.medium, color: colors.ink },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginTop: 16 },
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingBottom: 42 },
  topbar: { height: 62, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.paper },
  roundButton: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  back: { color: colors.ink, fontSize: 31, lineHeight: 31, marginTop: -3 },
  more: { color: colors.ink, fontWeight: '500', fontFamily: fonts.medium, letterSpacing: 1 },
  topCopy: { flex: 1, paddingHorizontal: 10, alignItems: 'center' },
  topEyebrow: { color: colors.accent, fontSize: 12, fontWeight: '500', fontFamily: fonts.medium, letterSpacing: 1.2 },
  topTitle: { maxWidth: 270, color: colors.ink, fontSize: 12, fontWeight: '500', fontFamily: fonts.medium, marginTop: 2 },
  mapWrap: { height: 405, marginHorizontal: 12, borderRadius: radius.large, overflow: 'hidden', backgroundColor: colors.primarySoft },
  mapSummary: { position: 'absolute', left: 12, right: 12, bottom: 12, minHeight: 66, paddingHorizontal: 14, borderRadius: 8, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', shadowColor: colors.ink, shadowOpacity: 0.04, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  mapLabel: { color: colors.muted, fontSize: 12, fontWeight: '500', fontFamily: fonts.medium, letterSpacing: 1 },
  mapValue: { color: colors.ink, fontSize: 12, fontWeight: '500', fontFamily: fonts.medium, marginTop: 4 },
  summaryDivider: { width: 1, height: 28, backgroundColor: colors.line },
  body: { paddingHorizontal: 20 },
  sectionHead: { marginTop: 25, marginBottom: 13, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionEyebrow: { color: colors.accent, fontSize: 12, fontWeight: '500', fontFamily: fonts.medium, letterSpacing: 1.1 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '500', fontFamily: fonts.medium, marginTop: 3, letterSpacing: -0.5 },
  fullMapButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.primarySoft },
  fullMapText: { color: colors.primary, fontSize: 12, fontWeight: '500', fontFamily: fonts.medium },
  placeList: { gap: 10, paddingRight: 20 },
  placeCard: { width: 205, borderRadius: radius.medium, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', backgroundColor: colors.white },
  placeCardSelected: { borderColor: colors.accent, backgroundColor: '#FDE3EC' },
  placeImage: { width: '100%', height: 112, backgroundColor: colors.line },
  placeBody: { padding: 12 },
  placeTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  placeNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  placeNumberSelected: { backgroundColor: colors.accent },
  placeNumberText: { color: colors.white, fontSize: 12, fontWeight: '500', fontFamily: fonts.medium },
  stay: { color: colors.muted, fontSize: 12, fontWeight: '700', fontFamily: fonts.bold },
  placeName: { color: colors.ink, fontSize: 18, fontWeight: '500', fontFamily: fonts.medium, marginTop: 9 },
  address: { color: colors.muted, fontSize: 12, marginTop: 3 },
  placeMemo: { minHeight: 32, color: colors.muted, fontSize: 14, lineHeight: 24, marginTop: 8 },
  courseOrder: { marginTop: 15, paddingVertical: 13, paddingHorizontal: 12, borderRadius: radius.small, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center' },
  orderItem: { minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center' },
  orderDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 5 },
  orderDotSelected: { backgroundColor: colors.accent },
  orderNumber: { color: colors.white, fontSize: 12, fontWeight: '500', fontFamily: fonts.medium },
  orderName: { flex: 1, color: colors.ink, fontSize: 12, fontWeight: '500', fontFamily: fonts.medium },
  orderArrow: { color: colors.accent, fontSize: 14, marginHorizontal: 4 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 28 },
  diaryHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  diaryTitle: { maxWidth: 290, color: colors.ink, fontSize: 26, fontWeight: '500', fontFamily: fonts.medium, lineHeight: 38, marginTop: 4 },
  visibility: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12, backgroundColor: colors.primarySoft },
  visibilityText: { color: colors.primary, fontSize: 12, fontWeight: '700', fontFamily: fonts.bold },
  note: { color: colors.muted, fontSize: 14, lineHeight: 24, marginTop: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 },
  photoList: { gap: 9, marginTop: 18, paddingRight: 20 },
  diaryImage: { width: 238, height: 310, borderRadius: radius.medium, backgroundColor: colors.line },
  musicTitle: { color: colors.ink, fontSize: 16, fontWeight: '500', fontFamily: fonts.medium, marginTop: 26, marginBottom: 10 },
  musicRow: { padding: 10, marginBottom: 7, borderRadius: radius.small, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 10 },
  album: { width: 36, height: 36, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  albumText: { color: colors.white, fontSize: 16 },
  song: { color: colors.ink, fontSize: 12, fontWeight: '700', fontFamily: fonts.bold },
  primaryButton: { marginTop: 25, paddingVertical: 15, borderRadius: radius.medium, backgroundColor: colors.primary, alignItems: 'center' },
  importButton: { backgroundColor: colors.accent },
  primaryButtonText: { color: colors.white, fontSize: 13, fontWeight: '500', fontFamily: fonts.medium },
});
