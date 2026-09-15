const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports, process, require: name => { if (name in mocks) return mocks[name]; throw Error(name); } });
  return exports;
}
const { filterRecords } = load('src/recordSearch.ts');
const record = { title: '성수 러닝', note: '강을 따라 달리기', location: '서울 성동구', themes: ['러닝'], places: [{ id: 'a', name: '공원', address: '서울 성동구', latitude: 37.5, longitude: 127 }] };
assert.equal(filterRecords([], '', '코스').length, 0);
assert.equal(filterRecords([record], ' 성수 ', '코스').length, 1);
assert.equal(filterRecords([record], '성동', '지역').length, 1);
assert.equal(filterRecords([record], '', '테마', '러닝').length, 1);
assert.equal(filterRecords([record], '', '테마', '라이딩').length, 0);
assert.equal(filterRecords([{ ...record, themes: undefined }], '러닝', '테마').length, 0);
const { mapDocument } = load('src/components/naverMapDocument.ts');
function exerciseMap(record) {
  const html = mapDocument(record, 'test-key');
  const messages = [], markers = [], callbacks = [];
  const status = {};
  let sdk;
  const maps = {
    Map: function () { this.fitBounds = () => {}; },
    LatLng: function (lat, lng) { assert(Number.isFinite(lat) && Number.isFinite(lng)); },
    LatLngBounds: function () { this.extend = () => {}; }, Point: function () {}, Polyline: function () {},
    Marker: function (options) { this.icon = options.icon; this.setIcon = icon => { this.icon = icon; }; markers.push(this); },
    Event: { addListener: (marker, event, callback) => callbacks.push(callback) },
  };
  const window = { addEventListener() {}, ReactNativeWebView: { postMessage: value => messages.push(JSON.parse(value)) } };
  vm.runInNewContext(html.match(/<script>([\s\S]*)<\/script>/)[1], { window, naver: { maps }, document: { getElementById: () => status, createElement: () => (sdk = {}), head: { appendChild() {} } }, setTimeout: () => 1, clearTimeout() {}, console });
  sdk.onload();
  assert.equal(messages[0].type, 'ready');
  if (markers.length) { window.selectPlace(record.places[0].id); assert(markers[0].icon.content.includes('selected')); callbacks[0](); assert.equal(messages[1].id, record.places[0].id); }
  return markers.length;
}
assert.equal(exerciseMap({ places: [] }), 0);
assert.equal(exerciseMap(record), 1);
assert.equal(exerciseMap({ places: [{ id: 'bad', latitude: NaN, longitude: 127 }] }), 0);
assert(!mapDocument({ places: [{ ...record.places[0], id: '</script><script>alert(1)' }] }, 'x').includes('</script><script>alert'));
(async () => {
  const calls = [];
  const { openNaverMap } = load('src/naverMaps.ts', { 'react-native': { Platform: { OS: 'android' }, Linking: { openURL: async url => { calls.push(url); if (url.startsWith('nmap:')) throw Error('not installed'); } } } });
  await openNaverMap('서울 공원', record.places[0]);
  assert(calls[0].startsWith('nmap://place?'));
  assert(calls[1].startsWith('https://map.naver.com/p/search/'));
  calls.length = 0; await openNaverMap('  '); assert.equal(calls.length, 0);
  console.log('PASS: search modes, theme filters, empty/invalid places, map selection bridge, script escaping, Naver app web fallback');
})().catch(error => { console.error(error); process.exitCode = 1; });
