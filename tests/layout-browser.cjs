// Real mouse events against the exported app; no browser automation dependency required.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const root = path.resolve('dist-editor-check');
const artifactDir = path.resolve('artifacts/layout-editor');
fs.mkdirSync(artifactDir, { recursive: true });
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith('/BEEN-app/')) { res.writeHead(404); res.end(); return; }
  let relative = decodeURIComponent(url.pathname.slice('/BEEN-app/'.length));
  if (!relative || relative.endsWith('/')) relative += 'index.html';
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(file);
    // Mirror the GitHub Pages subpath rewrites in deploy-pages.yml.
    if (ext === '.html') data = Buffer.from(data.toString().replaceAll('src="/_expo/', 'src="/BEEN-app/_expo/').replaceAll('href="/favicon.ico"', 'href="/BEEN-app/favicon.ico"'));
    if (ext === '.js') data = Buffer.from(data.toString().replaceAll('"/_expo/', '"/BEEN-app/_expo/').replaceAll('"/assets/', '"/BEEN-app/assets/'));
    res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf' })[ext] || 'application/octet-stream');
    res.end(data);
  });
});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let chrome, ws, sequence = 0;
const pending = new Map(), errors = [];
function command(method, params = {}) {
  return new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function until(expression) {
  for (let i = 0; i < 120; i++) { if (await evaluate(expression)) return; await wait(250); }
  throw Error('Timeout: ' + expression + '\n' + await evaluate('document.body.innerText.slice(-1500)'));
}
const click = id => evaluate(`document.getElementById(${JSON.stringify(id)}).click()`);
const runtime = `document.getElementById('app-frame').contentWindow.BeenLayout`;
const frameDoc = `document.getElementById('app-frame').contentDocument`;
async function layer(label, shift = false) {
  await evaluate(`(()=>{const el=[...document.querySelectorAll('.layer-select')].find(e=>e.textContent===${JSON.stringify(label)});if(!el)throw Error('Missing layer');el.dispatchEvent(new MouseEvent('click',{bubbles:true,shiftKey:${shift}}))})()`);
}
async function field(id, value) {
  await evaluate(`(()=>{const el=document.getElementById(${JSON.stringify(id)});el.value=${JSON.stringify(String(value))};el.dispatchEvent(new Event('change',{bubbles:true}));el.blur()})()`);
}
async function point(selector) {
  return evaluate(`(()=>{const f=document.getElementById('app-frame'),r=f.getBoundingClientRect(),el=f.contentDocument.querySelector(${JSON.stringify(selector)}),b=el.getBoundingClientRect(),scale=r.width/f.clientWidth;return{x:r.x+(b.x+b.width/2)*scale,y:r.y+(b.y+b.height/2)*scale,scale}})()`);
}
async function drag(selector, dx, dy) {
  const p = await point(selector);
  await command('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.x, y: p.y });
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', clickCount: 1 });
  for (let i = 1; i <= 4; i++) await command('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.x + dx * p.scale * i / 4, y: p.y + dy * p.scale * i / 4, button: 'left', buttons: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x + dx * p.scale, y: p.y + dy * p.scale, button: 'left', clickCount: 1 });
  await wait(80);
}
const key = (name, shift = false) => evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(name)},shiftKey:${shift},bubbles:true}))`);
async function screenshot(name) { const shot = await command('Page.captureScreenshot'); fs.writeFileSync(path.join(artifactDir, name + '.png'), Buffer.from(shot.data, 'base64')); }

(async () => {
  await new Promise(resolve => server.listen(4195, '127.0.0.1', resolve));
  chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9245', '--user-data-dir=' + path.join(artifactDir, 'chrome-' + Date.now()), 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  chrome.on('error', error => { console.error(error); process.exitCode = 1; });
  let pages;
  for (let i = 0; i < 60; i++) { try { pages = await (await fetch('http://127.0.0.1:9245/json')).json(); break; } catch { await wait(250); } }
  if (!pages) throw Error('Headless Chrome did not start');
  ws = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve));
  ws.addEventListener('message', event => { const message = JSON.parse(event.data); if (message.id) { const p = pending.get(message.id); pending.delete(message.id); message.error ? p.reject(message.error) : p.resolve(message.result); } else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails); });
  await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1080, deviceScaleFactor: 1, mobile: false });
  await command('Page.navigate', { url: 'http://127.0.0.1:4195/BEEN-app/editor/' });
  await until(`document.getElementById('status')?.textContent.includes('편집 준비 완료')`);
  await evaluate(`localStorage.setItem('been:world:v1',JSON.stringify({memories:[],courses:[]}))`);
  assert.equal(await evaluate(`document.querySelectorAll('.layer').length`), 9);
  assert.equal(await evaluate(`${frameDoc}.querySelectorAll('[data-testid="layout-root"]').length`), 1);
  await screenshot('desktop-initial');
  console.log('PASS: exported app loads from GitHub Pages subpath; empty world remains usable');

  await drag('[data-testid="layout-logo"]', 25, 32);
  let logo = await evaluate(`${runtime}.get().elements['layout-logo']`);
  assert(Math.abs(logo.x - 25) < 2 && Math.abs(logo.y - 32) < 2, JSON.stringify(logo));
  const origin = await evaluate(`(()=>{const r=${runtime}.node('layout-logo').getBoundingClientRect();return {x:r.x,y:r.y}})()`);
  await drag('[data-handle="se"]', 30, 15);
  logo = await evaluate(`${runtime}.get().elements['layout-logo']`);
  assert(logo.width > 180 && logo.height > 48, JSON.stringify(logo));
  const resizedOrigin = await evaluate(`(()=>{const r=${runtime}.node('layout-logo').getBoundingClientRect();return {x:r.x,y:r.y}})()`);
  assert(Math.abs(origin.x - resizedOrigin.x) < 1 && Math.abs(origin.y - resizedOrigin.y) < 1);
  await click('undo');
  assert.equal(await evaluate(`${runtime}.get().elements['layout-logo'].width`), undefined);
  await click('redo');
  assert(await evaluate(`${runtime}.get().elements['layout-logo'].width > 180`));
  console.log('PASS: real pointer drag, resize and undo/redo');

  await layer('내 코스 버튼'); await layer('지도 / 모형 전환 버튼', true); await key('ArrowRight', true);
  assert.equal(await evaluate(`${runtime}.get().elements['layout-courses'].x`), 10);
  assert.equal(await evaluate(`${runtime}.get().elements['layout-view-toggle'].x`), 10);
  await layer('로고'); await click('lock');
  const lockedX = await evaluate(`${runtime}.get().elements['layout-logo'].x`);
  await key('ArrowRight'); assert.equal(await evaluate(`${runtime}.get().elements['layout-logo'].x`), lockedX);
  await click('lock');
  await field('prop-x', -20);
  assert(Math.abs(await evaluate(`Number(document.getElementById('prop-x').value)`) + 20) < 1);
  await evaluate(`document.querySelector('[data-align="center"]').click()`);
  const centered = await evaluate(`(()=>{const r=${runtime}.node('layout-logo').getBoundingClientRect(),b=${runtime}.root().getBoundingClientRect();return Math.abs(r.x+r.width/2-b.x-b.width/2)})()`);
  assert(centered < 1);
  console.log('PASS: multi-select, keyboard move, lock, unrestricted coordinates and alignment');

  await evaluate(`document.querySelector('[data-add="text"]').click()`);
  await field('prop-text', '나의 편집 화면 <b>HTML 아님</b>');
  assert(await evaluate(`${frameDoc}.querySelector('[data-testid^="custom-"]').textContent.includes('<b>HTML 아님</b>')`));
  assert.equal(await evaluate(`${frameDoc}.querySelector('[data-testid^="custom-"] b')`), null);
  await click('duplicate'); assert.equal(await evaluate(`${runtime}.get().additions.length`), 2);
  await click('delete'); assert(await evaluate(`${runtime}.get().additions[1].hidden`));
  await click('undo'); assert.equal(await evaluate(`${runtime}.get().additions[1].hidden`), false);
  await layer('지도 영역'); await field('prop-height', 420);
  assert(Math.abs(await evaluate(`${runtime}.node('layout-map').getBoundingClientRect().height`) - 420) < 1);
  await click('save');
  assert(await evaluate(`!!localStorage.getItem('been:ui-layout:v1')`));
  await screenshot('desktop-edited');
  console.log('PASS: add, duplicate, delete, text escaping, map resizing and save');

  await click('preview');
  await evaluate(`${frameDoc}.querySelector('[data-testid="layout-courses"]').click()`);
  await until(`${frameDoc}.body.innerText.includes('기록을 묶어 코스 만들기')`);
  await evaluate(`(()=>{const d=${frameDoc};[...d.querySelectorAll('[role=button]')].find(el=>el.textContent==='닫기').click()})()`);
  await evaluate(`${frameDoc}.querySelector('[data-testid="layout-nav-settings"]').click()`);
  await until(`!${frameDoc}.querySelector('[data-testid="layout-root"]')`);
  await until(`${frameDoc}.querySelectorAll('[data-testid^="custom-"]').length === 0`);
  await click('preview');
  await until(`!!${runtime}?.root() && !!${frameDoc}.getElementById('been-editor-overlay')`);
  await field('viewport', '390,844'); await wait(150);
  assert.equal(await evaluate(`document.getElementById('app-frame').clientWidth`), 390);
  await layer('로고'); await drag('[data-testid="layout-logo"]', 8, 8);
  await click('save');
  console.log('PASS: preview retains actual app actions; smaller viewport remains editable');

  const exported = await evaluate(`JSON.stringify(${runtime}.get())`);
  const validPath = path.join(artifactDir, 'valid.json'), badPath = path.join(artifactDir, 'invalid.json');
  fs.writeFileSync(validPath, exported); fs.writeFileSync(badPath, '{invalid');
  async function importFile(filePath) {
    const documentNode = await command('DOM.getDocument');
    const input = await command('DOM.querySelector', { nodeId: documentNode.root.nodeId, selector: '#import-file' });
    await command('DOM.setFileInputFiles', { nodeId: input.nodeId, files: [filePath] }); await wait(200);
  }
  await importFile(badPath);
  assert(await evaluate(`document.getElementById('status').textContent.includes('불러오지 못했습니다')`));
  assert.equal(await evaluate(`JSON.stringify(${runtime}.get())`), exported);
  await importFile(validPath);
  assert(await evaluate(`document.getElementById('status').textContent.includes('설정을 불러왔습니다')`));
  await click('save');
  console.log('PASS: valid JSON imports; invalid imports preserve the current layout');

  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await click('fit'); await screenshot('mobile-editor');
  assert(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`));
  await command('Page.navigate', { url: 'http://127.0.0.1:4195/BEEN-app/' });
  await until(`!!window.BeenLayout?.root()`);
  assert.equal(await evaluate(`window.BeenLayout.get().additions.length`), 2);
  assert.equal(await evaluate(`document.querySelectorAll('[data-testid^="custom-"]').length`), 2);
  await screenshot('saved-mobile-site');
  await evaluate(`localStorage.setItem('been:ui-layout:v1','{invalid')`);
  await command('Page.reload'); await until(`!!window.BeenLayout?.root()`);
  assert.equal(await evaluate(`window.BeenLayout.get().additions.length`), 0);
  assert(await evaluate(`!!window.BeenLayout.error`));
  assert.deepEqual(JSON.parse(await evaluate(`localStorage.getItem('been:world:v1')`)), { memories: [], courses: [] });
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log('PASS: mobile editor, saved layout on live app, corrupt-storage fallback; no uncaught JS errors');
})().catch(async error => { console.error(error); process.exitCode = 1; try { if (ws) await screenshot('failure'); } catch {} }).finally(async () => {
  try { if (ws?.readyState === 1) await command('Browser.close'); } catch {}
  ws?.close(); chrome?.kill(); server.close();
});
