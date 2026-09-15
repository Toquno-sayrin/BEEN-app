import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, fonts, radius } from '../theme';
import type { ImageSourcePropType, } from 'react-native';
import type { OutingRecord, Visibility } from '../types';
import { useState } from 'react';
import { courseThemes } from '../recordSearch';

type Props = {
  images: ImageSourcePropType[];
  onCancel: () => void;
  onSave: (record: OutingRecord) => void;
};

const visibilityOptions: Visibility[] = ['나만 보기', '친구 공개', '전체 공개'];

export function CreateRecordScreen({ images, onCancel, onSave }: Props) {
  const [title, setTitle] = useState('해 질 무렵, 천천히 걸었던 날');
  const [note, setNote] = useState('선선해진 저녁, 음악을 들으며 오래 걸었다.');
  const [location, setLocation] = useState('장소 미설정');
  const [visibility, setVisibility] = useState<Visibility | null>(null);
  const [themes, setThemes] = useState<string[]>([]);

  const save = () => {
    if (!visibility) return;
    onSave({
      id: `outing-${Date.now()}`,
      author: '예림',
      handle: '@been_yerim',
      date: '2026.09.14',
      title: title.trim() || '제목 없는 외출',
      note: note.trim(),
      location,
      themes,
      images,
      visibility,
      distance: '3.2 km',
      duration: '1시간 20분',
      places: [
        {
          id: `place-${Date.now()}-1`,
          name: '산책로 입구',
          address: '정확한 장소는 기록 작성 시 연결',
          latitude: 37.5446,
          longitude: 127.0378,
          stay: '15분',
          memo: '햇빛이 길게 들어오던 시작점',
        },
        {
          id: `place-${Date.now()}-2`,
          name: '잔디광장',
          address: '정확한 장소는 기록 작성 시 연결',
          latitude: 37.5462,
          longitude: 127.0402,
          stay: '35분',
          memo: '음악을 들으며 잠시 쉬었다.',
        },
        {
          id: `place-${Date.now()}-3`,
          name: '전망 구간',
          address: '정확한 장소는 기록 작성 시 연결',
          latitude: 37.5481,
          longitude: 127.0425,
          stay: '20분',
          memo: '도시의 불이 켜지기 시작했다.',
        },
      ],
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <ScreenHeader eyebrow="NEW MEMORY" title="오늘을 남겨볼까요?" action="취소" onAction={onCancel} />

      <View style={styles.photoRow}>
        {images.map((image, index) => (
          <View key={index} style={styles.photoWrap}>
            <Image source={image} style={styles.photo} />
            {index === 0 ? <View style={styles.coverPill}><Text style={styles.coverText}>대표</Text></View> : null}
          </View>
        ))}
        <Pressable style={styles.addPhoto}><Text style={styles.addPlus}>＋</Text><Text style={styles.addText}>사진 추가</Text></Pressable>
      </View>

      <View style={styles.form}>
        <Text style={{ color: colors.ink, marginBottom: 10 }}>코스 테마</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>{courseThemes.map(theme => <Pressable accessibilityRole="button" accessibilityState={{ selected: themes.includes(theme) }} key={theme} onPress={() => setThemes(current => current.includes(theme) ? current.filter(item => item !== theme) : [...current, theme])} style={{ padding: 12, borderRadius: 12, backgroundColor: themes.includes(theme) ? colors.accentSoft : colors.white }}><Text>{theme}</Text></Pressable>)}</View>
        <FieldLabel number="01" label="어떤 하루였나요?" hint="한 줄이면 충분해요" />
        <TextInput value={title} onChangeText={setTitle} placeholder="오늘의 제목" placeholderTextColor={colors.muted} style={styles.titleInput} />

        <FieldLabel number="02" label="기억하고 싶은 말" hint="선택" />
        <TextInput value={note} onChangeText={setNote} multiline placeholder="짧은 이야기를 남겨보세요" placeholderTextColor={colors.muted} style={styles.noteInput} />

        <FieldLabel number="03" label="어디를 다녀왔나요?" hint="장소 연결" />
        <Pressable onPress={() => setLocation(location === '장소 미설정' ? '저녁 산책 코스' : '장소 미설정')} style={styles.locationButton}>
          <View><Text style={styles.locationTitle}>{location}</Text><Text style={styles.locationHint}>눌러서 샘플 장소 전환</Text></View>
          <Text style={styles.locationArrow}>›</Text>
        </Pressable>

        <FieldLabel number="04" label="누구에게 보여줄까요?" hint="필수 선택" />
        <View style={styles.visibilityRow}>
          {visibilityOptions.map((option) => (
            <Pressable key={option} onPress={() => setVisibility(option)} style={[styles.visibilityButton, visibility === option && styles.visibilityActive]}>
              <Text style={[styles.visibilityText, visibility === option && styles.visibilityTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          disabled={!visibility}
          onPress={save}
          style={[styles.saveButton, !visibility && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveText}>이 하루 저장하기</Text>
        </Pressable>
        <Text style={styles.saveHint}>저장하면 내 피드와 지도에 함께 표시돼요.</Text>
      </View>
    </ScrollView>
  );
}

function FieldLabel({ number, label, hint }: { number: string; label: string; hint: string }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingBottom: 42 },
  photoRow: { paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', gap: 9 },
  photoWrap: { width: 112, height: 148, borderRadius: radius.small, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  coverPill: { position: 'absolute', top: 7, left: 7, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.primary },
  coverText: { color: colors.white, fontSize: 9, fontWeight: '800', fontFamily: fonts.extrabold },
  addPhoto: { width: 92, height: 148, borderRadius: radius.small, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  addPlus: { color: colors.primary, fontSize: 24 },
  addText: { color: colors.muted, fontSize: 10, marginTop: 5 },
  form: { paddingHorizontal: 20 },
  labelRow: { marginTop: 25, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  number: { color: colors.accent, fontSize: 10, fontWeight: '900', fontFamily: fonts.black, marginRight: 8 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '800', fontFamily: fonts.extrabold },
  hint: { color: colors.muted, fontSize: 10, marginLeft: 'auto' },
  titleInput: { borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 12, color: colors.ink, fontSize: 17, fontWeight: '700', fontFamily: fonts.bold },
  noteInput: { minHeight: 96, padding: 14, borderRadius: radius.small, backgroundColor: colors.white, color: colors.ink, fontSize: 13, lineHeight: 20, textAlignVertical: 'top' },
  locationButton: { padding: 15, borderRadius: radius.small, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationTitle: { color: colors.ink, fontSize: 13, fontWeight: '800', fontFamily: fonts.extrabold },
  locationHint: { color: colors.muted, fontSize: 10, marginTop: 4 },
  locationArrow: { color: colors.primary, fontSize: 25 },
  visibilityRow: { flexDirection: 'row', gap: 7 },
  visibilityButton: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  visibilityActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  visibilityText: { color: colors.muted, fontSize: 10, fontWeight: '700', fontFamily: fonts.bold },
  visibilityTextActive: { color: colors.white },
  saveButton: { marginTop: 30, paddingVertical: 16, borderRadius: radius.medium, backgroundColor: colors.primary, alignItems: 'center' },
  saveButtonDisabled: { backgroundColor: colors.primarySoft },
  saveText: { color: colors.white, fontSize: 14, fontWeight: '800', fontFamily: fonts.extrabold },
  saveHint: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 9 },
});
