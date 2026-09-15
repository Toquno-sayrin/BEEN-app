import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import type { OutingRecord } from '../types';
import { CourseMap } from '../components/CourseMap';
import { openNaverMap } from '../naverMaps';
import { shareCourse } from '../shareCourse';
import { detailCss } from './recordDetailStyles';

type Props = { record: OutingRecord; onBack: () => void; onOpenMap: () => void };

export function RecordDetailScreen({ record, onBack, onOpenMap }: Props) {
  const [selectedId, setSelectedId] = useState(record.places[0]?.id);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    setSelectedId(record.places[0]?.id);
    setMessage('');
    try { setSaved(localStorage.getItem(`been-course:${record.id}`) !== null); }
    catch { setSaved(false); }
  }, [record]);
  const selected = record.places.find(place => place.id === selectedId) ?? record.places[0];
  const selectedIndex = record.places.findIndex(place => place.id === selected?.id);
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
        <button className="bd-brand" onClick={onBack} aria-label="BeENoN 내 기록으로 돌아가기">BeENoN</button>
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
          <div className="bd-map" aria-label="네이버 코스 지도"><CourseMap record={record} selectedPlaceId={selected?.id} onSelectPlace={setSelectedId} /></div>
          <aside className="bd-detail-panel" aria-label="선택 장소 상세">
            <div className="bd-panel-heading"><span className="bd-eyebrow">SELECTED PLACE</span><span className="bd-counter">{selected ? String(selectedIndex + 1).padStart(2, '0') : '00'} / {String(record.places.length).padStart(2, '0')}</span></div>
            {selected ? <>
              <div className="bd-selected-number">{String(selectedIndex + 1).padStart(2, '0')}<span>코스의 {selectedIndex + 1}번째 장소</span></div>
              <h2>{selected.name}</h2><p className="bd-address">{selected.address}</p><p className="bd-address">{selected.category || '미분류'}</p><button className="bd-text-button" onClick={() => { void openNaverMap(selected.name, selected).catch(() => setMessage('지도를 열지 못했어요. 다시 시도해 주세요.')); }}>네이버 지도에서 열기 ↗</button>
              <div className="bd-place-meta"><span>머문 시간</span><strong>{selected.stay}</strong></div>
              <div className="bd-memo"><span className="bd-eyebrow">PLACE NOTE</span><p>{selected.memo || '남겨진 메모가 없습니다.'}</p></div>
              <div className="bd-place-pagination"><button disabled={selectedIndex <= 0} onClick={() => setSelectedId(record.places[selectedIndex - 1].id)}>← 이전 장소</button><button disabled={selectedIndex >= record.places.length - 1} onClick={() => setSelectedId(record.places[selectedIndex + 1].id)}>다음 장소 →</button></div>
            </> : <p className="bd-address">장소가 등록되면 이곳에서 상세 정보를 확인할 수 있어요.</p>}
          </aside>
        </section>
        <div className="bd-summary"><div><span>PLACES</span><strong>{record.places.length}<small>곳</small></strong></div><div><span>DURATION</span><strong>{record.duration}</strong></div><div><span>DISTANCE</span><strong>{record.distance}</strong></div><button className="bd-text-button" onClick={onOpenMap}>전체 지도 열기 ↗</button></div>
        <section className="bd-route-section" aria-labelledby="route-title"><div className="bd-section-title"><h2 id="route-title">코스를 따라 <span>Course stops</span></h2><span>{record.places.length}개의 장소</span></div>
          <button className="bd-text-button" onClick={() => { void shareCourse(record).then(setMessage).catch(() => setMessage('공유를 완료하지 못했어요. 다시 시도해 주세요.')); }}>코스 공유하기 ↗</button>
          <div className="bd-stops">{record.places.map((place, index) => <button className={`bd-stop ${selected?.id === place.id ? 'is-selected' : ''}`} key={place.id} aria-pressed={selected?.id === place.id} onClick={() => { setSelectedId(place.id); }}><span className="bd-stop-number">{String(index + 1).padStart(2, '0')}</span><div><strong>{place.name}</strong><span>{place.stay} 머묾</span></div><span className="bd-stop-arrow">↗</span></button>)}</div>
        </section>
        <section className="bd-story" aria-labelledby="story-title"><div className="bd-story-copy"><span className="bd-eyebrow">BEHIND THE COURSE</span><h2 id="story-title">이 코스에 남긴 이야기</h2><p>{record.note || '아직 코스 설명이 없습니다.'}</p><span className="bd-story-by">기록한 사람 · {record.author} <span>{record.handle}</span></span><button className="bd-save" onClick={save} disabled={saved}>{saved ? '✓ 이 브라우저에 저장됨' : '코스 저장하기 ↗'}</button><span className="bd-save-hint" role="status">{message || '이 기기의 브라우저에 저장됩니다.'}</span></div><div className="bd-photos">{record.images.slice(0, 2).map((source, index) => <Image key={index} source={source} accessibilityLabel={`${record.author}의 코스 사진 ${index + 1}`} style={{ flex: 1, minWidth: 0, height: 250, borderRadius: 8 }} resizeMode="cover" />)}</div></section>
        <footer className="bd-footer"><span>BeENoN <span>나의 걸음이 코스가 되는 곳</span></span><span>END OF COURSE</span></footer>
      </main>
    </div>
  );
}
