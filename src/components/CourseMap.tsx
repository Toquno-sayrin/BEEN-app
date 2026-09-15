import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, gradients } from '../theme';
import type { OutingRecord } from '../types';

type Props = {
  detailTheme?: boolean;
  record: OutingRecord;
  selectedPlaceId?: string;
  onSelectPlace?: (placeId: string) => void;
};

const markerPositions = [
  { top: '67%' as const, left: '18%' as const },
  { top: '42%' as const, left: '48%' as const },
  { top: '19%' as const, left: '75%' as const },
];

export function CourseMap({ record, selectedPlaceId, onSelectPlace }: Props) {
  return (
    <View style={styles.map}>
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.swirl, { left: -30, top: -20, transform: [{ rotate: '12deg' }] }]} />
      <View style={[styles.swirl, { right: -40, bottom: 0, transform: [{ rotate: '-18deg' }] }]} />
      <View style={[styles.route, { top: '31%', left: '56%', transform: [{ rotate: '-45deg' }] }]} />
      <View style={[styles.route, { top: '52%', left: '29%', transform: [{ rotate: '-40deg' }] }]} />

      {record.places.map((place, index) => {
        const position = markerPositions[index] ?? markerPositions[markerPositions.length - 1];
        const selected = selectedPlaceId === place.id;
        return (
          <Pressable
            key={place.id}
            onPress={() => onSelectPlace?.(place.id)}
            style={[styles.markerWrap, position]}
          >
            <View style={[styles.marker, selected && styles.markerSelected]}>
              <Text style={[styles.markerText, selected && styles.markerTextSelected]}>{index + 1}</Text>
            </View>
            <Text numberOfLines={1} style={styles.markerLabel}>{place.name}</Text>
          </Pressable>
        );
      })}

      <View style={styles.webPill}><Text style={styles.webPillText}>모바일에서 실제 Google 지도 표시</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, width: '100%', height: '100%', overflow: 'hidden' },
  swirl: { position: 'absolute', width: 240, height: 200, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.25)' },
  route: { position: 'absolute', width: 5, height: 135, borderRadius: 4, backgroundColor: colors.accent },
  markerWrap: { position: 'absolute', width: 104, alignItems: 'center', marginLeft: -40, marginTop: -18 },
  marker: { width: 34, height: 34, borderRadius: 17, borderWidth: 3, borderColor: colors.white, backgroundColor: 'rgba(255,255,255,0.32)', alignItems: 'center', justifyContent: 'center' },
  markerSelected: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent },
  markerText: { color: colors.white, fontSize: 12, fontWeight: '900', fontFamily: fonts.black },
  markerTextSelected: { fontSize: 14 },
  markerLabel: { maxWidth: 104, marginTop: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.9)', color: colors.ink, fontSize: 9, fontWeight: '800', fontFamily: fonts.extrabold },
  webPill: { position: 'absolute', left: 12, bottom: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(34,31,46,0.75)' },
  webPillText: { color: colors.white, fontSize: 8, fontWeight: '700', fontFamily: fonts.bold },
});
