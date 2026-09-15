import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourseMap } from './CourseMap';
import { colors } from '../theme';
import { PLACE_STORAGE_KEY, parseSavedPlaces, searchPlaces, type SavedPlace } from '../placeLibrary';
import type { OutingPlace, OutingRecord } from '../types';

export function PlaceExplorer({ record }: { record?: OutingRecord }) {
  const [mode, setMode] = useState<'course' | 'search' | 'saved'>('course');
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');
  const [results, setResults] = useState<OutingPlace[]>([]);
  const [saved, setSaved] = useState<SavedPlace[]>([]);
  const savedRef = useRef(saved);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const writeLock = useRef(false);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedId, setSelectedId] = useState<string>();
  const [overlayId, setOverlayId] = useState<string>();
  const [folder, setFolder] = useState('');
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(PLACE_STORAGE_KEY).then(raw => {
      const items = parseSavedPlaces(raw);
      if (active) { savedRef.current = items; setSaved(items); setReady(true); }
    }).catch(() => { if (active) setStorageError('저장소를 읽지 못했어요. 새로고침 후 다시 시도해 주세요.'); });
    return () => { active = false; requestRef.current?.abort(); };
  }, []);
  useEffect(() => { requestRef.current?.abort(); setBusy(false); setMode('course'); setSelectedId(record?.places[0]?.id); setOverlayId(undefined); }, [record]);
  const places = useMemo(() => mode === 'search' ? results : mode === 'saved' ? saved.filter(p => !folder || p.folder === folder) : record?.places ?? [], [mode, results, saved, folder, record]);
  const selected = places.find(p => p.id === selectedId) ?? places[0];
  const overlayPlace = places.find(p => p.id === overlayId);
  const stored = saved.find(p => p.id === selected?.id);
  const overlayImage = mode === 'course' && record?.images.length && overlayPlace
    ? record.images[record.places.findIndex(p => p.id === overlayPlace.id)] ?? record.images[0]
    : undefined;
  const mapRecord = useMemo<OutingRecord>(() => ({ id: 'place-explorer', author: '', handle: '', date: '', title: '', note: '', location: '', images: [], visibility: '나만 보기', distance: '', duration: '', places }), [places]);
  const pickPlace = (id: string) => { setSelectedId(id); setOverlayId(id); };
  const switchMode = (next: typeof mode) => { requestRef.current?.abort(); requestRef.current = null; setBusy(false); setMode(next); setSelectedId(undefined); setOverlayId(undefined); setError(''); setNotice(''); };
  const search = async () => {
    if (!query.trim()) return;
    requestRef.current?.abort();
    const controller = new AbortController(); requestRef.current = controller;
    setBusy(true); setError(''); setNotice(''); setResults([]); setMode('search'); setSearched(query.trim()); setOverlayId(undefined);
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const items = await searchPlaces(query, controller.signal);
      if (requestRef.current === controller) { setResults(items); setSelectedId(items[0]?.id); }
    } catch (e) {
      if (requestRef.current === controller) setError(controller.signal.aborted ? '검색 시간이 초과됐어요. 다시 검색해 주세요.' : e instanceof Error ? e.message : '검색에 실패했어요.');
    } finally { clearTimeout(timer); if (requestRef.current === controller) { setBusy(false); requestRef.current = null; } }
  };
  const persist = async (items: SavedPlace[], message: string) => {
    if (!ready || writeLock.current) return;
    writeLock.current = true; setWriting(true); setStorageError('');
    try { await AsyncStorage.setItem(PLACE_STORAGE_KEY, JSON.stringify(items)); savedRef.current = items; setSaved(items); setNotice(message); }
    catch { setStorageError('저장하지 못했어요. 저장 공간을 확인하고 다시 시도해 주세요.'); }
    finally { writeLock.current = false; setWriting(false); }
  };
  return <View style={s.wrap}>
    <View style={s.row}><TextInput accessibilityLabel="장소 검색" style={[s.input, { flex: 1 }]} placeholder="어떤 장소를 찾고 있나요?" value={query} maxLength={100} onChangeText={setQuery} onSubmitEditing={() => void search()} returnKeyType="search" /><Pressable accessibilityRole="button" style={s.button} disabled={!query.trim() || busy} onPress={() => void search()}><Text style={s.buttonText}>{busy ? '검색 중…' : '검색'}</Text></Pressable></View>
    <View style={s.row}>{(['course', 'search', 'saved'] as const).map((item, i) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: mode === item }} onPress={() => switchMode(item)} style={[s.tab, mode === item && s.active]}><Text>{['내 코스', '검색 결과', `내 장소 ${saved.length}`][i]}</Text></Pressable>)}</View>
    {!!error && <Text accessibilityRole="alert">{error}</Text>}
    {!!storageError && <Text accessibilityRole="alert">{storageError}</Text>}
    {!!notice && <Text accessibilityLiveRegion="polite">{notice}</Text>}
    {mode === 'saved' && <ScrollView horizontal contentContainerStyle={s.row}><Pressable style={s.tab} onPress={() => setFolder('')}><Text>전체</Text></Pressable>{[...new Set(saved.map(p => p.folder))].map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: folder === value }} style={[s.tab, folder === value && s.active]} onPress={() => setFolder(value)}><Text>{value}</Text></Pressable>)}</ScrollView>}
    <Text style={s.title}>{mode === 'search' ? `‘${searched}’ 검색 결과 · ${places.length}곳` : mode === 'saved' ? '저장한 장소' : '나의 지도'}</Text>
    <View style={s.map}>
      <CourseMap record={mapRecord} selectedPlaceId={selected?.id} onSelectPlace={pickPlace} showRoute={mode === 'course'} />
      {!!overlayPlace && <View style={s.mapOverlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="정보 닫기" onPress={() => setOverlayId(undefined)} style={s.mapOverlayClose}><Text style={s.mapOverlayCloseText}>×</Text></Pressable>
        {!!overlayImage && <Image source={overlayImage} accessibilityLabel={`${overlayPlace.name} 사진`} style={s.mapOverlayImage} resizeMode="cover" />}
        <Text numberOfLines={1} style={s.mapOverlayTitle}>{overlayPlace.name}</Text>
        <Text numberOfLines={1} style={s.mapOverlayMeta}>{overlayPlace.address}</Text>
        {!!overlayPlace.category && <Text numberOfLines={1} style={s.mapOverlayMeta}>{overlayPlace.category}</Text>}
      </View>}
    </View>
    {!places.length && !busy && <Text>{mode === 'search' ? '검색 결과가 없어요. 지역과 장소명을 함께 입력해 보세요.' : mode === 'saved' ? '아직 저장된 장소가 없어요.' : '등록된 코스 장소가 없어요.'}</Text>}
    {mode === 'search' && !!places.length && <Text style={s.meta}>네이버 지역 검색 결과 · 최대 5곳</Text>}
    <ScrollView horizontal contentContainerStyle={s.row}>{places.map((place, index) => <Pressable accessibilityRole="button" accessibilityState={{ selected: selected?.id === place.id }} key={place.id} onPress={() => pickPlace(place.id)} style={[s.tab, selected?.id === place.id && s.active]}><Text>{index + 1} · {place.name}</Text></Pressable>)}</ScrollView>
    {selected && <View style={s.panel}><Text style={s.title}>{selected.name}</Text><Text>{selected.address}</Text><Text style={s.meta}>{selected.category || '미분류'}</Text>
      {stored ? <PlaceEditor key={`${stored.id}:${stored.memo}:${stored.folder}`} place={stored} disabled={writing || !ready}
        onSave={(memo, group) => void persist(savedRef.current.map(p => p.id === stored.id ? { ...p, memo, folder: group.trim() || '기본' } : p), '메모와 분류를 저장했어요.')}
        onDelete={() => void persist(savedRef.current.filter(p => p.id !== stored.id), '장소를 삭제했어요.')} />
        : <><Text>{selected.memo || '아직 메모가 없어요.'}</Text><Pressable accessibilityRole="button" disabled={!ready || writing} style={s.button} onPress={() => { if (!savedRef.current.some(p => p.id === selected.id)) void persist([...savedRef.current, { ...selected, folder: '기본' }], '내 장소에 저장했어요.'); }}><Text style={s.buttonText}>장소 저장</Text></Pressable></>}
    </View>}
    <Text style={s.meta}>저장한 장소는 이 기기에 보관돼요.</Text>
  </View>;
}
function PlaceEditor({ place, disabled, onSave, onDelete }: { place: SavedPlace; disabled: boolean; onSave: (memo: string, folder: string) => void; onDelete: () => void }) {
  const [memo, setMemo] = useState(place.memo);
  const [folder, setFolder] = useState(place.folder);
  const [confirm, setConfirm] = useState(false);
  return <View style={s.wrap}><TextInput accessibilityLabel="장소 메모" multiline maxLength={2000} placeholder="메모를 남겨보세요" style={s.input} value={memo} onChangeText={setMemo} /><TextInput accessibilityLabel="장소 분류" maxLength={40} placeholder="분류 이름 (예: 카페, 데이트)" style={s.input} value={folder} onChangeText={setFolder} /><Pressable accessibilityRole="button" disabled={disabled} style={s.button} onPress={() => onSave(memo, folder)}><Text style={s.buttonText}>메모·분류 저장</Text></Pressable><Pressable accessibilityRole="button" disabled={disabled} onPress={() => setConfirm(true)} style={s.tab}><Text>장소 삭제</Text></Pressable>{confirm && <View style={s.row}><Text>삭제할까요?</Text><Pressable accessibilityRole="button" disabled={disabled} onPress={onDelete} style={s.tab}><Text>삭제 확인</Text></Pressable><Pressable onPress={() => setConfirm(false)} style={s.tab}><Text>취소</Text></Pressable></View>}</View>;
}
const s = StyleSheet.create({ wrap: { gap: 12 }, row: { flexDirection: 'row', gap: 8, alignItems: 'center' }, input: { minWidth: 0, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, color: colors.ink, padding: 12, borderRadius: 12 }, button: { padding: 12, borderRadius: 12, backgroundColor: colors.primary, minHeight: 44, justifyContent: 'center' }, buttonText: { color: colors.white }, tab: { padding: 12, borderRadius: 12, backgroundColor: colors.white, minHeight: 44 }, active: { backgroundColor: colors.accentSoft }, title: { fontSize: 18, fontWeight: '600', color: colors.ink }, map: { height: 310, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.primarySoft }, panel: { padding: 16, backgroundColor: colors.white, borderRadius: 14, gap: 10 }, meta: { fontSize: 12, color: colors.muted },
  mapOverlay: { position: 'absolute', top: 12, right: 12, maxWidth: 220, backgroundColor: colors.white, borderRadius: 14, padding: 10, gap: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4, zIndex: 5 },
  mapOverlayClose: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  mapOverlayCloseText: { color: colors.ink, fontSize: 14, lineHeight: 16 },
  mapOverlayImage: { width: '100%', height: 100, borderRadius: 10, marginBottom: 6, backgroundColor: colors.primarySoft },
  mapOverlayTitle: { color: colors.ink, fontSize: 13, fontWeight: '700', paddingRight: 20 },
  mapOverlayMeta: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
