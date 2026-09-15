import type { OutingRecord } from '../types';
export type CourseMapProps = { record: OutingRecord; selectedPlaceId?: string; onSelectPlace?: (id: string) => void; detailTheme?: boolean };
export const naverClientId = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID?.trim() ?? '';
export const naverBaseUrl = process.env.EXPO_PUBLIC_NAVER_MAP_BASE_URL?.trim() ?? '';
export const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
export function mapDocument(record: OutingRecord, clientId: string) {
  const places = record.places.map((p, index) => ({ id: p.id, latitude: p.latitude, longitude: p.longitude, index }))
    .filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180);
  return `<!doctype html><html lang="ko"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#map{height:100%;margin:0}body{background:#FDE3EC;font:14px sans-serif}#status{position:absolute;top:12px;left:12px;padding:10px;background:white;border-radius:8px;z-index:10}.marker{width:36px;height:36px;border:3px solid white;border-radius:50%;background:#F6A8C4;color:#4A1A2C;font-weight:bold}.marker.selected{background:#E2578F;color:white}</style><div id="map"></div><div id="status" role="status">지도를 불러오는 중이에요.</div><script>
  const places=${scriptJson(places)};let markers=[],selected;const status=document.getElementById('status');
  function send(data){const payload=JSON.stringify(data);if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(payload);else parent.postMessage(payload,'*');}
  function fail(){status.hidden=false;status.textContent='지도를 불러오지 못했어요. 네이버 지도에서 열기를 이용해 주세요.';send({type:'error'});}
  window.navermap_authFailure=fail;
  const timer=setTimeout(fail,15000);
  function select(id){selected=id;markers.forEach((marker,i)=>marker.setIcon(icon(places[i])));}
  window.selectPlace=select;
  window.addEventListener('message',event=>{if(event.source!==parent)return;try{const data=JSON.parse(event.data);if(data.type==='select')select(data.id);}catch{}});
  function icon(p){return {content:'<button aria-label="장소 '+(p.index+1)+' 선택" class="marker '+(p.id===selected?'selected':'')+'">'+(p.index+1)+'</button>',anchor:new naver.maps.Point(18,18)};}
  function init(){try{const first=places[0];const map=new naver.maps.Map('map',{center:new naver.maps.LatLng(first?first.latitude:37.5665,first?first.longitude:126.978),zoom:14,zoomControl:true});
  const bounds=new naver.maps.LatLngBounds();places.forEach(p=>{const position=new naver.maps.LatLng(p.latitude,p.longitude);bounds.extend(position);const marker=new naver.maps.Marker({map,position,icon:icon(p)});naver.maps.Event.addListener(marker,'click',()=>{select(p.id);send({type:'select',id:p.id});});markers.push(marker);});
  if(places.length>1){map.fitBounds(bounds);new naver.maps.Polyline({map,path:places.map(p=>new naver.maps.LatLng(p.latitude,p.longitude)),strokeColor:'#F2789F',strokeOpacity:.8,strokeWeight:4});}
  clearTimeout(timer);status.hidden=true;send({type:'ready'});}catch{clearTimeout(timer);fail();}}
  const sdk=document.createElement('script');sdk.src='https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId='+encodeURIComponent(${scriptJson(clientId)});sdk.onload=init;sdk.onerror=()=>{clearTimeout(timer);fail();};document.head.appendChild(sdk);
  </script></html>`;
}
