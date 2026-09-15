const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const root = path.resolve('dist-course-detail');
const server = http.createServer((req,res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) {res.writeHead(403);res.end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type', ({'.html':'text/html','.js':'application/javascript','.ttf':'font/ttf','.jpg':'image/jpeg'})[path.extname(file)] || 'application/octet-stream');res.end(data);});
});
const driverPath=process.env.CHROMEDRIVER_PATH || fs.readdirSync('artifacts/browser/chromedriver',{recursive:true}).filter(p=>p.endsWith('chromedriver.exe')).map(p=>path.resolve('artifacts/browser/chromedriver',p))[0];
if(!driverPath)throw Error('Set CHROMEDRIVER_PATH or install ChromeDriver in artifacts/browser.');
const driver=process.env.CHROMEDRIVER_EXTERNAL ? {kill(){}} : spawn(driverPath,['--port=9516'],{windowsHide:true,stdio:'ignore'});
let session;
async function request(endpoint, body, method='POST') {const r=await fetch('http://localhost:9516'+endpoint,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();if(data.value?.error)throw Error(JSON.stringify(data.value));return data.value;}
async function execute(script){return request(`/session/${session}/execute/sync`,{script,args:[]});}

async function clickText(text){await execute('const item=Array.from(document.querySelectorAll("button,[role=button]")).find(e=>e.textContent===arguments[0]);if(!item)throw Error("Missing "+arguments[0]);item.click();'.replace('arguments[0]',JSON.stringify(text)).replace('arguments[0]',JSON.stringify(text)));await new Promise(r=>setTimeout(r,150));}
async function type(label,value){const element=await request('/session/'+session+'/element',{using:'css selector',value:'[aria-label="'+label+'"]'});const id=element['element-6066-11e4-a52e-4f735466cecf'];await request('/session/'+session+'/element/'+id+'/clear',{});await request('/session/'+session+'/element/'+id+'/value',{text:value});}
async function check(script,message){if(!(await execute(script)))throw Error(message);}
(async()=>{
 await new Promise(r=>server.listen(4178,'127.0.0.1',r));
 session=(await request('/session',{capabilities:{alwaysMatch:{browserName:'chrome','goog:chromeOptions':{args:['--headless=new','--disable-gpu']}}}})).sessionId;
 await request('/session/'+session+'/url',{url:process.env.TEST_URL || 'http://127.0.0.1:4178'});
 for(let i=0;i<80;i++){if(await execute('return !!document.querySelector("input")'))break;await new Promise(r=>setTimeout(r,200));}
 if(!process.env.TEST_URL)await execute('const originalFetch=window.fetch;window.fetch=(url,options)=>String(url).includes("workers.dev/search")?Promise.resolve(new Response(JSON.stringify({places:[{id:"test-cafe",name:"테스트 카페",address:"서울 성동구",category:"카페",latitude:37.54,longitude:127.04,memo:"",stay:""}]}),{status:200})):originalFetch(url,options);');
 await type('장소 검색','성수 카페');await clickText('검색');
 for(let i=0;i<60;i++){if(await execute('return document.body.textContent.includes("장소 저장")'))break;await new Promise(r=>setTimeout(r,250));}
 await check('return document.body.textContent.includes("장소 저장")','Search results missing');
 await clickText('장소 저장');await check(`return Array.from(document.querySelectorAll('input,textarea')).some(e=>e.getAttribute('aria-label')==='장소 메모')`,'Save failed');
 await type('장소 메모','조용한 자리');await type('장소 분류','카페공부');await clickText('메모·분류 저장');
 await request('/session/'+session+'/refresh',{});await new Promise(r=>setTimeout(r,1800));await clickText('내 장소 1');
 await check(`return Array.from(document.querySelectorAll('input,textarea')).find(e=>e.getAttribute('aria-label')==='장소 메모').value==='조용한 자리'`,'Memo persistence failed');
 await check(`return Array.from(document.querySelectorAll('input,textarea')).find(e=>e.getAttribute('aria-label')==='장소 분류').value==='카페공부'`,'Folder persistence failed');
 fs.writeFileSync('artifacts/saved-places.png',Buffer.from(await request('/session/'+session+'/screenshot',null,'GET'),'base64'));
 await clickText('장소 삭제');await clickText('삭제 확인');await check('return document.body.textContent.includes("아직 저장된 장소가 없어요")','Delete failed');
 console.log('PASS: in-app search, save, memo/folder edit, reload persistence, deletion, empty library');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(session)await request('/session/'+session,null,'DELETE').catch(()=>{});driver.kill();server.close();});
