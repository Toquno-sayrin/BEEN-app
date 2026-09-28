// Browser-only interaction prototype. Search coordinates and miniatures are samples.
(() => {
  const samples = memories.map((m,i)=>({...m,shape:i}));
  const positions = [[104,291],[251,303],[175,392]];
  memories.forEach((m,i)=>Object.assign(m,{shape:i,rotation:0,size:1,tone:0,position:positions[i],location:'위치 미지정 · 예시 기록'}));
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let draft=null, editing=null;
  const urls=[];
  const button=(id,label)=>`<button class="memory-action" id="${id}">${label}</button>`;
  const on=(id,handler)=>content.querySelector('#'+id).onclick=handler;
  function panel(step,title,body){openPanel(`<p class="step">${step}</p><h3>${title}</h3>${body}`)}
  function shape(m){return `<g transform="rotate(${m.rotation}) scale(${m.size})" style="filter:hue-rotate(${m.tone}deg)">${miniatureShapes[m.shape]}</g>`}
  function renderMap(){
    movementMap.querySelectorAll('.place').forEach(el=>el.remove());
    memories.forEach((m,i)=>{
      const g=document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('class','place');g.setAttribute('transform',`translate(${m.position.join(' ')})`);
      g.setAttribute('tabindex','0');g.setAttribute('role','button');g.setAttribute('aria-label',m.title+' 보기');
      g.dataset.place=i;g.innerHTML=`<ellipse cy="35" rx="38" ry="12" fill="#fff" stroke="#cbded7"/>${shape(m)}<circle class="badge" cy="-65" r="12"/><text class="number" y="-61" text-anchor="middle">${i+1}</text>`;
      g.onclick=()=>showMemory(i);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showMemory(i)}};
      movementMap.insertBefore(g,movingAvatar);
    });
  }
  function search(){
    panel('01 / 04 · 장소','어디에 남길까요?',`<form id="location-form"><label>장소 또는 주소<input id="location" maxlength="100" required placeholder="예: 성수 카페 / 서울 성동구…"></label>${button('search-location','위치 찾기')}</form><p>검색·좌표는 예시입니다. 네이버 API는 연결하지 않았어요.</p><div id="location-results"></div>`);
    content.querySelector('#location-form').onsubmit=e=>{
      e.preventDefault();const value=content.querySelector('#location').value.trim();if(!value)return;
      const results=content.querySelector('#location-results');results.replaceChildren();
      const b=document.createElement('button');b.className='result';b.textContent=value+' · 예시 위치 확인';
      b.onclick=()=>{draft.location=value;locationPreview()};results.append(b);
    };
  }
  function locationPreview(){
    panel('01 / 04 · 위치 확인',escape(draft.location),`<p>아래 예시 지도에서 초록 핀을 눌러 선택하세요.</p><svg viewBox="0 0 280 100" class="location-preview" aria-label="실제 좌표가 아닌 위치 선택 예시"><rect width="280" height="100" rx="14" fill="#e8f2ef"/><path d="M0 30H280M90 0V100M210 0V100" stroke="white" stroke-width="12"/><g id="location-pin" role="button" tabindex="0" aria-label="이 위치 선택"><circle cx="140" cy="45" r="18" fill="#389c83"/><path d="M132 58L140 73 148 58" fill="#389c83"/><circle cx="140" cy="45" r="6" fill="white"/></g></svg><button class="result" id="search-back">다시 검색</button>`);
    on('location-pin',photoStep);content.querySelector('#location-pin').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();photoStep()}};on('search-back',search);
  }
  function photoStep(){
    panel('02 / 04 · 사진과 대상','어떤 순간을 남길까요?',`<div class="sample-photos">${samples.map((m,i)=>`<button class="sample-photo" data-sample="${i}" aria-label="${escape(m.subject)} 사진 선택"><img src="${m.photo}" alt="${escape(m.subject)}"><span>${escape(m.subject)}</span></button>`).join('')}</div><label>내 사진 선택<input type="file" id="photo-file" accept="image/png,image/jpeg,image/webp"></label><p id="upload-error" role="status"></p><div id="photo-choice"></div><p>사진은 서버로 전송되지 않습니다. 새로고침하면 추가한 기록이 사라집니다.</p>`);
    content.querySelectorAll('[data-sample]').forEach(b=>b.onclick=()=>{const m=samples[Number(b.dataset.sample)];Object.assign(draft,{photo:m.photo,shape:m.shape,subject:m.subject});photoChoice()});
    content.querySelector('#photo-file').onchange=e=>{
      const file=e.target.files[0];if(!file)return;
      const error=content.querySelector('#upload-error');
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15*1024*1024){error.textContent='15MB 이하 JPG, PNG, WebP 사진을 선택해 주세요.';return}
      const url=URL.createObjectURL(file),test=new Image(),current=draft;
      test.onload=()=>{if(draft!==current||!content.querySelector('#photo-choice')){URL.revokeObjectURL(url);return}urls.push(url);draft.photo=url;error.textContent='';photoChoice()};
      test.onerror=()=>{URL.revokeObjectURL(url);if(error.isConnected)error.textContent='사진을 읽을 수 없어요. 다른 파일을 선택해 주세요.'};test.src=url;
    };
    if(draft.photo)photoChoice();
  }
  function photoChoice(){
    content.querySelector('#photo-choice').innerHTML=`<img class="memory-photo" src="${escape(draft.photo)}" alt="선택한 원본 사진"><label>미니어처 대상 (예시)<select id="subject">${samples.map((m,i)=>`<option value="${i}" ${i===draft.shape?'selected':''}>${escape(m.subject)}</option>`).join('')}</select></label><p>자동 대상 추출·3D 생성 대신 준비된 모형을 사용합니다.</p>${button('preview-model','예시 미니어처 만들기')}`;
    on('preview-model',()=>{draft.shape=Number(content.querySelector('#subject').value);draft.subject=samples[draft.shape].subject;editor()});
  }
  function editor(){
    panel('03 / 04 · 미니어처 편집','내 세계에 어울리게',`<svg class="model-preview" viewBox="-90 -85 180 150" aria-label="미니어처 편집 미리보기"><ellipse cy="45" rx="55" ry="15" fill="#dcebe5"/><g id="model">${shape(draft)}</g></svg><p>SVG 시안입니다. 회전은 평면 회전이며 실제 3D 조작은 아닙니다.</p>${[['rotation','회전',-45,45,1],['size','크기',0.65,1.2,0.05],['tone','색감',-90,90,1]].map(([key,label,min,max,step])=>`<label>${label}<input type="range" data-edit="${key}" min="${min}" max="${max}" step="${step}" value="${draft[key]}"></label>`).join('')}<label>기록 제목<input id="record-title" maxlength="60" value="${escape(draft.title)}" placeholder="이 순간의 이름"></label><label>메모<textarea id="record-memo" maxlength="1000" placeholder="짧게 남겨보세요">${escape(draft.memo)}</textarea></label>${button('save-memory',editing===null?'내 세계에 놓기':'변경 저장')}<button class="result" id="replace-photo">사진·대상 바꾸기</button>`);
    content.querySelectorAll('[data-edit]').forEach(input=>input.oninput=()=>{draft[input.dataset.edit]=Number(input.value);content.querySelector('#model').innerHTML=shape(draft)});
    function capture(){draft.title=content.querySelector('#record-title').value.trim();draft.memo=content.querySelector('#record-memo').value.trim()}
    on('replace-photo',()=>{capture();photoStep()});
    on('save-memory',()=>{
      capture();if(!draft.title)draft.title=draft.subject+' 기록';
      let index=editing;
      if(index===null){index=memories.length;memories.push({...draft});places.push({id:'demo-'+index,name:draft.subject,address:draft.location,category:'사진 기록',memo:draft.memo})}
      else {memories[index]={...draft};Object.assign(places[index],{name:draft.subject,memo:draft.memo,address:draft.location})}
      renderMap();draft=null;editing=null;showMemory(index);
    });
  }
  showMemory=(i,detail=false)=>{
    const m=memories[i];if(!m)return;
    movementMap.querySelectorAll('.place').forEach(el=>el.classList.toggle('selected',Number(el.dataset.place)===i));
    if(detail){
      panel('04 / 04 · 내 기록',escape(m.title),`<img class="memory-photo" src="${escape(m.photo)}" alt="${escape(m.subject)} 원본 사진"><p>${escape(m.location)}</p><p>대상: ${escape(m.subject)}</p><p class="memo-text">${escape(m.memo||'아직 메모가 없어요.')}</p>${button('edit-memory','미니어처·기록 편집')}<button class="result" id="back-memory">사진 카드로 돌아가기</button>`);
      on('edit-memory',()=>{editing=i;draft={...m};editor()});on('back-memory',()=>showMemory(i));
    }else{
      openPanel(`<div class="memory-preview"><img src="${escape(m.photo)}" alt="${escape(m.subject)} 원본 사진"><div><h3>${escape(m.title)}</h3><p>${escape(m.location)}</p>${button('detail-memory','자세히 보기 →')}</div></div>`);on('detail-memory',()=>showMemory(i,true));
    }
  };
  document.querySelector('[data-action="add"]').onclick=()=>{
    editing=null;const n=memories.length-3;
    draft={title:'',memo:'',photo:'',shape:0,subject:'노트북',rotation:0,size:1,tone:0,position:[65+(n%3)*110,365+Math.floor(n/3)%2*85],location:''};search();
  };
  window.addEventListener('beforeunload',()=>urls.forEach(url=>URL.revokeObjectURL(url)));
  renderMap();
})();
