import { Linking, Platform } from 'react-native';
import type { OutingPlace } from './types';

// Expo Go identifies the host app; standalone builds should supply their registered identifier.
const appName = Platform.OS === 'ios' ? 'host.exp.Exponent' : 'host.exp.exponent';
export async function openNaverMap(query: string, place?: OutingPlace) {
  const search = query.trim();
  if (!search) return;
  const fallback = `https://map.naver.com/p/search/${encodeURIComponent(search)}`;
  const valid = place && Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
    && place.latitude >= 31.43 && place.latitude <= 44.35 && place.longitude >= 122.37 && place.longitude <= 132;
  const scheme = valid
    ? `nmap://place?lat=${place.latitude}&lng=${place.longitude}&name=${encodeURIComponent(place.name)}&appname=${appName}`
    : `nmap://search?query=${encodeURIComponent(search)}&appname=${appName}`;
  if (Platform.OS !== 'web') {
    try { await Linking.openURL(scheme); return; } catch { /* Fall back to the web map when the app is absent. */ }
  }
  await Linking.openURL(fallback);
}
