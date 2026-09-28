import { ScrollView, StyleSheet, View } from 'react-native';
import { Brand } from '../components/Brand';
import { PlaceExplorer } from '../components/PlaceExplorer';
import type { OutingRecord } from '../types';

type Props = { records: OutingRecord[] };
export function MyMapScreen({ records }: Props) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Brand />
    <View style={styles.body}>
      <PlaceExplorer record={records[0]} />
    </View>
  </ScrollView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingBottom: 110 },
  body: { paddingHorizontal: 20 },
});
