(function () {
  'use strict';
  const M = window.BeenLayoutModel, $ = id => document.getElementById(id);
  const frame = $('app-frame');
  let layout = M.empty(), selected = [], past = [], future = [], saved = '', runtime, doc, overlay;
  let zoom = 1, viewport = { width: 480, height: 900 }, preview = false, gesture = null, draftTimer;
  let initialMessage = '';
  try {
    const active = localStorage.getItem(M.ACTIVE_KEY);
    if (active) layout = M.parse(active);
    saved = JSON.stringify(layout);
    const draft = localStorage.getItem(M.DRAFT_KEY);
    if (draft) { layout = M.parse(draft); if (JSON.stringify(layout) !== saved) initialMessage = '마지막 편집 초안을 복구했습니다. 적용하려면 저장해 주세요.'; }
  } catch (e) { saved = JSON.stringify(layout); initialMessage = '저장 설정을 읽지 못했습니다. 원본은 보존됩니다. ' + e.message; }
  function status(message, error = false) { $('status').textContent = message; $('status').classList.toggle('error', error); }
  function ids() { return [...Object.keys(M.targets), ...layout.additions.map(item => item.id)]; }
  function name(id) { return M.targets[id] || M.get(layout, id)?.name || '추가 요소'; }
  function item(id) { return M.get(layout, id) || {}; }
  function topSelection() {
    return selected.filter(id => !selected.some(other => other !== id && runtime?.node(other)?.contains(runtime.node(id))));
  }
  function remember() { past.push(layout); if (past.length > 60) past.shift(); future = []; }
  function sync() {
    runtime?.apply(layout);
    $('save-state').textContent = JSON.stringify(layout) === saved ? '이 브라우저에 저장됨' : '저장하지 않은 변경 있음';
    $('undo').disabled = !past.length; $('redo').disabled = !future.length;
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      try { localStorage.setItem(M.DRAFT_KEY, JSON.stringify(layout)); }
      catch { status('초안 저장 공간이 부족합니다. JSON으로 내보내 주세요.', true); }
    }, 350);
    renderLayers(); renderProperties(); drawSelection();
  }
  function commit(next) {
    try { next = M.parse(next); }
    catch (e) { status(e.message, true); renderProperties(); return false; }
    if (JSON.stringify(next) === JSON.stringify(layout)) return false;
    remember(); layout = next; sync(); return true;
  }
  function change(changes) {
    let next = layout;
    for (const id of topSelection()) if (!item(id).locked) next = M.update(next, id, changes);
    commit(next);
  }
  function preserveOrigin(next, id, x, y) {
    // Flex alignment can shift an element when its dimensions change. Compensate
    // for that shift so the edge opposite the resize handle stays in place.
    runtime.apply(next);
    const after = rect(id);
    if (!after) return next;
    return M.move(next, [id], (x - after.x) / runtime.scale(), (y - after.y) / runtime.scale());
  }
  function select(id, additive) {
    selected = additive ? selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id] : [id];
    renderLayers(); renderProperties(); drawSelection();
  }
  function rect(id) {
    const element = runtime?.node(id), root = runtime?.root();
    if (!element || !root || !element.getClientRects().length) return null;
    const r = element.getBoundingClientRect(), base = root.getBoundingClientRect();
    return { x: r.x - base.x, y: r.y - base.y, width: r.width, height: r.height, left: r.left, top: r.top };
  }
  function renderLayers() {
    $('layer-count').textContent = String(ids().length);
    $('layer-list').replaceChildren(...ids().map(id => {
      const row = document.createElement('div');
      row.className = 'layer' + (selected.includes(id) ? ' selected' : '') + (item(id).hidden ? ' hidden-item' : '');
      const symbol = document.createElement('span'); symbol.className = 'layer-symbol'; symbol.textContent = item(id).locked ? '▣' : id.startsWith('custom-') ? '◇' : '▱';
      const button = document.createElement('button'); button.className = 'layer-select'; button.textContent = name(id); button.title = name(id); button.setAttribute('aria-pressed', String(selected.includes(id))); button.onclick = e => select(id, e.shiftKey);
      const visibility = document.createElement('button'); visibility.className = 'visibility'; visibility.textContent = item(id).hidden ? '복원' : '숨김'; visibility.setAttribute('aria-label', name(id) + (item(id).hidden ? ' 복원' : ' 숨기기'));
      visibility.onclick = () => { commit(M.update(layout, id, { hidden: !item(id).hidden })); };
      row.append(symbol, button, visibility); return row;
    }));
  }
  function renderProperties() {
    $('empty-selection').hidden = !!selected.length; $('properties').hidden = !selected.length;
    if (!selected.length) return;
    $('selection-name').textContent = selected.length === 1 ? name(selected[0]) : `${selected.length}개 요소 선택`;
    const one = selected.length === 1, current = one ? item(selected[0]) : {}, r = one ? rect(selected[0]) : null;
    const custom = one && selected[0].startsWith('custom-');
    $('selection-help').textContent = current.hidden ? '숨겨진 요소입니다. 요소 목록에서 복원하세요.' : current.locked ? '잠금 상태입니다. 해제하면 이동할 수 있어요.' : 'X·Y는 현재 화면 왼쪽 위를 기준으로 합니다.';
    $('geometry-fields').disabled = !one || !!current.locked || !r;
    $('align-fields').disabled = selected.every(id => item(id).locked || item(id).hidden);
    for (const key of ['x', 'y', 'width', 'height']) if (document.activeElement !== $('prop-' + key)) $('prop-' + key).value = r ? Math.round(r[key] * 10) / 10 : '';
    $('custom-fields').hidden = !custom;
    if (custom) {
      for (const key of ['name', 'text', 'href', 'fontSize', 'radius', 'color', 'background']) {
        if (document.activeElement !== $('prop-' + key)) $('prop-' + key).value = current[key] ?? ({ fontSize: 16, radius: 0, color: '#284653', background: '#ffffff' }[key] || '');
        $('prop-' + key).disabled = !!current.locked;
      }
      $('href-field').hidden = current.kind !== 'button'; $('button-note').hidden = current.kind !== 'button';
    }
    $('duplicate').disabled = !selected.every(id => id.startsWith('custom-'));
    $('duplicate').title = '텍스트·버튼·이미지·도형 등 추가 요소를 복제합니다.';
    $('lock').textContent = selected.every(id => item(id).locked) ? '위치 잠금 해제' : '위치 잠금';
  }
  function drawSelection() {
    if (!overlay) return;
    overlay.replaceChildren();
    if (preview) return;
    for (const id of selected) {
      const r = rect(id); if (!r || item(id).hidden) continue;
      const box = doc.createElement('div');
      Object.assign(box.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, border: `1.5px solid ${item(id).locked ? '#9aabbc' : '#258ce6'}`, boxSizing: 'border-box', pointerEvents: 'none' });
      const label = doc.createElement('div'); label.textContent = `${name(id)} · ${Math.round(r.width)} × ${Math.round(r.height)}`;
      Object.assign(label.style, { position: 'absolute', left: '-1px', top: r.top < 22 ? '0' : '-22px', background: '#258ce6', color: 'white', font: '10px sans-serif', padding: '4px 7px', whiteSpace: 'nowrap', borderRadius: '3px 3px 0 0' });
      box.appendChild(label);
      if (selected.length === 1 && !item(id).locked) for (const direction of ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']) {
        const handle = doc.createElement('div'); handle.dataset.handle = direction; handle.dataset.target = id;
        handle.setAttribute('aria-label', `${name(id)} ${direction} 크기 조절`);
        Object.assign(handle.style, { position: 'absolute', width: '10px', height: '10px', background: 'white', border: '1.5px solid #258ce6', borderRadius: '2px', pointerEvents: 'auto', touchAction: 'none', cursor: direction + '-resize', left: direction.includes('w') ? '-6px' : direction.includes('e') ? 'calc(100% - 4px)' : 'calc(50% - 5px)', top: direction.includes('n') ? '-6px' : direction.includes('s') ? 'calc(100% - 4px)' : 'calc(50% - 5px)' });
        box.appendChild(handle);
      }
      overlay.appendChild(box);
    }
  }
  function bindFrame() {
    doc = frame.contentDocument;
    overlay = doc.createElement('div'); overlay.id = 'been-editor-overlay';
    Object.assign(overlay.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '2147483647' });
    doc.body.appendChild(overlay);
    const editStyles = doc.createElement('style');
    editStyles.textContent = 'html[data-been-editing] [data-testid^="layout-"],html[data-been-editing] [data-testid^="custom-"]{touch-action:none!important;user-select:none!important}html[data-been-editing] [data-testid^="layout-"] iframe{pointer-events:none!important}';
    doc.head.appendChild(editStyles); doc.documentElement.dataset.beenEditing = '';
    doc.addEventListener('pointerdown', e => {
      if (preview || e.button !== 0) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const handle = e.target.closest('[data-handle]');
      const target = handle || e.target.closest('[data-testid]');
      const id = handle?.dataset.target || target?.dataset.testid;
      if (!ids().includes(id)) { selected = []; renderLayers(); renderProperties(); drawSelection(); return; }
      if (!handle) {
        if (e.shiftKey) { select(id, true); return; }
        if (!selected.includes(id)) select(id, false);
      }
      if (item(id).locked || item(id).hidden) return;
      const r = rect(id); if (!r) return;
      gesture = { id, ids: topSelection().filter(x => !item(x).locked), direction: handle?.dataset.handle, x: e.clientX, y: e.clientY, initial: layout, r, scale: runtime.scale(), moved: false, pointerId: e.pointerId };
      doc.documentElement.setPointerCapture(e.pointerId);
    }, true);
    doc.addEventListener('pointermove', e => {
      if (!gesture) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const g = gesture;
      let dx = (e.clientX - g.x) / g.scale, dy = (e.clientY - g.y) / g.scale;
      if ($('snap').checked && !e.altKey) { dx = Math.round(dx / 8) * 8; dy = Math.round(dy / 8) * 8; }
      if (!dx && !dy && !g.moved) return;
      g.moved = true;
      if (g.direction) {
        const old = M.get(g.initial, g.id) || {}, width = g.r.width / g.scale, height = g.r.height / g.scale;
        const changes = {};
        if (/[ew]/.test(g.direction)) {
          changes.width = Math.max(8, Math.min(4000, width + (g.direction.includes('w') ? -dx : dx)));
          if (g.direction.includes('w')) changes.x = (old.x || 0) + width - changes.width;
        }
        if (/[ns]/.test(g.direction)) {
          changes.height = Math.max(8, Math.min(4000, height + (g.direction.includes('n') ? -dy : dy)));
          if (g.direction.includes('n')) changes.y = (old.y || 0) + height - changes.height;
        }
        layout = preserveOrigin(M.update(g.initial, g.id, changes), g.id,
          g.r.x + ((changes.x ?? old.x ?? 0) - (old.x || 0)) * g.scale,
          g.r.y + ((changes.y ?? old.y ?? 0) - (old.y || 0)) * g.scale);
      } else layout = M.move(g.initial, g.ids, dx, dy);
      runtime.apply(layout); drawSelection(); renderProperties();
    }, true);
    const finish = e => {
      if (!gesture) return;
      const g = gesture; gesture = null;
      if (doc.documentElement.hasPointerCapture(g.pointerId)) doc.documentElement.releasePointerCapture(g.pointerId);
      if (e.type === 'pointercancel') layout = g.initial;
      else if (g.moved) { past.push(g.initial); if (past.length > 60) past.shift(); future = []; }
      sync();
    };
    doc.addEventListener('pointerup', finish, true); doc.addEventListener('pointercancel', finish, true);
    doc.addEventListener('click', e => { if (!preview) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    doc.addEventListener('dblclick', e => { if (!preview) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    doc.addEventListener('keydown', keydown, true);
    doc.addEventListener('scroll', drawSelection, true);
    frame.contentWindow.addEventListener('resize', () => { requestAnimationFrame(() => { renderProperties(); drawSelection(); }); });
  }
  function keydown(e) {
    if (e.target.closest?.('input,textarea,select,[contenteditable=true]')) return;
    const mod = e.ctrlKey || e.metaKey, key = e.key.toLowerCase();
    if (mod && key === 's') { e.preventDefault(); save(); return; }
    if (preview) return;
    if (mod && key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if (mod && key === 'y') { e.preventDefault(); redo(); return; }
    if (mod && key === 'd') { e.preventDefault(); duplicate(); return; }
    if (key === 'escape') { selected = []; renderLayers(); renderProperties(); drawSelection(); return; }
    if (key === 'delete' || key === 'backspace') { e.preventDefault(); remove(); return; }
    const directions = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] };
    if (directions[key] && selected.length) {
      e.preventDefault(); const step = (e.shiftKey ? 10 : 1) / (runtime?.scale() || 1);
      commit(M.move(layout, topSelection(), directions[key][0] * step, directions[key][1] * step));
    }
  }
  function undo() { if (!past.length) return; future.push(layout); layout = past.pop(); selected = selected.filter(id => ids().includes(id)); sync(); }
  function redo() { if (!future.length) return; past.push(layout); layout = future.pop(); selected = selected.filter(id => ids().includes(id)); sync(); }
  function save() {
    try {
      const valid = M.parse(layout), raw = JSON.stringify(valid);
      if (raw.length > M.MAX_BYTES) throw Error('설정 파일이 너무 큽니다. 추가한 이미지 수를 줄여 주세요.');
      localStorage.setItem(M.ACTIVE_KEY, raw); saved = raw;
      sync(); status('저장했습니다. 이 브라우저의 메인 화면에도 적용됩니다.');
    } catch (e) { status('저장하지 못했습니다. JSON으로 내보내 주세요. ' + e.message, true); }
  }
  function remove() { change({ hidden: true }); }
  function newId() { return 'custom-' + crypto.randomUUID(); }
  function add(kind, src) {
    const id = newId();
    const addition = { id, kind, name: { text: '새 텍스트', button: '새 버튼', image: '새 이미지', box: '새 도형' }[kind], text: { text: '여기에 내용을 입력하세요', button: '버튼', image: '', box: '' }[kind], x: 32, y: 140, width: kind === 'image' ? 180 : 160, height: kind === 'image' ? 120 : 48, background: kind === 'button' || kind === 'box' ? '#c0e6ee' : 'transparent', color: '#284653', radius: kind === 'button' ? 14 : 0, fontSize: 16 };
    if (kind === 'image') addition.src = src;
    if (commit({ ...layout, additions: [...layout.additions, addition] })) select(id, false);
  }
  function duplicate() {
    if (!selected.length || !selected.every(id => id.startsWith('custom-'))) { status('직접 추가한 텍스트·버튼·이미지·도형을 복제할 수 있습니다.'); return; }
    const copies = selected.map(id => ({ ...item(id), id: newId(), name: name(id) + ' 복사', x: (item(id).x || 0) + 16, y: (item(id).y || 0) + 16, locked: false, hidden: false }));
    if (commit({ ...layout, additions: [...layout.additions, ...copies] })) { selected = copies.map(x => x.id); renderLayers(); renderProperties(); drawSelection(); }
  }
  function align(direction) {
    const entries = topSelection().map(id => ({ id, r: rect(id) })).filter(entry => entry.r && !item(entry.id).hidden && !item(entry.id).locked);
    if (!entries.length) return;
    const root = runtime.root().getBoundingClientRect();
    const bounds = entries.length === 1 ? { x: 0, y: 0, width: root.width, height: root.height } : {
      x: Math.min(...entries.map(e => e.r.x)), y: Math.min(...entries.map(e => e.r.y)),
      width: Math.max(...entries.map(e => e.r.x + e.r.width)) - Math.min(...entries.map(e => e.r.x)),
      height: Math.max(...entries.map(e => e.r.y + e.r.height)) - Math.min(...entries.map(e => e.r.y)),
    };
    let next = layout;
    for (const { id, r } of entries) {
      let dx = 0, dy = 0;
      if (direction === 'left') dx = bounds.x - r.x;
      if (direction === 'center') dx = bounds.x + (bounds.width - r.width) / 2 - r.x;
      if (direction === 'right') dx = bounds.x + bounds.width - r.width - r.x;
      if (direction === 'top') dy = bounds.y - r.y;
      if (direction === 'middle') dy = bounds.y + (bounds.height - r.height) / 2 - r.y;
      if (direction === 'bottom') dy = bounds.y + bounds.height - r.height - r.y;
      next = M.move(next, [id], dx / runtime.scale(), dy / runtime.scale());
    }
    commit(next);
  }
  function setZoom(value) {
    zoom = Math.min(2, Math.max(.2, value));
    frame.style.width = viewport.width + 'px'; frame.style.height = viewport.height + 'px'; frame.style.transform = `scale(${zoom})`;
    $('frame-wrap').style.width = viewport.width * zoom + 'px'; $('frame-wrap').style.height = viewport.height * zoom + 'px';
    $('zoom-label').value = Math.round(zoom * 100) + '%';
  }
  function fit() { const box = $('canvas-scroll').getBoundingClientRect(); setZoom(Math.min((box.width - 76) / viewport.width, (box.height - 76) / viewport.height, 1)); }
  $('undo').onclick = undo; $('redo').onclick = redo; $('save').onclick = save; $('delete').onclick = remove; $('duplicate').onclick = duplicate;
  $('lock').onclick = () => {
    const locked = !selected.every(id => item(id).locked);
    commit(selected.reduce((next, id) => M.update(next, id, { locked }), layout));
  };
  $('restore').onclick = () => {
    let next = layout;
    for (const id of selected) {
      if (item(id).locked) continue;
      if (id.startsWith('custom-')) next = M.update(next, id, { x: 32, y: 140, width: 160, height: 48, hidden: false, z: 0 });
      else { const elements = { ...next.elements }; delete elements[id]; next = { ...next, elements }; }
    }
    commit(next);
  };
  $('forward').onclick = () => {
    let next = layout; for (const id of selected) if (!item(id).locked) next = M.update(next, id, { z: Math.min(200, (item(id).z || 0) + 1) }); commit(next);
  };
  $('backward').onclick = () => {
    let next = layout; for (const id of selected) if (!item(id).locked) next = M.update(next, id, { z: Math.max(-50, (item(id).z || 0) - 1) }); commit(next);
  };
  for (const key of ['x', 'y', 'width', 'height']) $('prop-' + key).addEventListener('change', e => {
    if (selected.length !== 1 || !runtime) return;
    const value = e.target.valueAsNumber, r = rect(selected[0]);
    if (!r || !Number.isFinite(value)) { renderProperties(); return; }
    const scale = runtime.scale();
    if (key === 'x' || key === 'y') change({ [key]: (item(selected[0])[key] || 0) + (value - r[key]) / scale });
    else {
      const id = selected[0];
      if (item(id).locked) return;
      try {
        const next = M.parse(M.update(layout, id, { [key]: value / scale }));
        commit(preserveOrigin(next, id, r.x, r.y));
      } catch (error) { status(error.message, true); renderProperties(); }
    }
  });
  for (const key of ['name', 'text', 'href', 'fontSize', 'radius', 'color', 'background']) $('prop-' + key).addEventListener('change', e => change({ [key]: ['fontSize', 'radius'].includes(key) ? e.target.valueAsNumber : e.target.value }));
  document.querySelectorAll('[data-align]').forEach(button => button.onclick = () => align(button.dataset.align));
  document.querySelectorAll('[data-add]').forEach(button => button.onclick = () => add(button.dataset.add));
  $('add-image').onclick = () => $('image-file').click();
  $('image-file').onchange = async e => {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { status('이미지는 2MB 이하로 선택해 주세요.', true); return; }
    try {
      const src = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
      M.safeImage(src); add('image', src);
    } catch { status('이미지를 읽지 못했습니다. PNG, JPG, WebP, GIF 파일을 선택해 주세요.', true); }
  };
  $('export').onclick = () => {
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'been-layout.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); status('설정 파일을 내보냈습니다. 다른 브라우저에서도 불러올 수 있습니다.');
  };
  $('import').onclick = () => $('import-file').click();
  $('import-file').onchange = async e => {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return;
    try {
      if (file.size > M.MAX_BYTES) throw Error('설정 파일은 5MB 이하만 불러올 수 있습니다.');
      const next = M.parse(await file.text()); commit(next); selected = []; sync(); status('설정을 불러왔습니다. 적용하려면 저장해 주세요.');
    } catch (error) { status('불러오지 못했습니다. 현재 편집 내용은 유지됩니다. ' + error.message, true); }
  };
  $('reset').onclick = () => { if (confirm('모든 배치를 기본값으로 되돌릴까요? 실행 취소로 복구할 수 있습니다.')) { commit(M.empty()); selected = []; sync(); status('기본 배치로 되돌렸습니다. 적용하려면 저장해 주세요.'); } };
  $('viewport').onchange = e => { const [width, height] = e.target.value.split(',').map(Number); viewport = { width, height }; setZoom(zoom); fit(); setTimeout(() => { runtime?.apply(layout); renderProperties(); drawSelection(); }, 100); };
  $('zoom-out').onclick = () => setZoom(zoom - .1); $('zoom-in').onclick = () => setZoom(zoom + .1); $('fit').onclick = fit;
  $('toggle-layers').onclick = () => { const open = document.querySelector('.layers').classList.toggle('open'); $('toggle-layers').setAttribute('aria-expanded', String(open)); };
  $('preview').onclick = () => {
    preview = !preview; document.body.classList.toggle('preview', preview); $('preview').setAttribute('aria-pressed', String(preview)); $('preview').textContent = preview ? '편집으로 돌아가기' : '미리보기';
    if (doc) { if (preview) delete doc.documentElement.dataset.beenEditing; else doc.documentElement.dataset.beenEditing = ''; }
    document.querySelector('.inspector').classList.toggle('inactive', preview);
    $('mode-hint').textContent = preview ? '앱의 버튼과 지도가 실제로 동작합니다.' : '드래그로 이동 · 모서리로 크기 조절';
    if (!preview && !runtime?.root()) { frame.src = '../?layout-editor=1&return=' + Date.now(); connect(); }
    drawSelection();
  };
  document.addEventListener('keydown', keydown);
  window.addEventListener('beforeunload', e => { if (JSON.stringify(layout) !== saved) { e.preventDefault(); e.returnValue = ''; } });
  let connectionTimer;
  function connect() {
    clearInterval(connectionTimer); runtime = null;
    let attempts = 0;
    connectionTimer = setInterval(() => {
      attempts++;
      try {
        const api = frame.contentWindow?.BeenLayout;
        if (api?.root()) {
          clearInterval(connectionTimer); runtime = api; bindFrame(); sync();
          status(initialMessage || api.error || '편집 준비 완료. 요소를 드래그해 자유롭게 이동해 보세요.'); initialMessage = '';
        } else if (attempts === 120) { clearInterval(connectionTimer); status('화면 연결이 늦어지고 있습니다. 페이지를 새로고침해 주세요.', true); }
      } catch { clearInterval(connectionTimer); status('동일한 사이트에서 편집기를 열어 주세요.', true); }
    }, 250);
  }
  setZoom(zoom); fit(); renderLayers(); renderProperties(); connect();
})();
