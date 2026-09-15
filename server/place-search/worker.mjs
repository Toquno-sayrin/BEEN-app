// Cloudflare Worker: paste this entire file into Edit code, then Deploy.
// Secrets: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET (NAVER API HUB credentials).
const allowedOrigins = new Set(['https://toquno-sayrin.github.io']);
const plainText = value => String(value ?? '').replace(/<[^>]*>/g, '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

function coordinate(value, max) {
  if (value == null || String(value).trim() === '') return NaN;
  const raw = Number(value);
  const result = Math.abs(raw) > max ? raw / 1e7 : raw;
  return Number.isFinite(result) && Math.abs(result) <= max ? result : NaN;
}

export function normalizePlaces(items) {
  if (!Array.isArray(items)) throw new Error('Invalid search response');
  const seen = new Set();
  return items.slice(0, 5).flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const name = plainText(item.title);
    const address = plainText(item.roadAddress || item.address);
    const longitude = coordinate(item.mapx, 180);
    const latitude = coordinate(item.mapy, 90);
    if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
    const id = `naver:${encodeURIComponent(name)}:${latitude.toFixed(7)}:${longitude.toFixed(7)}`;
    if (seen.has(id)) return [];
    seen.add(id);
    return [{ id, name, address, category: plainText(item.category), latitude, longitude, memo: '', stay: '' }];
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Vary': 'Origin',
      ...(allowedOrigins.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    };
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
    if (origin && !allowedOrigins.has(origin)) return json({ error: '허용되지 않은 요청입니다.' }, 403);
    const url = new URL(request.url);
    if (!['/health', '/search'].includes(url.pathname)) return json({ error: '주소를 확인해 주세요.' }, 404);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
    if (request.method !== 'GET') return json({ error: 'GET 요청만 지원합니다.' }, 405);
    const configured = Boolean(env.NAVER_CLIENT_ID?.trim() && env.NAVER_CLIENT_SECRET?.trim());
    if (url.pathname === '/health') return json({ service: 'been-place-search', configured });
    const query = (url.searchParams.get('q') ?? '').trim();
    if (!query || query.length > 100) return json({ error: '검색어를 1~100자로 입력해 주세요.' }, 400);
    if (!configured) return json({ error: '검색 서버 인증 설정이 필요합니다.' }, 503);
    const upstream = new URL('https://naverapihub.apigw.ntruss.com/search/v1/local');
    upstream.search = new URLSearchParams({ query, display: '5', start: '1', sort: 'random', format: 'json' }).toString();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(upstream, { signal: controller.signal, headers: {
        'X-NCP-APIGW-API-KEY-ID': env.NAVER_CLIENT_ID.trim(),
        'X-NCP-APIGW-API-KEY': env.NAVER_CLIENT_SECRET.trim(),
      } });
      if (!response.ok) {
        if ([401, 403].includes(response.status)) return json({ error: '네이버 검색 인증 정보를 확인해 주세요.' }, 502);
        if (response.status === 429) return json({ error: '검색 요청이 많습니다. 잠시 후 다시 시도해 주세요.' }, 429);
        return json({ error: '검색 서비스에 연결하지 못했어요.' }, 502);
      }
      const data = await response.json();
      return json({ places: normalizePlaces(data.items) });
    } catch {
      return json({ error: '검색 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요.' }, 502);
    } finally { clearTimeout(timer); }
  },
};
