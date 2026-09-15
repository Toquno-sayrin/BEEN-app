import { StyleSheet, Text, View } from 'react-native';
import { fonts, tagPalette } from '../theme';

export function Tag({ text, index = 0 }: { text: string; index?: number }) {
  const variant = tagPalette[index % tagPalette.length];
  return (
    <View style={[styles.tag, { backgroundColor: variant.bg }]}>
      <Text style={[styles.text, { color: variant.text }]}>#{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
});
