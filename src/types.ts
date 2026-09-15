import type { ImageSourcePropType } from 'react-native';

export type TabKey = 'home' | 'map' | 'create' | 'profile' | 'settings';

export type Visibility = '나만 보기' | '친구 공개' | '전체 공개';

export type OutingPlace = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  stay: string;
  memo: string;
};

export type OutingRecord = {
  id: string;
  author: string;
  handle: string;
  date: string;
  title: string;
  note: string;
  location: string;
  mood: string[];
  images: ImageSourcePropType[];
  music: string[];
  visibility: Visibility;
  distance: string;
  duration: string;
  places: OutingPlace[];
};
