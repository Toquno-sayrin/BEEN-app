import { useEffect, useMemo, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { MapFallback } from './MapFallback';
import { mapDocument, naverBaseUrl, naverClientId, scriptJson, type CourseMapProps } from './naverMapDocument';
export function CourseMap(props: CourseMapProps) {
  const webview = useRef<WebView>(null);
  const html = useMemo(() => mapDocument(props.record, naverClientId), [props.record]);
  const selection = `window.selectPlace && window.selectPlace(${scriptJson(props.selectedPlaceId ?? '')});true;`;
  useEffect(() => { webview.current?.injectJavaScript(selection); }, [selection]);
  if (!naverClientId || !/^https?:\/\//.test(naverBaseUrl)) return <MapFallback {...props} />;
  return <WebView ref={webview} style={{ flex: 1 }} originWhitelist={['*']} source={{ html, baseUrl: naverBaseUrl }} javaScriptEnabled onMessage={event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ready') webview.current?.injectJavaScript(selection);
      if (data.type === 'select' && props.record.places.some(p => p.id === data.id)) props.onSelectPlace?.(data.id);
    } catch { /* Ignore unrelated messages. */ }
  }} />;
}
