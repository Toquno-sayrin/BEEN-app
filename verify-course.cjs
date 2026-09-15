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
(async()=>{await new Promise(r=>server.listen(4178,'127.0.0.1',r));for(let i=0;i<30;i++){try{await request('/status',null,'GET');break;}catch{await new Promise(r=>setTimeout(r,200));}}
session=(await request('/session',{capabilities:{alwaysMatch:{browserName:'chrome','goog:chromeOptions':{args:['--headless=new','--disable-gpu','--no-sandbox']}}}})).sessionId;
await request(`/session/${session}/url`,{url:'http://127.0.0.1:4178'});
for(let i=0;i<60;i++){if(await execute(`return !!document.querySelector('[aria-label="장소 검색"]')`))break;await new Promise(r=>setTimeout(r,250));}
fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/main.png',Buffer.from(await request(`/session/${session}/screenshot`,null,'GET'),'base64'));
await execute(`document.querySelector('[aria-label="발견"]').click();`);
await new Promise(r=>setTimeout(r,200));
fs.writeFileSync('artifacts/discovery.png',Buffer.from(await request(`/session/${session}/screenshot`,null,'GET'),'base64'));
if(!(await execute(`return !!document.querySelector('[aria-label="코스 검색"]')`)))throw Error('Discovery navigation failed');
await execute(`Array.from(document.querySelectorAll('[role="button"]')).find(e=>e.textContent==='라이딩').click();`);
await new Promise(r=>setTimeout(r,100));
if(!(await execute(`return document.body.textContent.includes('검색 결과가 없어요')`)))throw Error('Empty filter state failed');
await execute(`document.querySelector('[aria-label="내 지도"]').click();`);
await new Promise(r=>setTimeout(r,100));
await execute(`Array.from(document.querySelectorAll('[role="button"]')).find(e=>e.textContent==='상세 보기 ↗').click();`);
await new Promise(r=>setTimeout(r,200));
fs.mkdirSync('artifacts',{recursive:true});
for(const width of [390,768,1440]){
 await request(`/session/${session}/goog/cdp/execute`,{cmd:'Emulation.setDeviceMetricsOverride',params:{width,height:1000,deviceScaleFactor:1,mobile:false}});
 await execute(`document.querySelector('.been-detail').scrollTop=0;`);
 await new Promise(r=>setTimeout(r,300));
 const layout=await execute(`return {width:innerWidth,overflow:document.querySelector('.been-detail').scrollWidth>innerWidth,title:document.querySelector('h1').textContent,columns:getComputedStyle(document.querySelector('.bd-workspace')).gridTemplateColumns}`);
 if(layout.overflow)throw Error('Horizontal overflow '+width);
 fs.writeFileSync('artifacts/course-'+width+'.png',Buffer.from(await request(`/session/${session}/screenshot`,null,'GET'),'base64'));
 console.log(JSON.stringify(layout));
}
const interaction=await execute(`document.querySelectorAll('.bd-stop')[1].click();return true;`);
await new Promise(r=>setTimeout(r,100));
if(!(await execute(`return document.querySelector('.bd-detail-panel h2').textContent==='잔디광장' && document.querySelectorAll('.bd-stop')[1].getAttribute('aria-pressed')==='true'`)))throw Error('Selection failed');
await execute(`document.querySelector('.bd-save').click()`);
await request(`/session/${session}/refresh`,{});
await new Promise(r=>setTimeout(r,1000));
await execute(`Array.from(document.querySelectorAll('[role="button"]')).find(e=>e.textContent==='상세 보기 ↗').click();`);
await new Promise(r=>setTimeout(r,200));
if(!(await execute(`return document.querySelector('.bd-save').disabled`)))throw Error('Persistence failed');
console.log('PASS: selection synchronization, persisted browser save, responsive layout');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(session)await request(`/session/${session}`,null,'DELETE').catch(()=>{});driver.kill();server.close();});
