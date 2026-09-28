import type { OutingPlace } from '../types';
export function miniatureMarker(place:OutingPlace,index:number,selected:boolean){
  const m=place.miniature;
  if(!m)return `<button aria-label="장소 ${index+1} 선택" style="width:36px;height:36px;border:3px solid white;border-radius:50%;background:${selected?'#28775f':'#2e98e7'};color:white">${index+1}</button>`;
  const color=/^#[0-9a-f]{6}$/i.test(m.color)?m.color:'#80bfa7';
  const rotation=Number.isFinite(m.rotation)?Math.max(-45,Math.min(45,m.rotation)):0,size=Number.isFinite(m.size)?Math.max(.65,Math.min(1.2,m.size)):1;
  const shape=m.kind==='laptop'?`<path d="M-25-25L18-15V14L-25 4Z" fill="#344452"/><path d="M-20-19L13-11V7L-20 0Z" fill="${color}"/><path d="M-25 4L18 14 33 26-10 18Z" fill="#647784"/>`:m.kind==='lightstick'?`<path d="M-4 0H4V30H-4Z" fill="white"/><path d="M-16-26L0-35 16-26V-6L0 2-16-6Z" fill="${color}" stroke="#669a76"/>`:`<path d="M-29-5L9-20 31-2-7 15V21L-29 1Z" fill="${color}"/><path d="M-29-5L9-20 31-2-7 15Z" fill="white" stroke="${color}"/><path d="M-10-9L-2-3" stroke="#ad728b" stroke-width="3"/>`;
  return `<button aria-label="장소 ${index+1} 선택" style="width:76px;height:88px;border:0;border-radius:20px;background:${selected?'#ffffffdd':'transparent'};color:#28775f"><svg width="68" height="64" viewBox="-45 -40 90 85"><ellipse cy="30" rx="34" ry="9" fill="#d9ece3"/><g transform="rotate(${rotation}) scale(${size})">${shape}</g></svg><span>${index+1}</span></button>`;
}
