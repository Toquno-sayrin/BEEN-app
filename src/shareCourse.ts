import { Platform, Share } from 'react-native';
import type { OutingRecord } from './types';

export async function shareCourse(record: OutingRecord) {
  const message = [`BeENoN · ${record.title}`, record.note, ...record.places.map((place, index) => `${index + 1}. ${place.name}\n${place.address}\nhttps://map.naver.com/p/search/${encodeURIComponent(place.name)}`)].filter(Boolean).join('\n\n');
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    if (navigator.share) { await navigator.share({ title: record.title, text: message }); return '공유 창을 열었어요.'; }
    if (navigator.clipboard) { await navigator.clipboard.writeText(message); return '코스와 장소 링크를 복사했어요.'; }
    throw new Error('이 브라우저에서는 공유를 사용할 수 없어요.');
  }
  await Share.share({ title: record.title, message });
  return '공유 창을 열었어요.';
}
