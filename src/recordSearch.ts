import type { OutingRecord } from './types';

export type SearchMode = '코스' | '지역' | '테마';
export const courseThemes = ['라이딩', '러닝', '카페공부', '데이트', '산책'];
export function filterRecords(records: OutingRecord[], query: string, mode: SearchMode, theme = '') {
  const needle = query.trim().toLocaleLowerCase();
  return records.filter(record => {
    if (theme && !record.themes?.includes(theme)) return false;
    const fields = mode === '지역' ? [record.location, ...record.places.map(p => p.address)]
      : mode === '테마' ? record.themes ?? [] : [record.title, record.note, ...record.places.map(p => p.name)];
    return !needle || fields.some(field => field.toLocaleLowerCase().includes(needle));
  });
}
