const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../public/editor/model.js');

test('empty layout preserves the existing app without overrides', () => {
  assert.deepEqual(M.parse(JSON.stringify(M.empty())), M.empty());
});
test('group movement is immutable and leaves locked elements alone', () => {
  const before = { ...M.empty(), elements: { 'layout-logo': { x: 5, y: -10 }, 'layout-map': { locked: true } } };
  const after = M.move(before, ['layout-logo', 'layout-map', 'layout-courses'], 20, -8);
  assert.deepEqual(after.elements['layout-logo'], { x: 25, y: -18 });
  assert.deepEqual(after.elements['layout-map'], { locked: true });
  assert.deepEqual(after.elements['layout-courses'], { x: 20, y: -8 });
  assert.equal(before.elements['layout-logo'].x, 5);
  assert.deepEqual(M.parse(JSON.stringify(after)), after);
});
test('hidden, positioned and resized additions survive export and import', () => {
  const custom = { id: 'custom-test', kind: 'button', name: '버튼', text: '<script>not HTML</script>', x: -20, y: 64, width: 140, height: 48, href: 'https://example.com/', hidden: true, locked: false, background: '#abc123' };
  const layout = { ...M.empty(), additions: [custom] };
  assert.deepEqual(M.parse(JSON.stringify(layout)), layout);
  assert.equal(M.update(layout, custom.id, { hidden: false }).additions[0].hidden, false);
  assert.equal(layout.additions[0].hidden, true);
});
test('malformed or hostile imports cannot write arbitrary selectors, CSS or links', () => {
  for (const value of [null, [], {}, { ...M.empty(), version: 9 }, { ...M.empty(), canvas: { width: 0, height: 900 } }, { ...M.empty(), elements: { 'body{}': {} } }, { ...M.empty(), elements: { 'layout-logo': { x: Infinity } } }, { ...M.empty(), elements: { 'layout-logo': { width: -10 } } }, { ...M.empty(), elements: { 'layout-logo': { background: 'red;position:fixed' } } }]) assert.throws(() => M.parse(value));
  for (const href of ['javascript:alert(1)', 'data:text/html,<script>', '//evil.example']) assert.throws(() => M.parse({ ...M.empty(), additions: [{ id: 'custom-a', kind: 'button', name: 'a', text: 'a', href }] }));
  assert.throws(() => M.safeImage('data:image/svg+xml;base64,AAAA'));
  assert.throws(() => M.parse(' '.repeat(M.MAX_BYTES + 1)));
  assert.throws(() => M.parse('{invalid JSON'));
});
test('duplicate ids and excessive additions are rejected', () => {
  const node = { id: 'custom-a', kind: 'text', name: 'a', text: '' };
  assert.throws(() => M.parse({ ...M.empty(), additions: [node, node] }));
  assert.throws(() => M.parse({ ...M.empty(), additions: Array.from({ length: 61 }, (_, i) => ({ ...node, id: 'custom-' + i })) }));
});
test('unknown properties are discarded instead of becoming DOM attributes', () => {
  const value = M.parse({ ...M.empty(), elements: { 'layout-logo': { x: 3, onclick: 'alert(1)', style: 'evil' } } });
  assert.deepEqual(value.elements['layout-logo'], { x: 3 });
  assert.throws(() => M.parse(JSON.parse('{"version":1,"canvas":{"width":480,"height":900},"elements":{"__proto__":{}},"additions":[]}')));
});
