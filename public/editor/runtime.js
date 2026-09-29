(function () {
  'use strict';
  if (window.BeenLayout) return;
  const M = window.BeenLayoutModel;
  const rootSelector = '[data-testid="layout-root"]';
  let layout = M.empty(), error = '', root, additions, applied, revision = 0;
  const editor = new URLSearchParams(location.search).has('layout-editor');
  try { const saved = localStorage.getItem(M.ACTIVE_KEY); if (saved) layout = M.parse(saved); }
  catch (e) { error = '저장된 레이아웃을 읽지 못해 기본 화면을 표시합니다. ' + e.message; }
  const style = document.createElement('style');
  style.id = 'been-layout-styles';
  document.head.appendChild(style);
  const scale = () => root ? root.getBoundingClientRect().width / layout.canvas.width : 1;
  const node = id => root?.querySelector(`[data-testid="${id}"]`) || null;
  function rules(id, item, s) {
    const declarations = [];
    if (item.hidden) declarations.push('display:none!important');
    if (item.x || item.y) declarations.push(`translate:${(item.x || 0) * s}px ${(item.y || 0) * s}px`);
    if (item.width !== undefined) declarations.push(`width:${item.width * s}px!important;min-width:0!important;max-width:none!important;flex-grow:0!important;flex-shrink:0!important;flex-basis:auto!important`);
    if (item.height !== undefined) declarations.push(`height:${item.height * s}px!important;min-height:0!important;max-height:none!important;flex-grow:0!important;flex-shrink:0!important;flex-basis:auto!important`);
    if (item.z !== undefined) declarations.push(`z-index:${item.z}!important`);
    if (item.radius !== undefined) declarations.push(`border-radius:${item.radius * s}px!important`);
    if (item.background !== undefined) declarations.push(`background:${item.background}!important`);
    let result = `${rootSelector} [data-testid="${id}"]{${declarations.join(';')}}`;
    if (id === 'layout-map' && item.height !== undefined) {
      result += `${rootSelector} [data-testid="layout-map"]{padding-bottom:0!important;overflow:hidden!important}${rootSelector} [data-testid="layout-map"]>div{min-height:0!important}`;
    }
    const text = [];
    if (item.fontSize !== undefined) text.push(`font-size:${item.fontSize * s}px!important`);
    if (item.color !== undefined) text.push(`color:${item.color}!important`);
    if (text.length) result += `${rootSelector} [data-testid="${id}"] > div:last-child,${rootSelector} [data-testid="${id}"]{${text.join(';')}}`;
    return result;
  }
  function render() {
    const nextRoot = document.querySelector(rootSelector);
    if (!nextRoot) { style.textContent = ''; additions?.remove(); additions = null; root = null; applied = null; return; }
    if (nextRoot !== root) { root = nextRoot; additions = null; applied = null; }
    const s = scale();
    const signature = revision + ':' + s;
    if (signature === applied && additions?.isConnected) return;
    applied = signature;
    let css = Object.entries(layout.elements).map(([id, item]) => rules(id, item, s)).join('\n');
    // Allow a moved menu item to extend past the dock's decorative clipping layer.
    if (Object.entries(layout.elements).some(([id, p]) => id.startsWith('layout-nav-') && (p.x || p.y))) {
      css += `${rootSelector} [data-testid="layout-nav"] > div{overflow:visible!important}`;
    }
    style.textContent = css;
    if (!additions?.isConnected) {
      additions = document.createElement('div');
      additions.dataset.beenAdditions = '';
      Object.assign(additions.style, { display: 'contents', pointerEvents: 'none' });
      root.appendChild(additions);
    }
    additions.replaceChildren(...layout.additions.map(item => {
      const el = document.createElement(item.kind === 'image' ? 'img' : item.kind === 'button' ? 'a' : 'div');
      el.dataset.testid = item.id;
      el.setAttribute('aria-label', item.name);
      if (item.kind === 'image') { el.src = item.src; el.alt = item.text || item.name; }
      else el.textContent = item.text;
      if (item.kind === 'button') {
        if (item.href) { el.href = item.href; el.target = '_blank'; el.rel = 'noopener noreferrer'; }
        else { el.setAttribute('role', 'button'); el.setAttribute('aria-disabled', 'true'); }
      }
      Object.assign(el.style, {
        position: 'absolute', left: `${(item.x || 0) * s}px`, top: `${(item.y || 0) * s}px`,
        width: `${(item.width || 160) * s}px`, height: `${(item.height || 48) * s}px`,
        display: item.hidden ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box', padding: item.kind === 'image' ? '0' : `${8 * s}px`,
        color: item.color || '#284653', background: item.background || 'transparent',
        font: `500 ${(item.fontSize || 16) * s}px sans-serif`, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
        borderRadius: `${(item.radius || 0) * s}px`, textDecoration: 'none', objectFit: 'contain',
        pointerEvents: 'auto', zIndex: String(item.z || 0),
      });
      return el;
    }));
  }
  function apply(next) { layout = M.parse(next); revision++; applied = null; render(); return layout; }
  window.BeenLayout = { apply, get: () => layout, root: () => root, node, scale, error };
  let pending = false;
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(() => { pending = false; render(); }); } };
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-testid'] });
  window.addEventListener('resize', () => { applied = null; schedule(); });
  if (!editor) window.addEventListener('storage', event => {
    if (event.key === M.ACTIVE_KEY) {
      try { apply(event.newValue ? M.parse(event.newValue) : M.empty()); } catch { /* Keep the last valid layout. */ }
    }
  });
  render();
})();
