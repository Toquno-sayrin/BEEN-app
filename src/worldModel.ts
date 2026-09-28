import type { OutingPlace } from './types';

export type MiniatureKind = 'laptop' | 'lightstick' | 'keepsake';
export type WorldMemory = {
  id: string; place: OutingPlace; title: string; memo: string;
  photo: string; kind: MiniatureKind; rotation: number; size: number; color: string;
};
export type WorldCourse = { id: string; title: string; memoryIds: string[] };
export type WorldData = { memories: WorldMemory[]; courses: WorldCourse[] };
export const WORLD_KEY = 'been:world:v1';
export const emptyWorld: WorldData = { memories: [], courses: [] };
export function parseWorld(raw: string | null): WorldData {
  if (!raw) return emptyWorld;
  const data = JSON.parse(raw) as WorldData;
  if (!data || !Array.isArray(data.memories) || !Array.isArray(data.courses)) throw Error('기록 형식을 확인해 주세요.');
  const ids = new Set<string>();
  for (const m of data.memories) {
    if (!m || typeof m.id !== 'string' || ids.has(m.id) || !m.place || typeof m.place.name !== 'string' || typeof m.place.address !== 'string' || typeof m.place.id !== 'string'
      || !Number.isFinite(m.place.latitude) || Math.abs(m.place.latitude)>90 || !Number.isFinite(m.place.longitude) || Math.abs(m.place.longitude)>180
      || !['title','memo','photo','color'].every(k=>typeof m[k as keyof WorldMemory]==='string')
      || !['laptop','lightstick','keepsake'].includes(m.kind) || !Number.isFinite(m.rotation) || Math.abs(m.rotation)>45 || !Number.isFinite(m.size) || m.size<0.65 || m.size>1.2 || !/^#[0-9a-f]{6}$/i.test(m.color)) throw Error('저장된 장소를 읽지 못했어요.');
    ids.add(m.id);
  }
  for (const c of data.courses) if (!c || typeof c.id!=='string' || typeof c.title!=='string' || !Array.isArray(c.memoryIds) || c.memoryIds.some(id=>!ids.has(id)) || new Set(c.memoryIds).size!==c.memoryIds.length) throw Error('저장된 코스를 읽지 못했어요.');
  return data;
}
export function removeMemory(data: WorldData, id: string): WorldData {
  return { memories: data.memories.filter(m=>m.id!==id), courses:data.courses.map(c=>({...c,memoryIds:c.memoryIds.filter(x=>x!==id)})) };
}
