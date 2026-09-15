import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CourseMap } from '../components/CourseMap';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, fonts, radius } from '../theme';
import type { OutingRecord } from '../types';

type Props = {
  record: OutingRecord;
  onOpenRecord: () => void;
};

export function MapScreen({ record, onOpenRecord }: Props) {
  const [selectedPlaceId, setSelectedPlaceId] = useState(record.places[0]?.id);
  const selectedPlace = record.places.find((place) => place.id === selectedPlaceId) ?? record.places[0];

  return (
    <View style={styles.screen}>
      <ScreenHeader eyebrow="MY BEEN MAP" title="나만의 지도" action="목록 보기" />
      <View style={styles.tabs}>
        <View style={styles.activeTab}><Text style={styles.activeText}>다녀온 기록</Text></View>
        <View style={styles.tab}><Text style={styles.tabText}>저장한 코스</Text></View>
      </View>

      <View style={styles.map}>
        <CourseMap record={record} selectedPlaceId={selectedPlaceId} onSelectPlace={setSelectedPlaceId} />
      </View>

      <View style={styles.placeStrip}>
        {record.places.map((place, index) => (
          <Pressable key={place.id} onPress={() => setSelectedPlaceId(place.id)} style={[styles.placeChip, selectedPlaceId === place.id && styles.placeChipActive]}>
            <Text style={[styles.placeChipNumber, selectedPlaceId === place.id && styles.placeChipTextActive]}>{index + 1}</Text>
            <Text numberOfLines={1} style={[styles.placeChipName, selectedPlaceId === place.id && styles.placeChipTextActive]}>{place.name}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onOpenRecord} style={styles.recordCard}>
        <Image source={record.images[1]} style={styles.cardImage} />
        <View style={styles.cardCopy}>
          <Text style={styles.cardDate}>{record.date} · PLACE {record.places.indexOf(selectedPlace) + 1}</Text>
          <Text numberOfLines={1} style={styles.cardTitle}>{selectedPlace?.name}</Text>
          <Text numberOfLines={1} style={styles.cardMeta}>{selectedPlace?.stay} · {selectedPlace?.memo}</Text>
        </View>
        <Text style={styles.cardArrow}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  tabs: { marginHorizontal: 20, marginBottom: 12, padding: 4, borderRadius: 18, backgroundColor: colors.primarySoft, flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 15 },
  activeTab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 15, backgroundColor: colors.white },
  tabText: { color: colors.muted, fontSize: 11, fontWeight: '700', fontFamily: fonts.bold },
  activeText: { color: colors.primary, fontSize: 11, fontWeight: '800', fontFamily: fonts.extrabold },
  map: { flex: 1, marginHorizontal: 12, borderRadius: radius.large, overflow: 'hidden', backgroundColor: colors.primarySoft },
  placeStrip: { paddingHorizontal: 12, paddingTop: 10, flexDirection: 'row', gap: 6 },
  placeChip: { minWidth: 0, flex: 1, padding: 7, borderRadius: 14, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 5 },
  placeChipActive: { backgroundColor: colors.accent },
  placeChipNumber: { color: colors.accent, fontSize: 9, fontWeight: '900', fontFamily: fonts.black },
  placeChipName: { minWidth: 0, flex: 1, color: colors.ink, fontSize: 9, fontWeight: '800', fontFamily: fonts.extrabold },
  placeChipTextActive: { color: colors.white },
  recordCard: { margin: 12, padding: 10, borderRadius: radius.medium, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 7, elevation: 2 },
  cardImage: { width: 62, height: 72, borderRadius: 11 },
  cardCopy: { flex: 1, paddingHorizontal: 11 },
  cardDate: { color: colors.accent, fontSize: 9, fontWeight: '800', fontFamily: fonts.extrabold },
  cardTitle: { color: colors.ink, fontSize: 13, fontWeight: '800', fontFamily: fonts.extrabold, marginTop: 4 },
  cardMeta: { color: colors.muted, fontSize: 10, marginTop: 5 },
  cardArrow: { color: colors.primary, fontSize: 27, marginRight: 4 },
});
