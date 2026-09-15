import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker, { normalizePlaces } from './worker.mjs';

const item = { title: '<b>성수</b> 카페 &amp; 공원', roadAddress: '서울 성동구', category: '카페', mapx: '1270402000', mapy: '375462000' };
const env = { NAVER_CLIENT_ID: 'test-id', NAVER_CLIENT_SECRET: 'test-secret' };
const request = (path, options) => new Request(`https://example.workers.dev${path}`, options);
test('normalizes coordinates, plain text, duplicates, invalid data and empty results', () => {
  const places = normalizePlaces([item, item, { ...item, mapy: 'bad' }, { ...item, mapx: '' }]);
  assert.equal(places.length, 1); assert.equal(places[0].longitude, 127.0402);
  assert.equal(places[0].latitude, 37.5462); assert.equal(places[0].name, '성수 카페 & 공원');
  assert.deepEqual(normalizePlaces([]), []);
  assert.equal(normalizePlaces([{ ...item, mapx: '127.0402', mapy: '37.5462' }])[0].id, places[0].id);
});
test('health exposes only configuration status; validates CORS, method, query and missing credentials', async () => {
  assert.deepEqual(await (await worker.fetch(request('/health'), env)).json(), { service: 'been-place-search', configured: true });
  assert.equal((await worker.fetch(request('/search?q=x', { headers: { Origin: 'https://other.example' } }), env)).status, 403);
  assert.equal((await worker.fetch(request('/search?q=x', { method: 'POST' }), env)).status, 405);
  assert.equal((await worker.fetch(request('/search?q=%20'), env)).status, 400);
  assert.equal((await worker.fetch(request('/search?q=x'), {})).status, 503);
});
test('uses API HUB endpoint and credentials server-side, returns normalized places and handles provider errors', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url.origin, 'https://naverapihub.apigw.ntruss.com');
      assert.equal(url.pathname, '/search/v1/local'); assert.equal(url.searchParams.get('display'), '5');
      assert.equal(options.headers['X-NCP-APIGW-API-KEY'], env.NAVER_CLIENT_SECRET);
      return Response.json({ items: [item] });
    };
    const response = await worker.fetch(request('/search?q=성수', { headers: { Origin: 'https://toquno-sayrin.github.io' } }), env);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://toquno-sayrin.github.io');
    assert.equal((await response.json()).places.length, 1);
    globalThis.fetch = async () => new Response('private provider detail', { status: 403 });
    const failed = await worker.fetch(request('/search?q=x'), env);
    assert.equal(failed.status, 502); assert(!(await failed.text()).includes('private'));
    globalThis.fetch = async () => { throw Error('network'); };
    assert.equal((await worker.fetch(request('/search?q=x'), env)).status, 502);
  } finally { globalThis.fetch = original; }
});
