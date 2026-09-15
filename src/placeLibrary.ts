import type { OutingPlace } from './types';
export type SavedPlace = OutingPlace & { folder: string };
export const PLACE_STORAGE_KEY = 'been:saved-places:v1';
export function isPlace(value: unknown): value is OutingPlace {
  if (!value || typeof value !== 'object') return false;
  const p = value as OutingPlace;
  return typeof p.id === 'string' && !!p.id && typeof p.name === 'string' && typeof p.address === 'string'
    && typeof p.memo === 'string' && typeof p.stay === 'string' && (p.category === undefined || typeof p.category === 'string')
    && Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90 && Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180;
}
export function parseSavedPlaces(raw: string | null): SavedPlace[] {
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every(p => isPlace(p) && 'folder' in p && typeof p.folder === 'string')) throw Error('저장된 장소를 읽지 못했어요.');
  return data;
}
export async function searchPlaces(query: string, signal: AbortSignal): Promise<OutingPlace[]> {
  const response = await fetch(`https://been-place-search.yearim0526.workers.dev/search?q=${encodeURIComponent(query.trim())}`, { signal });
  const body = await response.json();
  if (!response.ok) throw Error(typeof body.error === 'string' ? body.error : '검색에 실패했어요.');
  if (!Array.isArray(body.places) || !body.places.every(isPlace)) throw Error('검색 결과를 읽지 못했어요.');
  return body.places;
}
