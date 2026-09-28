import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourseMap } from './CourseMap';
import { GlassSurface } from './GlassSurface';
import { colors } from '../theme';
import { PLACE_STORAGE_KEY, parseSavedPlaces, searchPlaces, type SavedPlace } from '../placeLibrary';
import type { OutingPlace, OutingRecord } from '../types';

const BRAND_GRADIENT = ['#2E98E7', '#7ABDF0', '#389C83'] as const;

function GradientButton({ disabled, onPress, children }: { disabled?: boolean; onPress: () => void; children: ReactNode }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}>
    <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.button, disabled && s.buttonDisabled]}>
      <Text style={s.buttonText}>{children}</Text>
    </LinearGradient>
  </Pressable>;
}

function Chip({ selected, onPress, children }: { selected?: boolean; onPress: () => void; children: ReactNode }) {
  if (!selected) return <Pressable accessibilityRole="button" accessibilityState={{ selected: false }} onPress={onPress} style={s.tab}><Text>{children}</Text></Pressable>;
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: true }} onPress={onPress}>
    <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.tab}>
      <Text style={s.activeText}>{children}</Text>
    </LinearGradient>
  </Pressable>;
}

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
  const [toolsOpen, setToolsOpen] = useState(false);
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
  const closeTools = () => { setToolsOpen(false); if (mode !== 'course') switchMode('course'); };
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
    <View style={s.headerRow}>
      <Text style={s.title}>{mode === 'search' ? `‘${searched}’ 검색 결과 · ${places.length}곳` : mode === 'saved' ? '저장한 장소' : '나의 지도'}</Text>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: toolsOpen }} onPress={() => (toolsOpen ? closeTools() : setToolsOpen(true))} style={s.toolsToggle}><Text style={s.toolsToggleText}>{toolsOpen ? '지도만 보기' : '검색 · 내 장소'}</Text></Pressable>
    </View>
    {toolsOpen && <>
      <View style={s.row}>
        <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.searchBorder}>
          <TextInput accessibilityLabel="장소 검색" style={s.searchInput} placeholder="어떤 장소를 찾고 있나요?" value={query} maxLength={100} onChangeText={setQuery} onSubmitEditing={() => void search()} returnKeyType="search" />
        </LinearGradient>
        <GradientButton disabled={!query.trim() || busy} onPress={() => void search()}>{busy ? '검색 중…' : '검색'}</GradientButton>
      </View>
      <View style={s.row}>{(['course', 'search', 'saved'] as const).map((item, i) => <Chip key={item} selected={mode === item} onPress={() => switchMode(item)}>{['내 코스', '검색 결과', `내 장소 ${saved.length}`][i]}</Chip>)}</View>
      {!!error && <Text accessibilityRole="alert">{error}</Text>}
      {!!storageError && <Text accessibilityRole="alert">{storageError}</Text>}
      {!!notice && <Text accessibilityLiveRegion="polite">{notice}</Text>}
      {mode === 'saved' && <ScrollView horizontal contentContainerStyle={s.row}><Chip selected={folder === ''} onPress={() => setFolder('')}>전체</Chip>{[...new Set(saved.map(p => p.folder))].map(value => <Chip key={value} selected={folder === value} onPress={() => setFolder(value)}>{value}</Chip>)}</ScrollView>}
    </>}
    <View style={s.map}>
      <CourseMap record={mapRecord} selectedPlaceId={selected?.id} onSelectPlace={pickPlace} showRoute={mode === 'course'} />
      {!!overlayPlace && <GlassSurface level={2} radius={14} style={s.mapOverlay} contentStyle={s.mapOverlayContent}>
        <Pressable accessibilityRole="button" accessibilityLabel="정보 닫기" onPress={() => setOverlayId(undefined)} style={s.mapOverlayClose}><Text style={s.mapOverlayCloseText}>×</Text></Pressable>
        {!!overlayImage && <Image source={overlayImage} accessibilityLabel={`${overlayPlace.name} 사진`} style={s.mapOverlayImage} resizeMode="cover" />}
        <Text numberOfLines={1} style={s.mapOverlayTitle}>{overlayPlace.name}</Text>
        <Text numberOfLines={1} style={s.mapOverlayMeta}>{overlayPlace.category || overlayPlace.address}</Text>
      </GlassSurface>}
    </View>
    {!places.length && !busy && <Text>{mode === 'search' ? '검색 결과가 없어요. 지역과 장소명을 함께 입력해 보세요.' : mode === 'saved' ? '아직 저장된 장소가 없어요.' : '등록된 코스 장소가 없어요.'}</Text>}
    {mode === 'search' && !!places.length && <Text style={s.meta}>네이버 지역 검색 결과 · 최대 5곳</Text>}
    <ScrollView horizontal contentContainerStyle={s.row}>{places.map((place, index) => <Chip key={place.id} selected={selected?.id === place.id} onPress={() => pickPlace(place.id)}>{index + 1} · {place.name}</Chip>)}</ScrollView>
    {selected && <GlassSurface level={1} radius={14} contentStyle={s.panel}><Text style={s.title}>{selected.name}</Text><Text>{selected.address}</Text><Text style={s.meta}>{selected.category || '미분류'}</Text>
      {stored ? <PlaceEditor key={`${stored.id}:${stored.memo}:${stored.folder}`} place={stored} disabled={writing || !ready}
        onSave={(memo, group) => void persist(savedRef.current.map(p => p.id === stored.id ? { ...p, memo, folder: group.trim() || '기본' } : p), '메모와 분류를 저장했어요.')}
        onDelete={() => void persist(savedRef.current.filter(p => p.id !== stored.id), '장소를 삭제했어요.')} />
        : <><Text>{selected.memo || '아직 메모가 없어요.'}</Text><GradientButton disabled={!ready || writing} onPress={() => { if (!savedRef.current.some(p => p.id === selected.id)) void persist([...savedRef.current, { ...selected, folder: '기본' }], '내 장소에 저장했어요.'); }}>장소 저장</GradientButton></>}
    </GlassSurface>}
    <Text style={s.meta}>저장한 장소는 이 기기에 보관돼요.</Text>
  </View>;
}
function PlaceEditor({ place, disabled, onSave, onDelete }: { place: SavedPlace; disabled: boolean; onSave: (memo: string, folder: string) => void; onDelete: () => void }) {
  const [memo, setMemo] = useState(place.memo);
  const [folder, setFolder] = useState(place.folder);
  const [confirm, setConfirm] = useState(false);
  return <View style={s.wrap}><TextInput accessibilityLabel="장소 메모" multiline maxLength={2000} placeholder="메모를 남겨보세요" style={s.input} value={memo} onChangeText={setMemo} /><TextInput accessibilityLabel="장소 분류" maxLength={40} placeholder="분류 이름 (예: 카페, 데이트)" style={s.input} value={folder} onChangeText={setFolder} /><GradientButton disabled={disabled} onPress={() => onSave(memo, folder)}>메모·분류 저장</GradientButton><Pressable accessibilityRole="button" disabled={disabled} onPress={() => setConfirm(true)} style={s.tab}><Text>장소 삭제</Text></Pressable>{confirm && <View style={s.row}><Text>삭제할까요?</Text><Pressable accessibilityRole="button" disabled={disabled} onPress={onDelete} style={s.tab}><Text>삭제 확인</Text></Pressable><Pressable onPress={() => setConfirm(false)} style={s.tab}><Text>취소</Text></Pressable></View>}</View>;
}
const s = StyleSheet.create({ wrap: { gap: 12 }, row: { flexDirection: 'row', gap: 8, alignItems: 'center' }, input: { minWidth: 0, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, color: colors.ink, padding: 12, borderRadius: 12 }, button: { padding: 12, borderRadius: 12, minHeight: 44, justifyContent: 'center', alignItems: 'center' }, buttonDisabled: { opacity: 0.5 }, buttonText: { color: colors.white, fontWeight: '600' }, tab: { padding: 12, borderRadius: 12, backgroundColor: colors.white, minHeight: 44, justifyContent: 'center' }, activeText: { color: colors.white, fontWeight: '600' }, title: { fontSize: 18, fontWeight: '600', color: colors.ink }, map: { height: 310, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.primarySoft }, panel: { padding: 16, gap: 10 }, meta: { fontSize: 12, color: colors.muted },
  searchBorder: { flex: 1, minWidth: 0, borderRadius: 999, padding: 2 },
  searchInput: { flex: 1, minWidth: 0, backgroundColor: colors.white, color: colors.ink, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 997 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  toolsToggle: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.white },
  toolsToggleText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  mapOverlay: { position: 'absolute', top: 12, right: 12, maxWidth: 220, zIndex: 5 },
  mapOverlayContent: { padding: 10, gap: 4 },
  mapOverlayClose: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  mapOverlayCloseText: { color: colors.ink, fontSize: 14, lineHeight: 16 },
  mapOverlayImage: { width: '100%', height: 100, borderRadius: 10, marginBottom: 6, backgroundColor: colors.primarySoft },
  mapOverlayTitle: { color: colors.ink, fontSize: 13, fontWeight: '700', paddingRight: 20 },
  mapOverlayMeta: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
