import MapView, { Marker, Polyline } from 'react-native-maps';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import type { OutingRecord } from '../types';

type Props = {
  detailTheme?: boolean;
  record: OutingRecord;
  selectedPlaceId?: string;
  onSelectPlace?: (placeId: string) => void;
};

export function CourseMap({ record, selectedPlaceId, onSelectPlace, detailTheme = false }: Props) {
  const first = record.places[0];

  return (
    <MapView
      initialRegion={{
        latitude: first?.latitude ?? 37.545,
        longitude: first?.longitude ?? 127.04,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }}
      style={styles.map}
    >
      <Polyline
        coordinates={record.places.map(({ latitude, longitude }) => ({ latitude, longitude }))}
        strokeColor={detailTheme ? '#C72566' : colors.accent}
        strokeWidth={5}
      />
      {record.places.map((place, index) => {
        const selected = selectedPlaceId === place.id;
        return (
          <Marker
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            key={place.id}
            onPress={() => onSelectPlace?.(place.id)}
            title={place.name}
            description={place.memo}
          >
            <View style={[styles.marker, selected && styles.markerSelected, detailTheme && { width: 44, height: 44, borderRadius: 22, backgroundColor: selected ? '#C72566' : '#FFFFFF', borderColor: selected ? '#F5C4D8' : '#90909A', borderWidth: selected ? 5 : 2 }]}>
              <Text style={[styles.markerText, selected && styles.markerTextSelected, detailTheme && { color: selected ? '#FFFFFF' : '#171717', fontSize: 14 }]}>{index + 1}</Text>
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, width: '100%', height: '100%' },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: 'rgba(140,123,235,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSelected: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.accent },
  markerText: { color: colors.white, fontSize: 12, fontWeight: '900', fontFamily: fonts.black },
  markerTextSelected: { fontSize: 14 },
});
