const fs=require('fs'),path=require('path'),http=require('http'),{spawn}=require('child_process');
const root=path.resolve('dist-world-check');fs.mkdirSync('artifacts',{recursive:true});
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!p.startsWith(root+path.sep)){res.writeHead(403);res.end();return}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);res.end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.png':'image/png','.ttf':'font/ttf'})[path.extname(p)]||'application/octet-stream');res.end(b)})});
const wait=ms=>new Promise(r=>setTimeout(r,ms));let chrome,ws,id=0;const pending=new Map();
async function command(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))})}
async function evaluate(expression){const result=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value}
async function until(expression){for(let n=0;n<60;n++){if(await evaluate(expression))return;await wait(250)}throw Error('Timeout: '+expression)}
const click=text=>evaluate(`(()=>{const b=[...document.querySelectorAll('[role=button],button')].find(e=>(e.textContent===${JSON.stringify(text)}||e.getAttribute('aria-label')===${JSON.stringify(text)}));if(!b)throw Error('Missing button '+${JSON.stringify(text)});b.click()})()`);
(async()=>{
 await new Promise(r=>server.listen(4189,'127.0.0.1',r));
 chrome=spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=9231','--user-data-dir='+path.resolve('artifacts/world-browser'),'about:blank'],{windowsHide:true,stdio:'ignore'});
 let pages;for(let n=0;n<40;n++){try{pages=await(await fetch('http://127.0.0.1:9231/json')).json();break}catch{await wait(250)}}
 ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));ws.addEventListener('message',e=>{const p=JSON.parse(e.data);if(p.id){const cb=pending.get(p.id);pending.delete(p.id);p.error?cb.reject(p.error):cb.resolve(p.result)}});
 await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await command('Page.navigate',{url:'http://127.0.0.1:4189'});
 await until(`document.body.innerText.includes('내가 만든 세상')`);
 await click('모형으로 보기');await until(`document.body.innerText.includes('아직 비어 있는 내 세계')`);console.log('PASS empty world');
 const photo='data:image/png;base64,'+fs.readFileSync('assets/야식.png').toString('base64');
 const memory={id:'m1',place:{id:'p1',name:'테스트 카페',address:'서울',latitude:37.5,longitude:127,memo:'',stay:''},title:'테스트 기록',memo:'보관 확인',photo,kind:'laptop',rotation:0,size:1,color:'#80bfa7'};
 const data={memories:[memory,{...memory,id:'m2',title:'두 번째 기록',place:{...memory.place,id:'p2',latitude:37.51}}],courses:[{id:'c1',title:'테스트 코스',memoryIds:['m2']}]};
 await evaluate(`localStorage.setItem('been:world:v1',${JSON.stringify(JSON.stringify(data))})`);await command('Page.reload');await until(`document.body.innerText.includes('내가 만든 세상')`);await click('모형으로 보기');
 await until(`document.querySelectorAll('[aria-label="1. 테스트 기록"]').length===1`);console.log('PASS restore saved memories');
 await click('내 코스');await click('지도에서 보기');await until(`document.querySelector('[aria-label="1. 두 번째 기록"]')!==null && document.querySelector('[aria-label="1. 테스트 기록"]')===null`);console.log('PASS course filtering');
 await evaluate(`document.querySelector('[aria-label="1. 두 번째 기록"]').click()`);await click('자세히 보기');await click('기록·미니어처 편집');await click('회전 ↷');await click('내 세계에 저장');
 await until(`JSON.parse(localStorage.getItem('been:world:v1')).memories.find(m=>m.id==='m2').rotation===15`);console.log('PASS edit persistence');
 await click('자세히 보기');await click('삭제');await click('삭제 확인');await until(`JSON.parse(localStorage.getItem('been:world:v1')).memories.length===1`);if(!await evaluate(`JSON.parse(localStorage.getItem('been:world:v1')).courses[0].memoryIds.length===0`))throw Error('Course reference retained');console.log('PASS deletion updates course');
 await wait(400);
 await evaluate(`(()=>{const original=window.fetch;window.fetch=(url,options)=>String(url).includes('workers.dev/search')?Promise.resolve(new Response(JSON.stringify({places:[{id:'fixture',name:'테스트 장소',address:'서울 테스트 주소',latitude:37.53,longitude:127.03,category:'카페',memo:'',stay:''}]}),{status:200})):original(url,options)})()`);
 await click('추가');await until(`document.querySelector('[aria-label="장소 또는 주소"]')!==null`);
 await evaluate(`(()=>{const el=document.querySelector('[aria-label="장소 또는 주소"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'테스트');el.dispatchEvent(new Event('input',{bubbles:true}))})()`);
 await click('검색');await until(`document.body.innerText.includes('서울 테스트 주소')`);
 await evaluate(`(()=>{const el=[...document.querySelectorAll('[role=button]')].find(e=>e.textContent.includes('테스트 장소')&&e.textContent.includes('서울 테스트 주소'));el.click()})()`);
 await click('이 위치에 사진 남기기');await click('사진 선택 / 바꾸기');
 await until(`document.querySelector('input[type=file]')!==null`);
 const doc=await command('DOM.getDocument'),input=await command('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'input[type=file]'});
 await command('DOM.setFileInputFiles',{nodeId:input.nodeId,files:[path.resolve('assets/야식.png')]});
 await until(`document.querySelector('img[ src^="data:"]')!==null || [...document.querySelectorAll('img')].some(e=>e.src.startsWith('data:'))`);
 await click('미니어처 편집');await click('내 세계에 저장');await until(`JSON.parse(localStorage.getItem('been:world:v1')).memories.length===2`);
 console.log('PASS search fixture -> location -> actual photo upload -> save');await wait(400);
 const shot=await command('Page.captureScreenshot',{format:'png'});fs.writeFileSync('artifacts/world-mobile.png',Buffer.from(shot.data,'base64'));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{ws?.close();chrome?.kill();server.close()});
