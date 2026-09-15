import { useEffect, useRef, useState } from 'react';
import { MapFallback } from './MapFallback';
import { naverClientId, type CourseMapProps } from './naverMapDocument';

// The SDK exposes its objects globally; keep the untyped boundary inside this adapter.
type MapSdk = any;
const sdkWindow = window as typeof window & { naver?: { maps: MapSdk }; navermap_authFailure?: () => void };
let sdkPromise: Promise<MapSdk> | undefined;
function loadSdk() {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => reject(new Error('지도 응답 시간 초과')), 15000);
    sdkWindow.navermap_authFailure = () => { clearTimeout(timeout); reject(new Error('지도 인증 실패')); };
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(naverClientId)}`;
    const globals = window as unknown as Record<string, unknown>;
    globals.__beenMapReady = () => {
      if (typeof sdkWindow.naver?.maps?.Map === 'function') { clearTimeout(timeout); resolve(sdkWindow.naver.maps); }
    };
    script.onload = () => {
      if (typeof sdkWindow.naver?.maps?.Map === 'function') { clearTimeout(timeout); resolve(sdkWindow.naver.maps); }
    };
    script.onerror = () => { clearTimeout(timeout); reject(new Error('지도 연결 실패')); };
    document.head.appendChild(script);
  });
  return sdkPromise;
}
export function CourseMap(props: CourseMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const activeProps = useRef(props); activeProps.current = props;
  const updateSelection = useRef<() => void>(() => {});
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!naverClientId || !container.current) return;
    let disposed = false;
    let map: MapSdk;
    let sdk: MapSdk;
    const markers: MapSdk[] = [];
    setError(false);
    loadSdk().then(api => {
      if (disposed) return;
      if (!api) throw Error('지도 초기화 실패');
      sdk = api;
      const places = props.record.places.map((place, index) => ({ ...place, index })).filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180);
      const first = places[0];
      map = new api.Map(container.current, { center: new api.LatLng(first?.latitude ?? 37.5665, first?.longitude ?? 126.978), zoom: 14, zoomControl: true });
      const icon = (index: number, selected: boolean) => ({ content: `<button aria-label="장소 ${index + 1} 선택" style="width:36px;height:36px;border:3px solid white;border-radius:50%;background:${selected ? 'rgba(30,125,95,.8)' : 'rgba(124,172,67,.8)'};color:white;font-weight:bold">${index + 1}</button>`, anchor: new api.Point(18, 18) });
      const bounds = new api.LatLngBounds();
      places.forEach(place => {
        const position = new api.LatLng(place.latitude, place.longitude); bounds.extend(position);
        const marker = new api.Marker({ map, position, icon: icon(place.index, place.id === activeProps.current.selectedPlaceId) });
        api.Event.addListener(marker, 'click', () => activeProps.current.onSelectPlace?.(place.id)); markers.push(marker);
      });
      if (places.length > 1) { map.fitBounds(bounds); new api.Polyline({ map, path: places.map(p => new api.LatLng(p.latitude, p.longitude)), strokeColor: '#2AA484', strokeOpacity: .8, strokeWeight: 4 }); }
      updateSelection.current = () => markers.forEach((marker, i) => marker.setIcon(icon(places[i].index, places[i].id === activeProps.current.selectedPlaceId)));
    }).catch(error => { console.error('NAVER map initialization failed', error); if (!disposed) setError(true); });
    return () => { disposed = true; updateSelection.current = () => {}; markers.forEach(marker => { sdk.Event.clearInstanceListeners(marker); marker.setMap(null); }); map?.destroy(); };
  }, [props.record]);
  useEffect(() => updateSelection.current(), [props.selectedPlaceId]);
  if (!naverClientId) return <MapFallback {...props} />;
  return <div style={{ flex: 1, minHeight: 300, position: 'relative', width: '100%', height: '100%' }}><div ref={container} aria-label="네이버 코스 지도" style={{ position: 'absolute', inset: 0 }} />{error && <div role="alert" style={{ position: 'absolute', inset: 16, background: '#E4F3EB', padding: 20 }}>지도를 불러오지 못했어요. 네이버 지도에서 열기를 이용해 주세요.</div>}</div>;
}
