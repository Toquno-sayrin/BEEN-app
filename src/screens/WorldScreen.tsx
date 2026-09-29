import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import Svg, { Path, Polyline } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Brand } from '../components/Brand';
import { CourseMap } from '../components/CourseMap';
import { Miniature } from '../components/Miniature';
import { searchPlaces } from '../placeLibrary';
import { colors, gradients } from '../theme';
import type { OutingPlace, OutingRecord } from '../types';
import { emptyWorld, parseWorld, removeMemory, WORLD_KEY, type WorldCourse, type WorldData, type WorldMemory } from '../worldModel';

type Props = { adding: boolean; onHome: () => void; records: OutingRecord[]; onOpenRecord: (record: OutingRecord) => void };
type Panel = 'search'|'location'|'photo'|'edit'|'detail'|'courses'|'compose'|'delete'|null;
const uid=()=>`${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
const kinds = [{key:'laptop',label:'노트북'},{key:'lightstick',label:'야광봉'},{key:'keepsake',label:'기념품'}] as const;
const makeRecord=(places:OutingPlace[]):OutingRecord=>({id:'world-map',author:'',handle:'',title:'내 세계',date:'',note:'',location:'',images:[],visibility:'나만 보기',distance:'',duration:'',places});
function Button({label,onPress,disabled=false}:{label:string;onPress:()=>void;disabled?:boolean}){return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={disabled&&{opacity:.4}}><LinearGradient colors={gradients.button} start={{x:0,y:0}} end={{x:1,y:0}} style={s.button}><Text style={s.buttonText}>{label}</Text></LinearGradient></Pressable>}

export function WorldScreen({adding,onHome,records,onOpenRecord}:Props){
  const [data,setData]=useState<WorldData>(emptyWorld),[ready,setReady]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false),[writing,setWriting]=useState(false);
  const [panel,setPanel]=useState<Panel>(null),[query,setQuery]=useState(''),[results,setResults]=useState<OutingPlace[]>([]),[searched,setSearched]=useState(false);
  const [draft,setDraft]=useState<WorldMemory|null>(null),[selectedId,setSelectedId]=useState<string>(),[courseId,setCourseId]=useState<string>();
  const [courseTitle,setCourseTitle]=useState(''),[courseItems,setCourseItems]=useState<string[]>([]),[photoBusy,setPhotoBusy]=useState(false);
  const [avatar,setAvatar]=useState({x:175,y:385});
  const [geographic,setGeographic]=useState(true);
  const [area,setArea]=useState({width:360,height:460});
  const request=useRef<AbortController|null>(null),lock=useRef(false),alive=useRef(true),photoRequest=useRef(0);
  useEffect(()=>{alive.current=true;void AsyncStorage.getItem(WORLD_KEY).then(raw=>{if(alive.current){setData(parseWorld(raw));setReady(true)}}).catch(()=>{if(alive.current)setError('기록을 읽지 못했어요. 앱을 다시 열어 주세요. 원본은 보존됩니다.')});return()=>{alive.current=false;request.current?.abort();photoRequest.current++}},[]);
  useEffect(()=>{if(adding){setPanel('search');setQuery('');setResults([]);setSearched(false);setError('');setSelectedId(undefined)}},[adding]);
  const close=()=>{if(lock.current)return;request.current?.abort();request.current=null;photoRequest.current++;setBusy(false);setPhotoBusy(false);setPanel(null);setDraft(null);onHome()};
  async function persist(next:WorldData){
    if(!ready){setError('기록 저장소가 준비되지 않았어요. 앱을 다시 열어 주세요.');return false}if(lock.current)return false;lock.current=true;setWriting(true);setError('');
    try{await AsyncStorage.setItem(WORLD_KEY,JSON.stringify(next));if(alive.current)setData(next);return true}
    catch(e){console.error('World storage write failed',e);const message='저장하지 못했어요. 저장 공간을 확인하고 다시 시도해 주세요.';setError(message);if(Platform.OS!=='web')Alert.alert('저장 실패',message);return false}
    finally{lock.current=false;if(alive.current)setWriting(false)}
  }
  const course=data.courses.find(c=>c.id===courseId);
  const visible=useMemo(()=>course?course.memoryIds.flatMap(id=>data.memories.find(m=>m.id===id)??[]):data.memories,[data,course]);
  const selected=visible.find(m=>m.id===selectedId);
  const worldRecord=useMemo(()=>makeRecord(visible.map(m=>({...m.place,id:m.id,memo:m.memo,miniature:{kind:m.kind,color:m.color,size:m.size,rotation:m.rotation}}))),[visible]);
  // A decorative world layout; real positions are shown in the location preview.
  const points=visible.map((m,i)=>({m,x:55+(i%3)*112,y:150+Math.floor(i/3)*115}));
  const canvasHeight=Math.max(460,240+Math.ceil(visible.length/3)*115);
  const locationRecord=useMemo(()=>makeRecord(draft?[draft.place]:[]),[draft?.place]);
  async function search(){
    const q=query.trim();if(!q)return;request.current?.abort();const controller=new AbortController();request.current=controller;setBusy(true);setError('');setSearched(true);setResults([]);
    const timeout=setTimeout(()=>controller.abort(),12000);
    try{const places=await searchPlaces(q,controller.signal);if(request.current===controller&&!controller.signal.aborted)setResults(places)}
    catch(e){if(request.current===controller)setError(controller.signal.aborted?'검색 시간이 초과됐어요. 다시 시도해 주세요.':e instanceof Error?e.message:'검색에 실패했어요.')}
    finally{clearTimeout(timeout);if(request.current===controller){setBusy(false);request.current=null}}
  }
  function choose(place:OutingPlace){setDraft({id:uid(),place,title:place.name,memo:'',photo:'',kind:'laptop',rotation:0,size:1,color:'#7abdf0'});setPanel('location')}
  async function photo(){
    const token=++photoRequest.current;setPhotoBusy(true);setError('');
    try{
      if(Platform.OS!=='web'){
        const perm=await ImagePicker.requestMediaLibraryPermissionsAsync();
        if(!perm.granted){
          if(photoRequest.current===token)setError(perm.canAskAgain?'사진 접근 권한을 허용해야 사진을 선택할 수 있어요.':'사진 접근 권한이 꺼져 있어요. 설정 > Expo Go > 사진에서 허용해 주세요.');
          return;
        }
      }
      const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:.7,base64:Platform.OS==='web'});
      if(result.canceled||photoRequest.current!==token)return;
      const asset=result.assets[0];if((asset.fileSize??0)>15*1024*1024)throw Error('15MB 이하 사진을 선택해 주세요.');
      let uri=asset.uri;
      if(Platform.OS==='web'){if(!asset.base64)throw Error('사진을 읽지 못했어요.');uri=`data:${asset.mimeType??'image/jpeg'};base64,${asset.base64}`}
      else {const source=new File(uri),destination=new File(Paths.document,`been-${uid()}.${source.extension.replace('.','')||'jpg'}`);source.copy(destination);uri=destination.uri}
      if(photoRequest.current===token&&alive.current)setDraft(d=>d?{...d,photo:uri}:null);
    }catch(e){if(photoRequest.current===token)setError(e instanceof Error?e.message:'사진을 열지 못했어요.')}
    finally{if(photoRequest.current===token)setPhotoBusy(false)}
  }
  async function save(){Keyboard.dismiss();if(!draft||!draft.photo){setError('저장할 사진이 없어요. 사진을 다시 선택해 주세요.');return;}const m={...draft,title:draft.title.trim()||draft.place.name};const next={...data,memories:[...data.memories.filter(x=>x.id!==m.id),m]};if(await persist(next)){setCourseId(undefined);setSelectedId(m.id);close()}}
  async function share(c:WorldCourse){try{await Share.share({message:[c.title,...c.memoryIds.flatMap((id,i)=>{const m=data.memories.find(x=>x.id===id);return m?[`${i+1}. ${m.place.name}\n${m.place.address}\n${m.memo}\nhttps://map.naver.com/p/search/${encodeURIComponent(m.place.name)}`]:[]})].join('\n\n')})}catch{setError('공유를 열지 못했어요.')}}
  const update=(patch:Partial<WorldMemory>)=>setDraft(d=>d?{...d,...patch}:null);
  return <View style={s.screen}><Pressable accessibilityRole="button" accessibilityLabel="내 세계로" onPress={()=>{setCourseId(undefined);setSelectedId(undefined)}}><Brand/></Pressable>
    <View style={s.heading}><View style={s.row}><Button label="내 코스" onPress={()=>{setPanel('courses');setError('')}}/><Button label={geographic?'모형으로 보기':'실제 지도'} onPress={()=>setGeographic(v=>!v)}/>{course&&<Button label="내 세계로" onPress={()=>{setCourseId(undefined);setSelectedId(undefined)}}/>}</View></View>
    {!!error&&!panel&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {geographic?<View style={{flex:1,paddingBottom:90}}><CourseMap record={worldRecord} fitZoomLimit={14} selectedPlaceId={selectedId} onSelectPlace={setSelectedId} showRoute={!!course}/>{!visible.length&&<Text style={{padding:16}}>하단 추가를 눌러 첫 장소를 남겨보세요.</Text>}</View>:<ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:selected?240:100}}>
      <View onLayout={e=>setArea({width:e.nativeEvent.layout.width,height:canvasHeight})} style={{height:canvasHeight,backgroundColor:'#edf6fa'}}>
        <Pressable accessibilityLabel="캐릭터 이동 영역" style={StyleSheet.absoluteFill} onPress={e=>setAvatar({x:Math.max(15,Math.min(area.width-45,e.nativeEvent.locationX-18)),y:Math.max(90,Math.min(canvasHeight-60,e.nativeEvent.locationY-28))})}>
          <Svg width="100%" height="100%" viewBox={`0 0 360 ${canvasHeight}`} preserveAspectRatio="none"><Path d={`M-20 350Q120 210 380 390V${canvasHeight}H0Z`} fill="#d5ebf7"/><Path d="M-20 175L190 80 390 185 175 295Z" fill="#e6edf4"/><Path d="M0 220L290 95M55 140L290 260" stroke="white" strokeWidth={16}/>{course&&points.length>1&&<Polyline points={points.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#389c83" strokeWidth={3} strokeDasharray="5 5"/>}</Svg>
        </Pressable>
        {points.map(({m,x,y},i)=><Pressable key={m.id} accessibilityRole="button" accessibilityLabel={`${i+1}. ${m.title}`} accessibilityState={{selected:selectedId===m.id}} onPress={()=>setSelectedId(m.id)} style={[s.mini,{left:`${x/360*100}%`,top:y-45},selectedId===m.id&&s.chosen]}><Miniature kind={m.kind} color={m.color} size={m.size} rotation={m.rotation}/><Text style={s.marker}>{i+1} · {m.place.name}</Text></Pressable>)}
        {!course&&<View pointerEvents="none" style={[s.avatar,{left:avatar.x,top:avatar.y}]}><Text style={{fontSize:32}}>🧑🏻</Text><Text style={s.hint}>나</Text></View>}
        {!visible.length&&<View style={s.empty}><Text style={s.title}>{ready?'아직 비어 있는 내 세계':'기록을 불러오는 중…'}</Text><Text style={s.hint}>하단 추가를 눌러 첫 장소를 남겨보세요.</Text></View>}
        <Text pointerEvents="none" style={s.mapNote}>기록 모형 배치 · 실제 지형은 장소 지도에서 확인</Text>
      </View>
    </ScrollView>}
    {selected&&<View style={s.preview}><Pressable accessibilityLabel="사진 카드 닫기" onPress={()=>setSelectedId(undefined)} style={s.close}><Text>×</Text></Pressable><Image source={{uri:selected.photo}} style={s.thumb}/><View style={{flex:1,gap:8}}><Text numberOfLines={2} style={s.title}>{selected.title}</Text><Text numberOfLines={1} style={s.hint}>{selected.place.name}</Text><Button label="자세히 보기" onPress={()=>setPanel('detail')}/></View></View>}
    <Modal visible={panel!==null} transparent animationType="slide" onRequestClose={close}><KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={s.modal}><View style={s.sheet}><View style={s.row}><Text style={s.title}>{({search:'장소 찾기',location:'위치 확인',photo:'사진과 대상',edit:'미니어처 편집',detail:'내 기록',courses:'내 코스',compose:'코스 만들기',delete:'기록 삭제'} as const)[panel??'search']}</Text><Button label="닫기" disabled={writing} onPress={close}/></View><ScrollView style={{flex:1}} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{gap:12,paddingBottom:24}}>
      {!!error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {panel==='search'&&<><LinearGradient colors={gradients.search} start={{x:0,y:0}} end={{x:1,y:0}} style={s.searchBorder}><TextInput accessibilityLabel="장소 또는 주소" placeholder="지역과 장소명 또는 주소" value={query} onChangeText={setQuery} maxLength={100} onSubmitEditing={()=>void search()} style={s.searchInput}/></LinearGradient><Button label={busy?'검색 중…':'검색'} disabled={busy||!query.trim()||!ready} onPress={()=>void search()}/><Text style={s.hint}>네이버 장소 검색 · 주소만으로 찾지 못하면 장소명을 함께 입력해 주세요.</Text>{results.map(p=><Pressable accessibilityRole="button" key={p.id} onPress={()=>choose(p)} style={s.card}><Text>{p.name}</Text><Text style={s.hint}>{p.address}</Text></Pressable>)}{searched&&!busy&&!results.length&&!error&&<Text>검색 결과가 없어요.</Text>}</>}
      {panel==='location'&&draft&&<><Text>{draft.place.name}</Text><Text>{draft.place.address}</Text><View style={{height:240}}><CourseMap record={locationRecord} selectedPlaceId={draft.place.id} onSelectPlace={()=>setPanel('photo')} showRoute={false}/></View><Button label="이 위치에 사진 남기기" onPress={()=>setPanel('photo')}/><Button label="다시 검색" onPress={()=>setPanel('search')}/></>}
      {panel==='photo'&&draft&&<><Button label={photoBusy?'사진을 여는 중…':'사진 선택 / 바꾸기'} disabled={photoBusy} onPress={()=>void photo()}/>{!!draft.photo&&<Image source={{uri:draft.photo}} style={s.photo}/>}<Text>미니어처 대상</Text><View style={s.row}>{kinds.map(k=><Button key={k.key} label={(draft.kind===k.key?'✓ ':'')+k.label} onPress={()=>update({kind:k.key})}/>)}</View><Text style={s.hint}>현재는 선택한 대상의 예시 모형을 사용합니다. 사진 자동 분석·3D 생성은 아직 연결하지 않았어요.</Text><Button label="미니어처 편집" disabled={!draft.photo||photoBusy} onPress={()=>setPanel('edit')}/></>}
      {panel==='edit'&&draft&&<><View style={{alignItems:'center'}}><Miniature kind={draft.kind} color={draft.color} rotation={draft.rotation} size={draft.size}/></View><Text style={s.hint}>평면 미니어처 회전 · {draft.rotation}° / 크기 {Math.round(draft.size*100)}%</Text><View style={s.row}><Button label="↶ 회전" onPress={()=>update({rotation:Math.max(-45,draft.rotation-15)})}/><Button label="회전 ↷" onPress={()=>update({rotation:Math.min(45,draft.rotation+15)})}/><Button label="작게" onPress={()=>update({size:Math.max(.65,draft.size-.1)})}/><Button label="크게" onPress={()=>update({size:Math.min(1.2,draft.size+.1)})}/></View><View style={s.row}>{['#bbd5fc','#7abdf0','#8dbab0'].map((color,i)=><Button key={color} label={(draft.color===color?'✓ ':'')+['하늘','파랑','초록'][i]} onPress={()=>update({color})}/>)}</View><TextInput accessibilityLabel="기록 제목" style={s.input} value={draft.title} onChangeText={title=>update({title})} maxLength={60} placeholder="기록 제목"/><TextInput accessibilityLabel="기록 메모" style={s.input} value={draft.memo} onChangeText={memo=>update({memo})} multiline maxLength={1000} placeholder="메모 (선택)"/><Button label="사진·대상 바꾸기" disabled={writing} onPress={()=>setPanel('photo')}/></>}
      {panel==='detail'&&selected&&<><Image source={{uri:selected.photo}} style={s.photo}/><Text style={s.title}>{selected.title}</Text><Text>{selected.place.name}</Text><Text>{selected.place.address}</Text><Text>{selected.place.category||'미분류'}</Text><Text>{selected.memo||'아직 메모가 없어요.'}</Text><Button label="기록·미니어처 편집" onPress={()=>{setDraft({...selected});setPanel('edit')}}/><Button label="장소 지도 보기" onPress={()=>{setDraft({...selected});setPanel('location')}}/><Button label="삭제" onPress={()=>setPanel('delete')}/></>}
      {panel==='delete'&&selected&&<><Text>이 기록을 삭제할까요? 코스에 포함된 방문 항목도 제거됩니다.</Text><Button label="삭제 확인" disabled={writing} onPress={()=>{void persist(removeMemory(data,selected.id)).then(ok=>{if(ok){setSelectedId(undefined);close()}})}}/><Button label="취소" disabled={writing} onPress={()=>setPanel('detail')}/></>}
      {panel==='courses'&&<><Button label="기록을 묶어 코스 만들기" disabled={!data.memories.length||!ready} onPress={()=>{setCourseItems([]);setCourseTitle('');setPanel('compose')}}/>{!data.courses.length&&<Text>아직 만든 코스가 없어요.</Text>}{data.courses.map(c=><View key={c.id} style={s.card}><Text style={s.title}>{c.title}</Text><Text>{c.memoryIds.length}개의 방문 기록</Text><View style={s.row}><Button label="지도에서 보기" onPress={()=>{setCourseId(c.id);setSelectedId(undefined);close()}}/><Button label="공유" onPress={()=>void share(c)}/></View></View>)}{records.length>0&&<Text style={s.hint}>기존 코스 기록</Text>}{records.map(r=><Button key={r.id} label={r.title} onPress={()=>{close();onOpenRecord(r)}}/>)}<Text style={s.hint}>연결선은 방문 순서입니다. 공유는 제목·장소·메모를 텍스트로 전달합니다.</Text></>}
      {panel==='compose'&&<><TextInput style={s.input} accessibilityLabel="코스 제목" value={courseTitle} onChangeText={setCourseTitle} maxLength={60} placeholder="코스 제목"/><Text style={s.hint}>방문 순서대로 선택하세요. 다시 누르면 제외됩니다.</Text>{data.memories.map(m=><Button key={m.id} label={`${courseItems.includes(m.id)?courseItems.indexOf(m.id)+1+' · ':''}${m.title}`} onPress={()=>setCourseItems(ids=>ids.includes(m.id)?ids.filter(x=>x!==m.id):[...ids,m.id])}/>)}<Button label="코스 저장" disabled={!courseTitle.trim()||!courseItems.length||writing} onPress={()=>{const c={id:uid(),title:courseTitle.trim(),memoryIds:courseItems};void persist({...data,courses:[...data.courses,c]}).then(ok=>{if(ok){setCourseId(c.id);setSelectedId(undefined);close()}})}}/></>}
    </ScrollView>
      {panel==='edit'&&<View style={s.saveFooter}>
        {!ready&&<Text accessibilityRole="alert" style={s.error}>저장소를 준비하지 못했어요. 앱을 다시 열어 주세요.</Text>}
        {!!error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        <Button label={writing?'저장 중…':'내 세계에 저장'} disabled={writing||photoBusy} onPress={()=>void save()}/>
      </View>}
    </View></KeyboardAvoidingView></Modal>
  </View>;
}
const s=StyleSheet.create({screen:{flex:1,backgroundColor:colors.paper},heading:{paddingHorizontal:20,gap:7,paddingBottom:8},title:{fontSize:17,fontWeight:'600',color:colors.ink},hint:{fontSize:11,color:colors.muted,lineHeight:18},row:{flexDirection:'row',flexWrap:'wrap',gap:8,alignItems:'center',justifyContent:'space-between'},button:{minHeight:42,paddingHorizontal:13,paddingVertical:10,borderRadius:13,justifyContent:'center'},buttonText:{color:colors.ink,fontSize:12,fontWeight:'600'},searchBorder:{borderRadius:999,padding:2},searchInput:{backgroundColor:'white',borderRadius:997,padding:13,color:colors.ink},mini:{position:'absolute',width:90,marginLeft:-45,alignItems:'center',borderRadius:20},chosen:{backgroundColor:'#ffffffc9',borderWidth:1,borderColor:colors.brand},marker:{fontSize:10,color:'#365d50',maxWidth:100,textAlign:'center'},avatar:{position:'absolute',alignItems:'center'},empty:{position:'absolute',top:45,left:20,right:20,alignItems:'center',gap:10},mapNote:{position:'absolute',bottom:12,alignSelf:'center',fontSize:10,color:colors.muted},preview:{position:'absolute',bottom:94,left:16,right:16,padding:16,backgroundColor:'#fffffff2',borderRadius:24,flexDirection:'row',gap:12,elevation:5,shadowColor:'#42636f',shadowOpacity:.12,shadowRadius:15},thumb:{width:95,height:115,borderRadius:13},close:{position:'absolute',right:8,top:4,zIndex:2,padding:8},modal:{flex:1,justifyContent:'flex-end',backgroundColor:'#18353a44'},saveFooter:{paddingTop:12,borderTopWidth:1,borderTopColor:colors.line,gap:6},sheet:{height:'88%',backgroundColor:colors.paper,padding:20,paddingBottom:30,borderTopLeftRadius:26,borderTopRightRadius:26,gap:16},input:{borderWidth:1,borderColor:colors.line,backgroundColor:'white',borderRadius:13,padding:13,color:colors.ink},card:{padding:14,backgroundColor:'white',borderRadius:14,gap:8},photo:{width:'100%',height:220,resizeMode:'contain',backgroundColor:colors.primarySoft,borderRadius:15},error:{padding:12,color:'#a04040',fontSize:12}});
