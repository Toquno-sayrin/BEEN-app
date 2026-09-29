/* Shared by the editor, the app runtime and the Node tests. No app data is stored here. */
(function (scope) {
  'use strict';
  const targets = {
    'layout-logo': '로고', 'layout-courses': '내 코스 버튼',
    'layout-view-toggle': '지도 / 모형 전환 버튼', 'layout-map': '지도 영역',
    'layout-nav': '하단 메뉴 전체', 'layout-nav-explore': '탐색 메뉴',
    'layout-nav-create': '추가 메뉴', 'layout-nav-home': '더보기 메뉴',
    'layout-nav-settings': '설정 메뉴',
  };
  const ACTIVE_KEY = 'been:ui-layout:v1';
  const DRAFT_KEY = 'been:ui-layout-draft:v1';
  const MAX_BYTES = 5 * 1024 * 1024;
  const empty = () => ({ version: 1, canvas: { width: 480, height: 900 }, elements: {}, additions: [] });
  const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function number(value, min, max) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw Error('위치·크기 값의 범위를 확인해 주세요.');
    return value;
  }
  function text(value, max) {
    if (typeof value !== 'string' || value.length > max) throw Error('텍스트 또는 파일 크기가 너무 큽니다.');
    return value;
  }
  function color(value) {
    if (value !== 'transparent' && !/^#[a-f\d]{6}$/i.test(value)) throw Error('색상 형식이 올바르지 않습니다.');
    return value;
  }
  function safeLink(value) {
    text(value, 2000);
    if (value && !/^https?:\/\/[^\s]+$/i.test(value)) throw Error('버튼 링크는 http 또는 https 주소를 입력해 주세요.');
    return value;
  }
  function safeImage(value) {
    text(value, 3 * 1024 * 1024);
    if (!/^data:image\/(png|jpeg|webp|gif);base64,[a-z\d+/=]+$/i.test(value)) throw Error('PNG, JPG, WebP, GIF 이미지만 사용할 수 있습니다.');
    return value;
  }
  function patch(value) {
    if (!plain(value)) throw Error('요소 설정 형식이 올바르지 않습니다.');
    const next = {};
    for (const key of ['x', 'y']) if (value[key] !== undefined) next[key] = number(value[key], -4000, 4000);
    for (const key of ['width', 'height']) if (value[key] !== undefined) next[key] = number(value[key], 8, 4000);
    if (value.z !== undefined) next.z = number(value.z, -50, 200);
    if (value.fontSize !== undefined) next.fontSize = number(value.fontSize, 8, 160);
    if (value.radius !== undefined) next.radius = number(value.radius, 0, 500);
    for (const key of ['hidden', 'locked']) if (value[key] !== undefined) {
      if (typeof value[key] !== 'boolean') throw Error('숨김·잠금 값이 올바르지 않습니다.');
      next[key] = value[key];
    }
    for (const key of ['color', 'background']) if (value[key] !== undefined) next[key] = color(value[key]);
    return next;
  }
  function parse(raw) {
    if (typeof raw === 'string' && raw.length > MAX_BYTES) throw Error('설정 파일은 5MB 이하로 만들어 주세요.');
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!plain(value) || value.version !== 1 || !plain(value.canvas) || !plain(value.elements) || !Array.isArray(value.additions)) throw Error('BEEN 편집기 설정 파일이 아닙니다.');
    const result = empty();
    result.canvas = { width: number(value.canvas.width, 280, 1440), height: number(value.canvas.height, 400, 2400) };
    for (const [id, data] of Object.entries(value.elements)) {
      if (!Object.hasOwn(targets, id)) throw Error('알 수 없는 기본 요소입니다.');
      result.elements[id] = patch(data);
    }
    if (value.additions.length > 60) throw Error('추가 요소는 60개까지 사용할 수 있습니다.');
    const ids = new Set();
    result.additions = value.additions.map(item => {
      if (!plain(item) || !/^custom-[a-z\d-]{1,70}$/.test(item.id) || ids.has(item.id)) throw Error('추가 요소 ID가 올바르지 않습니다.');
      ids.add(item.id);
      if (!['text', 'button', 'image', 'box'].includes(item.kind)) throw Error('지원하지 않는 요소입니다.');
      const next = { ...patch(item), id: item.id, kind: item.kind, name: text(item.name, 100), text: text(item.text, 2000) };
      if (item.kind === 'image') next.src = safeImage(item.src);
      if (item.kind === 'button') next.href = safeLink(item.href || '');
      return next;
    });
    return result;
  }
  function get(layout, id) { return Object.hasOwn(targets, id) ? layout.elements[id] || {} : layout.additions.find(item => item.id === id); }
  function update(layout, id, changes) {
    if (Object.hasOwn(targets, id)) return { ...layout, elements: { ...layout.elements, [id]: { ...get(layout, id), ...changes } } };
    return { ...layout, additions: layout.additions.map(item => item.id === id ? { ...item, ...changes } : item) };
  }
  function move(layout, ids, dx, dy) {
    return ids.reduce((next, id) => {
      const item = get(next, id);
      if (!item || item.locked) return next;
      return update(next, id, { x: Math.max(-4000, Math.min(4000, (item.x || 0) + dx)), y: Math.max(-4000, Math.min(4000, (item.y || 0) + dy)) });
    }, layout);
  }
  const api = { targets, ACTIVE_KEY, DRAFT_KEY, MAX_BYTES, empty, parse, get, update, move, safeImage, safeLink };
  if (typeof module !== 'undefined') module.exports = api;
  else scope.BeenLayoutModel = api;
})(globalThis);
