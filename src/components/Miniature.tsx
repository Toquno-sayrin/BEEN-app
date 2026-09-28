import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';
import type { MiniatureKind } from '../worldModel';

export function Miniature({kind,color='#80bfa7',size=1,rotation=0}:{kind:MiniatureKind;color?:string;size?:number;rotation?:number}) {
  return <Svg width={80} height={90} viewBox="-50 -55 100 110"><Ellipse cy={38} rx={35} ry={10} fill="#b8d4c5" opacity={0.4}/><G rotation={rotation} scale={size}>
    {kind==='laptop'?<><Path d="M-30-30L18-20V15L-30 5Z" fill="#344452"/><Path d="M-25-24L13-16V8L-25 0Z" fill={color}/><Path d="M-30 5L18 15 36 30-14 20Z" fill="#778b98"/><Path d="M-24 9L14 17 24 25-12 18Z" fill="#344452"/></>:kind==='lightstick'?<><Rect x={-4} y={0} width={8} height={35} rx={3} fill="#fff"/><Path d="M-18-30L0-40 18-30V-7L0 3-18-7Z" fill={color} stroke="#6c9769"/><Path d="M-18-30L0-20 18-30M0-20V3M-10-25V-7M10-25V-7" stroke="#e4ffd8" strokeWidth={2}/></>:<><Path d="M-34-7L12-24 37-4-9 15Z" fill="#fff" stroke={color}/><Path d="M-34-7L-9 15 37-4V4L-9 24-34 2Z" fill={color}/><Path d="M-20-6L-2-13 9-5-9 3Z" fill="#c2d1da"/><Path d="M-9-9L-1-2" stroke="#ae6b83" strokeWidth={2}/></>}
  </G></Svg>;
}
