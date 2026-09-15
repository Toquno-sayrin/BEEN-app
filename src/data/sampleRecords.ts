import type { OutingRecord } from '../types';

export const sampleRecord: OutingRecord = {
  id: 'outing-20260914',
  author: '예림',
  handle: '@been_yerim',
  date: '2026.09.14',
  title: '해 질 무렵, 천천히 걸었던 날',
  note: '선선해진 저녁, 음악을 들으며 오래 걸었다.',
  location: '저녁 산책 코스 · 샘플 위치',
  mood: ['여유', '노을', '공원'],
  images: [
    require('../../assets/outing-bridge.jpg'),
    require('../../assets/outing-park.jpg'),
  ],
  music: ['Inside My Love · RIIZE', 'My Friend · MARK'],
  visibility: '나만 보기',
  distance: '3.2 km',
  duration: '1시간 20분',
  places: [
    {
      id: 'place-1',
      name: '산책로 입구',
      address: '정확한 장소는 기록 작성 시 연결',
      latitude: 37.5446,
      longitude: 127.0378,
      stay: '15분',
      memo: '햇빛이 길게 들어오던 시작점',
    },
    {
      id: 'place-2',
      name: '잔디광장',
      address: '정확한 장소는 기록 작성 시 연결',
      latitude: 37.5462,
      longitude: 127.0402,
      stay: '35분',
      memo: '음악을 들으며 잠시 쉬었다.',
    },
    {
      id: 'place-3',
      name: '전망 구간',
      address: '정확한 장소는 기록 작성 시 연결',
      latitude: 37.5481,
      longitude: 127.0425,
      stay: '20분',
      memo: '도시의 불이 켜지기 시작했다.',
    },
  ],
};

export const discoveryRecords: OutingRecord[] = [
  {
    ...sampleRecord,
    id: 'discovery-1',
    author: '민지',
    handle: '@slow.weekend',
    title: '도시가 천천히 어두워지는 시간',
    note: '잔디에 앉아 있다가 불이 켜질 때쯤 한 바퀴 걸었어요.',
    visibility: '전체 공개',
  },
];
