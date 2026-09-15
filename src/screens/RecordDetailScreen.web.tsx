import { useEffect, useState } from 'react';
import { Image, useWindowDimensions } from 'react-native';
import type { OutingRecord } from '../types';
import { detailCss } from './recordDetailStyles';

type Props = { record: OutingRecord; onBack: () => void; onOpenMap: () => void };

export function RecordDetailScreen({ record, onBack, onOpenMap }: Props) {
  const { width } = useWindowDimensions();
  const mapWidth = width <= 480 ? 400 : 800;
  const [selectedId, setSelectedId] = useState(record.places[0]?.id);
  const [zoom, setZoom] = useState(1);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    setSelectedId(record.places[0]?.id);
    setZoom(1);
    setMessage('');
    try { setSaved(localStorage.getItem(`been-course:${record.id}`) !== null); }
    catch { setSaved(false); }
  }, [record]);
  const selected = record.places.find(place => place.id === selectedId) ?? record.places[0];
  const selectedIndex = record.places.findIndex(place => place.id === selected?.id);
  const valid = record.places.filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
  const lats = valid.map(p => p.latitude);
  const lngs = valid.map(p => p.longitude);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const points = valid.map(place => ({
    place,
    x: 70 + (maxLng === minLng ? 0.5 : (place.longitude - minLng) / (maxLng - minLng)) * (mapWidth - 140),
    y: 350 - (maxLat === minLat ? 0.5 : (place.latitude - minLat) / (maxLat - minLat)) * 240,
    index: record.places.findIndex(p => p.id === place.id),
  }));
  const selectedPoint = points.find(p => p.place.id === selected?.id);
  const centerX = zoom > 1 ? selectedPoint?.x ?? mapWidth / 2 : mapWidth / 2;
  const centerY = zoom > 1 ? selectedPoint?.y ?? 230 : 230;
  const save = () => {
    try {
      localStorage.setItem(`been-course:${record.id}`, JSON.stringify(record));
      setSaved(true);
      setMessage('이 브라우저에 코스를 저장했어요.');
    } catch { setMessage('브라우저 저장 공간을 사용할 수 없습니다.'); }
  };

  return (
    <div className="been-detail">
      <style>{detailCss}</style>
      <header className="bd-header">
        <button className="bd-brand" onClick={onBack} aria-label="BEEN 내 기록으로 돌아가기"><span className="bd-brand-icon">✳</span> BEEN<span className="bd-brand-dot">.</span></button>
        <span className="bd-header-label">PLACES MAKE A DAY</span>
        <button className="bd-text-button" onClick={onBack}>내 기록 <span aria-hidden="true">↗</span></button>
      </header>
      <main className="bd-main">
        <div className="bd-breadcrumb"><button onClick={onBack}>내 기록</button><span>/</span><span>코스 상세</span></div>
        <section className="bd-intro" aria-labelledby="course-title">
          <div><div className="bd-eyebrow">COURSE JOURNAL <span className="bd-sample">샘플 코스</span></div><h1 id="course-title">{record.title}</h1><p className="bd-location">{record.location}</p></div>
          <div className="bd-author"><span className="bd-avatar">{record.author.slice(0, 1)}</span><div><strong>{record.author}</strong><span>{record.date} · {record.visibility}</span></div></div>
        </section>
        <section className="bd-workspace" aria-label="코스 지도와 선택 장소">
          <div className="bd-map" aria-label="샘플 좌표 기반 코스 개요도">
            <div className="bd-map-top"><span><i /> COURSE OVERVIEW</span><span>서울 · 샘플 좌표</span></div>
            {points.length ? <svg className="bd-map-svg" viewBox={`${centerX - mapWidth / 2 / zoom} ${centerY - 230 / zoom} ${mapWidth / zoom} ${460 / zoom}`} aria-label="장소 순서와 연결 경로">
              <defs><pattern id="bd-grid" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.8" fill="#DADAE0" /></pattern></defs>
              <rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#bd-grid)" />
              <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#C72566" strokeOpacity=".08" strokeWidth="24" strokeLinejoin="round" />
              <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#C72566" strokeWidth="2" strokeDasharray="5 6" />
              {points.map(({ place, x, y, index }) => <g key={place.id} role="button" tabIndex={0} aria-label={`${index + 1}. ${place.name} 선택`} aria-pressed={selected?.id === place.id} onClick={() => setSelectedId(place.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(place.id); } }} className="bd-marker">
                {selected?.id === place.id && <circle cx={x} cy={y} r="30" fill="#C72566" opacity=".12" />}
                <circle cx={x} cy={y} r="23" fill="transparent" />
                <circle cx={x} cy={y} r="17" fill={selected?.id === place.id ? '#C72566' : '#FFFFFF'} stroke={selected?.id === place.id ? '#C72566' : '#90909A'} />
                <text x={x} y={y + 5} textAnchor="middle" fill={selected?.id === place.id ? '#FFFFFF' : '#171717'} fontSize="13" fontWeight="700">{index + 1}</text>
                <text x={x} y={y + 48} textAnchor="middle" fill="#171717" stroke="#F7F7F8" strokeWidth="5" paintOrder="stroke" fontSize="14">{place.name}</text>
              </g>)}
            </svg> : <div className="bd-map-empty">{record.places.length ? '표시할 수 있는 좌표가 없습니다.' : '아직 등록된 장소가 없습니다.'}</div>}
            <div className="bd-map-controls"><button aria-label="지도 확대" disabled={zoom >= 2} onClick={() => setZoom(z => Math.min(2, z + .25))}>+</button><button aria-label="지도 축소" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - .25))}>−</button><button aria-label="전체 코스 보기" onClick={() => setZoom(1)}>⛶</button></div>
            <div className="bd-map-caption"><span>좌표 기반 개요도 · 실제 도로 경로 아님</span><span>N ↑</span></div>
          </div>
          <aside className="bd-detail-panel" aria-label="선택 장소 상세">
            <div className="bd-panel-heading"><span className="bd-eyebrow">SELECTED PLACE</span><span className="bd-counter">{selected ? String(selectedIndex + 1).padStart(2, '0') : '00'} / {String(record.places.length).padStart(2, '0')}</span></div>
            {selected ? <>
              <div className="bd-selected-number">{String(selectedIndex + 1).padStart(2, '0')}<span>코스의 {selectedIndex + 1}번째 장소</span></div>
              <h2>{selected.name}</h2><p className="bd-address">{selected.address}</p>
              <div className="bd-place-meta"><span>머문 시간</span><strong>{selected.stay}</strong></div>
              <div className="bd-memo"><span className="bd-eyebrow">PLACE NOTE</span><p>{selected.memo || '남겨진 메모가 없습니다.'}</p></div>
              <div className="bd-place-pagination"><button disabled={selectedIndex <= 0} onClick={() => setSelectedId(record.places[selectedIndex - 1].id)}>← 이전 장소</button><button disabled={selectedIndex >= record.places.length - 1} onClick={() => setSelectedId(record.places[selectedIndex + 1].id)}>다음 장소 →</button></div>
            </> : <p className="bd-address">장소가 등록되면 이곳에서 상세 정보를 확인할 수 있어요.</p>}
          </aside>
        </section>
        <div className="bd-summary"><div><span>PLACES</span><strong>{record.places.length}<small>곳</small></strong></div><div><span>DURATION</span><strong>{record.duration}</strong></div><div><span>DISTANCE</span><strong>{record.distance}</strong></div><button className="bd-text-button" onClick={onOpenMap}>전체 지도 열기 ↗</button></div>
        <section className="bd-route-section" aria-labelledby="route-title"><div className="bd-section-title"><h2 id="route-title">코스를 따라 <span>Course stops</span></h2><span>{record.places.length}개의 장소</span></div>
          <div className="bd-stops">{record.places.map((place, index) => <button className={`bd-stop ${selected?.id === place.id ? 'is-selected' : ''}`} key={place.id} aria-pressed={selected?.id === place.id} onClick={() => { setSelectedId(place.id); }}><span className="bd-stop-number">{String(index + 1).padStart(2, '0')}</span><div><strong>{place.name}</strong><span>{place.stay} 머묾</span></div><span className="bd-stop-arrow">↗</span></button>)}</div>
        </section>
        <section className="bd-story" aria-labelledby="story-title"><div className="bd-story-copy"><span className="bd-eyebrow">BEHIND THE COURSE</span><h2 id="story-title">이 코스에 남긴 이야기</h2><p>{record.note || '아직 코스 설명이 없습니다.'}</p><span className="bd-story-by">기록한 사람 · {record.author} <span>{record.handle}</span></span><button className="bd-save" onClick={save} disabled={saved}>{saved ? '✓ 이 브라우저에 저장됨' : '코스 저장하기 ↗'}</button><span className="bd-save-hint" role="status">{message || '이 기기의 브라우저에 저장됩니다.'}</span></div><div className="bd-photos">{record.images.slice(0, 2).map((source, index) => <Image key={index} source={source} accessibilityLabel={`${record.author}의 코스 사진 ${index + 1}`} style={{ flex: 1, minWidth: 0, height: 250, borderRadius: 8 }} resizeMode="cover" />)}</div></section>
        <footer className="bd-footer"><span>BEEN. <span>나의 걸음이 코스가 되는 곳</span></span><span>END OF COURSE</span></footer>
      </main>
    </div>
  );
}
