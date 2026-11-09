/* =========================================================
   Trang quản trị – đơn hàng, sản phẩm, banner, nội dung, cài đặt
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const h = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => (Number(n) || 0).toLocaleString('vi-VN') + 'đ';
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const app = $('#app');

  const toast = (msg, type = '') => {
    const t = $('#toast');
    t.textContent = msg; t.className = 'toast is-show ' + type;
    clearTimeout(toast._t); toast._t = setTimeout(() => (t.className = 'toast'), 2800);
  };

  async function api(path, opts = {}) {
    const o = { method: 'GET', credentials: 'same-origin', ...opts, headers: { 'x-admin': '1', ...(opts.headers || {}) } };
    if (o.body && !(o.body instanceof FormData)) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(o.body); }
    const res = await fetch(path, o);
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== '/api/admin/login') { showLogin(); throw new Error(data.error || 'Cần đăng nhập'); }
    if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra');
    return data;
  }

  /* ---------------- xử lý ảnh trước khi tải lên ---------------- */
  async function compress(file, maxSide = 2000) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
      if (scale === 1 && file.size < 900 * 1024) return file;
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.86));
      return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' }) : file;
    } catch (e) { return file; }
  }
  async function uploadFile(file) {
    const fd = new FormData();
    fd.append('file', await compress(file));
    return (await api('/api/admin/upload', { method: 'POST', body: fd })).url;
  }
  function pickFiles(multiple) {
    return new Promise((resolve) => {
      const i = document.createElement('input');
      i.type = 'file'; i.accept = 'image/jpeg,image/png,image/webp,image/gif'; i.multiple = !!multiple;
      i.onchange = () => resolve(Array.from(i.files || []));
      i.click();
    });
  }

  /* ---------------- trạng thái ---------------- */
  const state = { me: null, site: null, draft: null, products: [], orders: [], page: 'orders', orderFilter: 'all', orderQ: '', dirty: false };
  const STATUS = { new: 'Mới', confirmed: 'Đã xác nhận', shipping: 'Đang giao', done: 'Hoàn thành', cancelled: 'Đã huỷ' };

  /* ---------------- đăng nhập ---------------- */
  function showLogin() {
    app.innerHTML = `<div class="login">
      <form class="login__card" id="loginForm">
        <div class="brandmark"></div>
        <h1>Quản trị website</h1>
        <p>Nhập mật khẩu quản trị để tiếp tục.</p>
        <label class="f"><span>Mật khẩu</span><input type="password" name="password" autocomplete="current-password" autofocus required></label>
        <p class="err" id="loginErr"></p>
        <button class="b b--primary b--block">Đăng nhập</button>
        <a href="/" class="muted-link">← Về trang chủ</a>
      </form></div>`;
    $('#loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api('/api/admin/login', { method: 'POST', body: { password: e.target.password.value } });
        boot();
      } catch (ex) { $('#loginErr').textContent = ex.message; }
    });
  }

  async function boot() {
    try { state.me = await api('/api/admin/me'); } catch (e) { return; }
    const [site, products, orders] = await Promise.all([api('/api/admin/site'), api('/api/admin/products'), api('/api/admin/orders')]);
    state.site = site; state.draft = clone(site); state.products = products; state.orders = orders;
    const fromHash = location.hash.slice(1);
    if (PAGES[fromHash]) state.page = fromHash;
    shell();
    setInterval(refreshOrders, 60000);
  }

  async function refreshOrders(manual) {
    try {
      const before = state.orders.filter((o) => o.status === 'new').length;
      state.orders = await api('/api/admin/orders');
      const now = state.orders.filter((o) => o.status === 'new').length;
      if (now > before) toast(`🔔 Có ${now - before} đơn hàng mới!`, 'ok');
      else if (manual) toast('Đã cập nhật danh sách đơn');
      updateBadge();
      if (state.page === 'orders') renderPage();
    } catch (e) { /* bỏ qua */ }
  }

  /* ---------------- khung giao diện ---------------- */
  const PAGES = {
    orders: { label: 'Đơn hàng', icon: '🧾' },
    products: { label: 'Sản phẩm', icon: '🖼' },
    banner: { label: 'Banner & thông báo', icon: '🎞' },
    content: { label: 'Nội dung trang', icon: '✎' },
    settings: { label: 'Cài đặt & liên hệ', icon: '⚙' },
  };

  function shell() {
    app.innerHTML = `<div class="layout">
      <aside class="side" id="side">
        <div class="side__brand"><div class="brandmark brandmark--sm"></div><div><b>${h(state.site.brand.name)}</b><small>Bảng quản trị</small></div></div>
        <nav class="side__nav">${Object.entries(PAGES).map(([k, p]) => `<button data-page="${k}"><span>${p.icon}</span>${p.label}${k === 'orders' ? '<em id="newBadge"></em>' : ''}</button>`).join('')}</nav>
        <div class="side__foot">
          <a href="/" target="_blank" class="b b--ghost b--block">Xem website ↗</a>
          <button class="b b--text b--block" id="logout">Đăng xuất</button>
        </div>
      </aside>
      <div class="main">
        <header class="topbar"><button class="b b--icon menu-btn" id="menuBtn" aria-label="Menu">☰</button><h1 id="pageTitle"></h1><div class="topbar__actions" id="topActions"></div></header>
        ${state.me.defaultPassword ? `<div class="warn">⚠ Đang dùng mật khẩu mặc định <b>admin123</b>. Hãy đặt biến môi trường <code>ADMIN_PASSWORD</code> trên Render.</div>` : ''}
        ${state.me.storage === 'file' ? `<div class="warn warn--info">ℹ Đang lưu dữ liệu dạng file. Trên Render gói miễn phí, dữ liệu & ảnh tải lên sẽ mất khi deploy lại – hãy cấu hình <code>MONGODB_URI</code> (MongoDB Atlas miễn phí) để lưu vĩnh viễn.</div>` : ''}
        <div class="page" id="page"></div>
      </div>
    </div>
    <div class="sheet" id="sheet" aria-hidden="true"><div class="sheet__bg" data-sheet-close></div><div class="sheet__panel" id="sheetPanel"></div></div>`;
    $$('.side__nav button').forEach((b) => b.addEventListener('click', () => go(b.dataset.page)));
    $('#logout').addEventListener('click', async () => { await api('/api/admin/logout', { method: 'POST' }); showLogin(); });
    $('#menuBtn').addEventListener('click', () => $('#side').classList.toggle('is-open'));
    $('#sheet').addEventListener('click', (e) => { if (e.target.closest('[data-sheet-close]')) closeSheet(); });
    updateBadge();
    renderPage();
  }

  function go(page) {
    if (state.dirty && !confirm('Bạn có thay đổi chưa lưu. Rời trang này?')) return;
    if (state.dirty) { state.draft = clone(state.site); state.dirty = false; }
    state.page = page; location.hash = page;
    $('#side').classList.remove('is-open');
    renderPage();
  }
  function updateBadge() {
    const n = state.orders.filter((o) => o.status === 'new').length;
    const b = $('#newBadge'); if (b) { b.textContent = n || ''; b.hidden = !n; }
  }
  function renderPage() {
    $$('.side__nav button').forEach((b) => b.classList.toggle('is-active', b.dataset.page === state.page));
    $('#pageTitle').textContent = PAGES[state.page].label;
    $('#topActions').innerHTML = '';
    ({ orders: pageOrders, products: pageProducts, banner: pageBanner, content: pageContent, settings: pageSettings })[state.page]();
  }
  window.addEventListener('beforeunload', (e) => { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });

  function openSheet(html) { $('#sheetPanel').innerHTML = html; $('#sheet').classList.add('is-open'); $('#sheetPanel').scrollTop = 0; }
  function closeSheet() { $('#sheet').classList.remove('is-open'); }

  /* =====================================================
     ĐƠN HÀNG
     ===================================================== */
  function pageOrders() {
    const O = state.orders;
    const counts = Object.fromEntries(Object.keys(STATUS).map((k) => [k, O.filter((o) => o.status === k).length]));
    const revenue = O.filter((o) => ['confirmed', 'shipping', 'done'].includes(o.status)).reduce((s, o) => s + o.total, 0);
    const q = state.orderQ.toLowerCase();
    const list = O.filter((o) => (state.orderFilter === 'all' || o.status === state.orderFilter)
      && (!q || [o.code, o.name, o.phone, o.address].join(' ').toLowerCase().includes(q)));
    $('#topActions').innerHTML = `<button class="b b--ghost" id="refreshOrders">↻ Làm mới</button><button class="b b--ghost" id="csv">⬇ Xuất Excel (CSV)</button>`;
    $('#page').innerHTML = `
      <div class="stats">
        <div class="stat stat--accent"><span>Đơn mới cần xử lý</span><b>${counts.new}</b></div>
        <div class="stat"><span>Tổng số đơn</span><b>${O.length}</b></div>
        <div class="stat"><span>Doanh thu (đã xác nhận)</span><b>${money(revenue)}</b></div>
        <div class="stat"><span>Sản phẩm đang bán</span><b>${state.products.filter((p) => p.visible).length}</b></div>
      </div>
      <div class="toolbar">
        <div class="tabs">${[['all', 'Tất cả', O.length], ...Object.entries(STATUS).map(([k, v]) => [k, v, counts[k]])].map(([k, v, n]) => `<button class="${state.orderFilter === k ? 'is-active' : ''}" data-f="${k}">${v} <em>${n}</em></button>`).join('')}</div>
        <input class="search" id="orderQ" placeholder="Tìm mã đơn, tên, SĐT…" value="${h(state.orderQ)}">
      </div>
      ${list.length ? `<div class="table-wrap"><table class="table">
        <thead><tr><th>Mã đơn</th><th>Thời gian</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>${list.map((o) => `<tr data-id="${o.id}" class="${o.status === 'new' ? 'is-new' : ''}">
          <td><b>${h(o.code)}</b></td>
          <td>${new Date(o.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</td>
          <td><b>${h(o.name)}</b><br><a href="tel:${h(o.phone)}">${h(o.phone)}</a></td>
          <td class="t-items">${o.items.map((i) => `${h(i.code)} · ${h(i.size)} × ${i.qty}`).join('<br>')}</td>
          <td><b>${money(o.total)}</b></td>
          <td><select class="status status--${o.status}" data-status="${o.id}">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === o.status ? 'selected' : ''}>${v}</option>`).join('')}</select></td>
          <td class="t-act"><button class="b b--sm b--ghost" data-view="${o.id}">Chi tiết</button></td>
        </tr>`).join('')}</tbody></table></div>`
      : `<div class="empty-state"><b>Chưa có đơn hàng nào</b><p>Đơn đặt từ website sẽ hiện ở đây.</p></div>`}`;

    $$('.tabs button').forEach((b) => b.addEventListener('click', () => { state.orderFilter = b.dataset.f; pageOrders(); }));
    const qi = $('#orderQ');
    qi.addEventListener('input', () => { state.orderQ = qi.value; clearTimeout(qi._t); qi._t = setTimeout(() => { pageOrders(); const n = $('#orderQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); });
    $$('[data-status]').forEach((s) => s.addEventListener('change', () => setStatus(s.dataset.status, s.value)));
    $$('[data-view]').forEach((b) => b.addEventListener('click', () => viewOrder(b.dataset.view)));
    $('#refreshOrders').addEventListener('click', () => refreshOrders(true));
    $('#csv').addEventListener('click', exportCSV);
  }

  async function setStatus(id, status) {
    try {
      const o = await api('/api/admin/orders/' + id, { method: 'PATCH', body: { status } });
      Object.assign(state.orders.find((x) => x.id === id), o);
      toast('Đã cập nhật: ' + STATUS[status], 'ok'); updateBadge();
      if (state.page === 'orders') pageOrders();
    } catch (e) { toast(e.message, 'err'); }
  }

  function viewOrder(id) {
    const o = state.orders.find((x) => x.id === id); if (!o) return;
    const zalo = 'https://zalo.me/' + o.phone.replace(/\D/g, '').replace(/^84/, '0');
    openSheet(`<div class="sheet__head"><h2>Đơn ${h(o.code)}</h2><button class="b b--icon" data-sheet-close>✕</button></div>
      <div class="sheet__body">
        <p class="muted">${new Date(o.createdAt).toLocaleString('vi-VN')}</p>
        <div class="kv"><span>Khách hàng</span><b>${h(o.name)}</b></div>
        <div class="kv"><span>Điện thoại</span><b><a href="tel:${h(o.phone)}">${h(o.phone)}</a></b></div>
        <div class="kv"><span>Địa chỉ</span><b>${h(o.address)}</b></div>
        ${o.note ? `<div class="kv"><span>Ghi chú của khách</span><b>${h(o.note)}</b></div>` : ''}
        <div class="row-btns"><a class="b b--primary" href="tel:${h(o.phone)}">☎ Gọi khách</a><a class="b b--ghost" href="${zalo}" target="_blank" rel="noopener">Zalo</a></div>
        <h3>Sản phẩm</h3>
        <div class="o-items">${o.items.map((i) => `<div class="o-item"><img src="${h(i.image)}" alt=""><div><b>${h(i.name)}</b><small>${h(i.code)} · ${h(i.size)}</small><small>${money(i.price)} × ${i.qty}</small></div><b>${money(i.price * i.qty)}</b></div>`).join('')}</div>
        <div class="kv kv--total"><span>Tổng cộng</span><b>${money(o.total)}</b></div>
        <label class="f"><span>Trạng thái</span><select id="oStatus">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === o.status ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label class="f"><span>Ghi chú nội bộ</span><textarea id="oNote" rows="3">${h(o.adminNote)}</textarea></label>
        <div class="row-btns"><button class="b b--primary" id="oSave">Lưu</button><button class="b b--danger" id="oDel">Xoá đơn</button></div>
      </div>`);
    $('#oSave').addEventListener('click', async () => {
      try {
        const u = await api('/api/admin/orders/' + id, { method: 'PATCH', body: { status: $('#oStatus').value, adminNote: $('#oNote').value } });
        Object.assign(o, u); toast('Đã lưu đơn hàng', 'ok'); closeSheet(); updateBadge(); pageOrders();
      } catch (e) { toast(e.message, 'err'); }
    });
    $('#oDel').addEventListener('click', async () => {
      if (!confirm(`Xoá vĩnh viễn đơn ${o.code}? Không thể hoàn tác.`)) return;
      await api('/api/admin/orders/' + id, { method: 'DELETE' });
      state.orders = state.orders.filter((x) => x.id !== id); closeSheet(); updateBadge(); pageOrders(); toast('Đã xoá đơn');
    });
  }

  function exportCSV() {
    const rows = [['Mã đơn', 'Thời gian', 'Khách hàng', 'Điện thoại', 'Địa chỉ', 'Sản phẩm', 'Tổng tiền', 'Trạng thái', 'Ghi chú khách', 'Ghi chú nội bộ']];
    state.orders.forEach((o) => rows.push([o.code, new Date(o.createdAt).toLocaleString('vi-VN'), o.name, o.phone, o.address,
      o.items.map((i) => `${i.code} ${i.name} (${i.size}) x${i.qty}`).join('; '), o.total, STATUS[o.status], o.note, o.adminNote || '']));
    const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `don-hang-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  }

  /* =====================================================
     FORM TỔNG QUÁT (dựa trên schema)
     ===================================================== */
  const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  function setPath(obj, path, val) {
    const ks = path.split('.'); let o = obj;
    ks.slice(0, -1).forEach((k, i) => { if (o[k] == null) o[k] = /^\d+$/.test(ks[i + 1]) ? [] : {}; o = o[k]; });
    o[ks[ks.length - 1]] = val;
  }
  const blankOf = (fields) => Object.fromEntries(fields.map((f) => [f.k, f.t === 'list' ? [] : f.t === 'toggle' ? false : f.t === 'number' ? 0 : '']));

  function fieldHTML(f, root, base) {
    const path = base ? base + '.' + f.k : f.k;
    const v = getPath(root, path);
    const hint = f.hint ? `<small class="hint">${f.hint}</small>` : '';
    switch (f.t) {
      case 'textarea': return `<label class="f ${f.wide ? 'f--wide' : ''}"><span>${f.label}</span><textarea data-path="${path}" rows="${f.rows || 3}">${h(v)}</textarea>${hint}</label>`;
      case 'number': return `<label class="f"><span>${f.label}</span><input type="number" min="0" step="${f.step || 1000}" data-path="${path}" data-num value="${h(v)}">${hint}</label>`;
      case 'color': return `<label class="f"><span>${f.label}</span><div class="color"><input type="color" data-path="${path}" value="${h(v || '#b07a3c')}"><code>${h(v)}</code></div>${hint}</label>`;
      case 'datetime': return `<label class="f"><span>${f.label}</span><input type="datetime-local" data-path="${path}" value="${h(v)}">${hint}</label>`;
      case 'toggle': return `<label class="f f--toggle"><input type="checkbox" data-path="${path}" data-bool ${v ? 'checked' : ''}><i></i><span>${f.label}</span>${hint}</label>`;
      case 'lines': return `<label class="f f--wide"><span>${f.label}</span><textarea data-path="${path}" data-lines rows="${f.rows || 4}">${h((v || []).join('\n'))}</textarea>${hint || '<small class="hint">Mỗi dòng một mục.</small>'}</label>`;
      case 'image': return `<div class="f f--wide"><span>${f.label}</span><div class="img-field">
          <div class="img-field__preview">${v ? `<img src="${h(v)}" alt="">` : '<em>Chưa có ảnh</em>'}</div>
          <div class="img-field__ctrl"><button type="button" class="b b--ghost b--sm" data-upload="${path}">⬆ Tải ảnh lên</button>
          <input data-path="${path}" value="${h(v)}" placeholder="hoặc dán đường dẫn ảnh…">${v ? `<button type="button" class="b b--text b--sm" data-clear="${path}">Xoá ảnh</button>` : ''}</div>
        </div>${hint}</div>`;
      case 'images': {
        const arr = v || [];
        return `<div class="f f--wide"><span>${f.label}</span><div class="gallery">
          ${arr.map((u, i) => `<div class="gallery__item"><img src="${h(u)}" alt=""><div class="gallery__ctrl">
            <button type="button" data-img-move="${path}|${i}|-1" title="Sang trái" ${i ? '' : 'disabled'}>←</button>
            <button type="button" data-img-del="${path}|${i}" title="Xoá">✕</button>
            <button type="button" data-img-move="${path}|${i}|1" title="Sang phải" ${i < arr.length - 1 ? '' : 'disabled'}>→</button></div>${i ? '' : '<em>Ảnh đại diện</em>'}</div>`).join('')}
          <button type="button" class="gallery__add" data-img-add="${path}">＋<span>Thêm ảnh</span></button>
        </div>${hint || '<small class="hint">Ảnh đầu tiên là ảnh đại diện. Có thể chọn nhiều ảnh cùng lúc. Ảnh được tự động nén.</small>'}</div>`;
      }
      case 'list': {
        const arr = v || [];
        return `<div class="f f--wide list ${f.compact ? 'list--compact' : ''}"><span class="list__label">${f.label}</span>
          ${arr.map((_, i) => `<div class="list__item"><div class="list__head"><b>${f.item || 'Mục'} ${i + 1}</b><div>
            <button type="button" class="b b--icon b--sm" data-move="${path}|${i}|-1" ${i ? '' : 'disabled'} title="Lên">↑</button>
            <button type="button" class="b b--icon b--sm" data-move="${path}|${i}|1" ${i < arr.length - 1 ? '' : 'disabled'} title="Xuống">↓</button>
            <button type="button" class="b b--icon b--sm b--danger-text" data-del="${path}|${i}" title="Xoá">✕</button></div></div>
            <div class="list__fields">${f.fields.map((sf) => fieldHTML(sf, root, path + '.' + i)).join('')}</div></div>`).join('')}
          <button type="button" class="b b--ghost b--sm" data-add="${path}">＋ Thêm ${(f.item || 'mục').toLowerCase()}</button></div>`;
      }
      default: return `<label class="f ${f.wide ? 'f--wide' : ''}"><span>${f.label}</span><input data-path="${path}" value="${h(v)}" ${f.list ? `list="${f.list}"` : ''} placeholder="${h(f.ph || '')}">${hint}</label>`;
    }
  }

  /** Gắn sự kiện cho form; rerender() vẽ lại khi cấu trúc đổi (thêm/xoá mục) */
  function bindForm(container, root, rerender, onChange) {
    const changed = () => onChange && onChange();
    container.addEventListener('input', (e) => {
      const el = e.target; const path = el.dataset.path; if (!path) return;
      let val = el.value;
      if ('bool' in el.dataset) val = el.checked;
      else if ('num' in el.dataset) val = Number(val) || 0;
      else if ('lines' in el.dataset) val = val.split('\n').map((s) => s.trim()).filter(Boolean);
      setPath(root, path, val);
      if (el.type === 'color') el.nextElementSibling.textContent = val;
      if (el.closest('.img-field')) { const pv = el.closest('.img-field').querySelector('.img-field__preview'); pv.innerHTML = val ? `<img src="${h(val)}" alt="">` : '<em>Chưa có ảnh</em>'; }
      changed();
    });
    container.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const d = b.dataset;
      const fieldsFor = (path) => findListFields(path);
      if (d.add) { const arr = getPath(root, d.add) || []; arr.push(blankOf(fieldsFor(d.add) || [])); setPath(root, d.add, arr); changed(); rerender(); }
      else if (d.del) { const [p, i] = d.del.split('|'); if (!confirm('Xoá mục này?')) return; getPath(root, p).splice(+i, 1); changed(); rerender(); }
      else if (d.move) { const [p, i, dir] = d.move.split('|'); const arr = getPath(root, p); const j = +i + +dir; [arr[i], arr[j]] = [arr[j], arr[i]]; changed(); rerender(); }
      else if (d.upload) {
        const [file] = await pickFiles(false); if (!file) return;
        b.disabled = true; b.textContent = 'Đang tải…';
        try { setPath(root, d.upload, await uploadFile(file)); changed(); rerender(); toast('Đã tải ảnh lên', 'ok'); }
        catch (ex) { toast(ex.message, 'err'); b.disabled = false; b.textContent = '⬆ Tải ảnh lên'; }
      }
      else if (d.clear) { setPath(root, d.clear, ''); changed(); rerender(); }
      else if (d.imgAdd) {
        const files = await pickFiles(true); if (!files.length) return;
        b.classList.add('is-loading');
        const arr = getPath(root, d.imgAdd) || [];
        for (const f of files) { try { arr.push(await uploadFile(f)); } catch (ex) { toast(ex.message, 'err'); } }
        setPath(root, d.imgAdd, arr); changed(); rerender();
      }
      else if (d.imgDel) { const [p, i] = d.imgDel.split('|'); getPath(root, p).splice(+i, 1); changed(); rerender(); }
      else if (d.imgMove) { const [p, i, dir] = d.imgMove.split('|'); const arr = getPath(root, p); const j = +i + +dir; [arr[i], arr[j]] = [arr[j], arr[i]]; changed(); rerender(); }
    });
  }

  let activeSchema = [];
  function findListFields(path) {
    const keys = path.split('.').filter((k) => !/^\d+$/.test(k));
    let fields = activeSchema.flatMap((s) => (s.prefix ? [{ k: s.prefix, t: 'group', fields: s.fields }] : s.fields));
    let f;
    for (const k of keys) { f = fields.find((x) => x.k === k); if (!f) return null; fields = f.fields || []; }
    return f && f.fields;
  }

  /* ---------------- trang nội dung dựa trên schema ---------------- */
  function sectionsPage(schema, intro, extra) {
    activeSchema = schema;
    $('#page').innerHTML = (intro || '') + '<div id="formArea"></div>' + (extra || '');
    const area = $('#formArea');
    const draw = () => {
      const y = window.scrollY;
      area.innerHTML = schema.map((s) => `<section class="panel" id="sec-${s.prefix || 'root'}">
        <div class="panel__head"><h2>${s.title}</h2>${s.desc ? `<p>${s.desc}</p>` : ''}</div>
        <div class="panel__body form-grid">${s.fields.map((f) => fieldHTML(f, state.draft, s.prefix)).join('')}</div></section>`).join('');
      window.scrollTo(0, y);
    };
    $('#topActions').innerHTML = `<span class="dirty" id="dirty" hidden>● Chưa lưu</span><button class="b b--ghost" id="discard">Hoàn tác</button><button class="b b--primary" id="saveSite">Lưu thay đổi</button>`;
    const mark = () => { state.dirty = true; $('#dirty').hidden = false; };
    draw();
    bindForm(area, state.draft, draw, mark);
    if (state.dirty) $('#dirty').hidden = false;
    $('#discard').addEventListener('click', () => { if (!confirm('Bỏ mọi thay đổi chưa lưu?')) return; state.draft = clone(state.site); state.dirty = false; renderPage(); });
    $('#saveSite').addEventListener('click', saveSite);
  }
  async function saveSite() {
    const btn = $('#saveSite'); btn.disabled = true; btn.textContent = 'Đang lưu…';
    try {
      state.site = await api('/api/admin/site', { method: 'PUT', body: state.draft });
      state.draft = clone(state.site); state.dirty = false;
      $('#dirty').hidden = true; toast('Đã lưu! Website đã được cập nhật.', 'ok');
    } catch (e) { toast(e.message, 'err'); }
    btn.disabled = false; btn.textContent = 'Lưu thay đổi';
  }

  const T = (k, label, o = {}) => ({ k, t: 'text', label, ...o });
  const TA = (k, label, o = {}) => ({ k, t: 'textarea', label, ...o });

  function pageBanner() {
    sectionsPage([
      { prefix: 'hero', title: 'Banner đầu trang', desc: 'Các slide tự chuyển sau 6,5 giây. Ảnh nên dùng khổ ngang ≥ 1920 × 1080px.', fields: [
        { k: 'slides', t: 'list', label: 'Slide banner', item: 'Slide', fields: [
          { k: 'image', t: 'image', label: 'Ảnh nền' },
          T('eyebrow', 'Dòng chữ nhỏ phía trên'),
          TA('title', 'Tiêu đề lớn', { hint: 'Nhấn Enter để xuống dòng.', rows: 2 }),
          TA('subtitle', 'Mô tả ngắn', { rows: 2 }),
        ] },
        T('ctaPrimary', 'Chữ trên nút chính'), T('ctaSecondary', 'Chữ trên nút phụ'),
      ] },
      { prefix: 'music', title: 'Nút bật nhạc xuân', desc: 'Để trống link nhạc thì website tự chơi một giai điệu xuân nhẹ nhàng. Muốn dùng bài riêng, dán link file .mp3 (bạn cần có quyền sử dụng bài nhạc đó).', fields: [
        { k: 'enabled', t: 'toggle', label: 'Hiển thị nút nhạc xuân' }, T('label', 'Chữ trên nút'), T('url', 'Link file nhạc .mp3 (tuỳ chọn)', { wide: true }),
      ] },
      { prefix: 'announcement', title: 'Thanh thông báo trên cùng', fields: [{ k: 'enabled', t: 'toggle', label: 'Hiển thị thanh thông báo' }, T('text', 'Nội dung', { wide: true })] },
      { prefix: 'promo', title: 'Ưu đãi & đồng hồ đếm ngược', desc: 'Để trống ngày kết thúc để đồng hồ tự đếm đến hết ngày hôm nay (ưu đãi trong ngày).', fields: [
        { k: 'enabled', t: 'toggle', label: 'Hiển thị khối ưu đãi' }, T('eyebrow', 'Nhãn nhỏ'), T('title', 'Tiêu đề', { wide: true }), TA('text', 'Mô tả', { wide: true }),
        { k: 'endDate', t: 'datetime', label: 'Kết thúc lúc' },
      ] },
    ]);
  }

  function pageContent() {
    const sections = [
      { prefix: '', title: 'Các bộ sưu tập', desc: 'Mỗi bộ sưu tập hiển thị các sản phẩm có “Danh mục” trùng với ô Danh mục (VD: Mành Lịch Tết). Chưa có sản phẩm thì hiện lời mời nhắn Zalo.', fields: [
        { k: 'collections', t: 'list', label: 'Bộ sưu tập', item: 'Bộ sưu tập', fields: [
          T('category', 'Danh mục sản phẩm (phải trùng với danh mục của sản phẩm)'), T('navLabel', 'Chữ trên menu'), T('name', 'Tên dòng sản phẩm (VD: Mành In Tranh Lịch Tết)'), T('nameNote', 'Ghi chú tên (VD: Lịch treo tường độc đáo)'),
          TA('title', 'Tiêu đề (Enter để xuống dòng)', { rows: 2 }), TA('description', 'Mô tả', { wide: true, rows: 4 }),
          T('highlightsTitle', 'Tiêu đề khối điểm nhấn'), { k: 'highlights', t: 'lines', label: 'Ý nghĩa / điểm nhấn (mỗi dòng một ý)' }, TA('emptyText', 'Lời nhắn khi chưa có sản phẩm', { wide: true, rows: 2 }),
        ] },
      ] },
      { prefix: 'marquee', title: 'Dải chữ chạy', fields: [{ k: 'items', t: 'lines', label: 'Các cụm từ' }] },
      { prefix: 'intro', title: 'Giới thiệu', fields: [T('eyebrow', 'Nhãn nhỏ'), TA('statement', 'Câu tuyên ngôn lớn', { wide: true }), TA('body', 'Đoạn mô tả', { wide: true, rows: 4 }), { k: 'image', t: 'image', label: 'Ảnh minh hoạ (dọc 4:5)' },
        { k: 'stats', t: 'list', label: 'Số liệu nổi bật', item: 'Số liệu', compact: true, fields: [T('value', 'Con số'), T('suffix', 'Hậu tố (+, th…)'), T('label', 'Mô tả')] }] },
      { prefix: 'collection', title: 'Lưới tất cả sản phẩm', fields: [T('allTitle', 'Tiêu đề lưới tất cả sản phẩm')] },
      { prefix: 'spaces', title: 'Gợi ý không gian', fields: [T('eyebrow', 'Nhãn nhỏ'), TA('title', 'Tiêu đề', { rows: 2 }), TA('subtitle', 'Mô tả', { wide: true, rows: 2 }),
        { k: 'items', t: 'list', label: 'Không gian', item: 'Không gian', fields: [T('title', 'Tên không gian'), TA('text', 'Mô tả', { rows: 2 }), { k: 'image', t: 'image', label: 'Ảnh (ngang 4:3)' }] }] },
      { prefix: 'process', title: 'Quy trình / chất lượng', fields: [T('eyebrow', 'Nhãn nhỏ'), TA('title', 'Tiêu đề', { rows: 2 }),
        { k: 'steps', t: 'list', label: 'Các bước', item: 'Bước', fields: [T('title', 'Tên bước'), TA('text', 'Mô tả', { rows: 2 }), { k: 'image', t: 'image', label: 'Ảnh' }] }] },
      { prefix: 'features', title: 'Vì sao chọn chúng tôi', fields: [T('eyebrow', 'Nhãn nhỏ'), T('title', 'Tiêu đề'),
        { k: 'items', t: 'list', label: 'Lý do', item: 'Lý do', compact: true, fields: [T('icon', 'Biểu tượng (ký tự / emoji)'), T('title', 'Tiêu đề'), TA('text', 'Mô tả', { rows: 2 })] }] },
      { prefix: 'order', title: 'Khu đặt hàng', fields: [T('eyebrow', 'Nhãn nhỏ'), T('title', 'Tiêu đề'), TA('subtitle', 'Mô tả', { wide: true, rows: 2 }), T('shippingText', 'Cam kết (ngăn cách bằng dấu ·)', { wide: true }), TA('successText', 'Lời cảm ơn sau khi đặt', { wide: true, rows: 2 })] },
      { prefix: 'testimonials', title: 'Đánh giá khách hàng', fields: [T('eyebrow', 'Nhãn nhỏ'), T('title', 'Tiêu đề'),
        { k: 'items', t: 'list', label: 'Đánh giá', item: 'Đánh giá', compact: true, fields: [T('name', 'Tên khách'), T('role', 'Nơi ở / mô tả'), { k: 'rating', t: 'number', label: 'Số sao (1–5)', step: 1 }, TA('text', 'Nội dung', { wide: true, rows: 2 })] }] },
      { prefix: 'faq', title: 'Câu hỏi thường gặp', fields: [T('title', 'Tiêu đề'),
        { k: 'items', t: 'list', label: 'Câu hỏi', item: 'Câu hỏi', fields: [T('q', 'Câu hỏi', { wide: true }), TA('a', 'Trả lời', { wide: true, rows: 2 })] }] },
      { prefix: 'footer', title: 'Chân trang', fields: [TA('about', 'Giới thiệu ngắn', { wide: true, rows: 2 }), T('copyright', 'Dòng bản quyền', { wide: true })] },
    ];
    const nav = `<div class="jump">${sections.map((s) => `<a href="#sec-${s.prefix || 'root'}">${s.title}</a>`).join('')}</div>`;
    sectionsPage(sections, nav);
  }

  function pageSettings() {
    sectionsPage([
      { prefix: 'brand', title: 'Thương hiệu & liên hệ', desc: 'Số điện thoại & Zalo dùng cho nút gọi nhanh, nút Zalo và chân trang.', fields: [
        T('name', 'Tên thương hiệu'), T('shortName', 'Tên ngắn (màn hình chờ & chữ lớn chân trang)'), T('tagline', 'Khẩu hiệu'), { k: 'logo', t: 'image', label: 'Logo (ảnh vuông – hiển thị dạng tròn)' },
        T('phone', 'Hotline 1'), T('phone2', 'Hotline 2'), T('zalo', 'Số Zalo'), T('email', 'Email'), T('facebook', 'Link Facebook'), T('address', 'Địa chỉ', { wide: true }), T('hours', 'Giờ làm việc'),
      ] },
      { prefix: 'theme', title: 'Màu sắc', fields: [{ k: 'accent', t: 'color', label: 'Màu nhấn chính (nút, giá, điểm nhấn)' }] },
      { prefix: 'seo', title: 'SEO & chia sẻ mạng xã hội', fields: [T('title', 'Tiêu đề trang (thẻ title)', { wide: true }), TA('description', 'Mô tả (meta description)', { wide: true, rows: 2 }), { k: 'ogImage', t: 'image', label: 'Ảnh khi chia sẻ Facebook/Zalo' }] },
    ], '', `<section class="panel"><div class="panel__head"><h2>Sao lưu & khôi phục</h2><p>Tải toàn bộ dữ liệu (nội dung, sản phẩm, đơn hàng) về máy, hoặc khôi phục từ file sao lưu.</p></div>
      <div class="panel__body row-btns"><a class="b b--ghost" href="/api/admin/export">⬇ Tải file sao lưu</a><button class="b b--ghost" id="importBtn">⬆ Khôi phục từ file</button>
      <span class="muted">Lưu trữ hiện tại: <b>${state.me.storage === 'mongodb' ? 'MongoDB (bền vững)' : 'File trên máy chủ'}</b></span></div></section>`);
    $('#importBtn').addEventListener('click', () => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
      i.onchange = async () => {
        const f = i.files[0]; if (!f) return;
        if (!confirm('Khôi phục sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại. Tiếp tục?')) return;
        try { await api('/api/admin/import', { method: 'POST', body: JSON.parse(await f.text()) }); toast('Đã khôi phục dữ liệu', 'ok'); setTimeout(() => location.reload(), 800); }
        catch (e) { toast('File không hợp lệ: ' + e.message, 'err'); }
      };
      i.click();
    });
  }

  /* =====================================================
     SẢN PHẨM
     ===================================================== */
  const minPrice = (p) => (p.sizes || []).reduce((m, s) => { const v = s.salePrice && s.salePrice < s.price ? s.salePrice : s.price; return m == null || v < m ? v : m; }, null);

  function pageProducts() {
    $('#topActions').innerHTML = `<button class="b b--primary" id="newProduct">＋ Thêm sản phẩm</button>`;
    const P = state.products;
    $('#page').innerHTML = P.length ? `<div class="table-wrap"><table class="table table--products">
      <thead><tr><th></th><th>Sản phẩm</th><th>Danh mục</th><th>Giá từ</th><th>Nổi bật</th><th>Hiển thị</th><th>Thứ tự</th><th></th></tr></thead>
      <tbody>${P.map((p, i) => `<tr class="${p.visible ? '' : 'is-off'}">
        <td><img class="thumb" src="${h(p.images[0] || '')}" alt=""></td>
        <td><b>${h(p.name)}</b><br><small class="muted">${h(p.code)}${p.badge ? ' · ' + h(p.badge) : ''} · ${p.sizes.length} kích thước</small></td>
        <td>${h(p.category)}</td>
        <td>${minPrice(p) != null ? money(minPrice(p)) : '—'}</td>
        <td><label class="switch"><input type="checkbox" data-pt="${p.id}|featured" ${p.featured ? 'checked' : ''}><i></i></label></td>
        <td><label class="switch"><input type="checkbox" data-pt="${p.id}|visible" ${p.visible ? 'checked' : ''}><i></i></label></td>
        <td class="t-sort"><button class="b b--icon b--sm" data-pm="${i}|-1" ${i ? '' : 'disabled'}>↑</button><button class="b b--icon b--sm" data-pm="${i}|1" ${i < P.length - 1 ? '' : 'disabled'}>↓</button></td>
        <td class="t-act"><button class="b b--sm b--ghost" data-edit="${p.id}">Sửa</button><button class="b b--sm b--ghost" data-dup="${p.id}" title="Nhân bản">⧉</button><button class="b b--sm b--danger-text" data-delp="${p.id}">Xoá</button></td>
      </tr>`).join('')}</tbody></table></div>`
      : `<div class="empty-state"><b>Chưa có sản phẩm</b><p>Bấm “Thêm sản phẩm” để bắt đầu.</p></div>`;
    $('#newProduct').addEventListener('click', () => editProduct(null));
    $$('[data-edit]').forEach((b) => b.addEventListener('click', () => editProduct(b.dataset.edit)));
    $$('[data-dup]').forEach((b) => b.addEventListener('click', async () => {
      const src = P.find((x) => x.id === b.dataset.dup);
      const copy = { ...clone(src), name: src.name + ' (bản sao)', visible: false, sort: (P[P.length - 1]?.sort || 0) + 1 };
      const saved = await api('/api/admin/products', { method: 'POST', body: copy });
      state.products.push(saved); pageProducts(); toast('Đã nhân bản (đang ẩn)', 'ok');
    }));
    $$('[data-delp]').forEach((b) => b.addEventListener('click', async () => {
      const p = P.find((x) => x.id === b.dataset.delp);
      if (!confirm(`Xoá vĩnh viễn sản phẩm “${p.name}”? Không thể hoàn tác.`)) return;
      await api('/api/admin/products/' + p.id, { method: 'DELETE' });
      state.products = state.products.filter((x) => x.id !== p.id); pageProducts(); toast('Đã xoá sản phẩm');
    }));
    $$('[data-pt]').forEach((c) => c.addEventListener('change', async () => {
      const [id, key] = c.dataset.pt.split('|');
      const p = P.find((x) => x.id === id);
      try { Object.assign(p, await api('/api/admin/products/' + id, { method: 'PUT', body: { ...p, [key]: c.checked } })); pageProducts(); toast('Đã cập nhật', 'ok'); }
      catch (e) { toast(e.message, 'err'); c.checked = !c.checked; }
    }));
    $$('[data-pm]').forEach((b) => b.addEventListener('click', async () => {
      const [i, d] = b.dataset.pm.split('|').map(Number);
      const arr = state.products; const j = i + d;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      arr.forEach((p, k) => (p.sort = k + 1));
      pageProducts();
      await Promise.all([arr[i], arr[j]].map((p) => api('/api/admin/products/' + p.id, { method: 'PUT', body: p })));
    }));
  }

  const PRODUCT_FIELDS = [
    { k: 'images', t: 'images', label: 'Hình ảnh sản phẩm' },
    T('name', 'Tên tranh *', { wide: true }),
    T('code', 'Mã sản phẩm', { ph: 'VD: LT09' }),
    T('category', 'Danh mục', { list: 'catList', ph: 'Mành Lịch Tết hoặc Mành Phông Tết' }),
    T('badge', 'Nhãn nổi bật', { ph: 'VD: Bán chạy, Mới' }),
    { k: 'sort', t: 'number', label: 'Thứ tự hiển thị', step: 1 },
    TA('short', 'Mô tả ngắn (hiện trong thẻ)', { wide: true, rows: 2 }),
    TA('description', 'Mô tả chi tiết', { wide: true, rows: 5 }),
    { k: 'sizes', t: 'list', label: 'Kích thước & giá', item: 'Kích thước', compact: true, fields: [
      T('label', 'Kích thước', { ph: '50 × 100 cm' }), { k: 'price', t: 'number', label: 'Giá gốc (đ)' }, { k: 'salePrice', t: 'number', label: 'Giá khuyến mãi (đ)', hint: 'Để 0 nếu không giảm giá' },
    ] },
    T('video', 'Link video (YouTube, TikTok, Facebook…)', { wide: true }),
    { k: 'featured', t: 'toggle', label: 'Hiện ở dải “Bộ sưu tập nổi bật”' },
    { k: 'visible', t: 'toggle', label: 'Hiển thị trên website' },
  ];

  function editProduct(id) {
    const orig = id ? state.products.find((p) => p.id === id) : null;
    const draft = orig ? clone(orig) : {
      name: '', code: 'HD' + String(state.products.length + 1).padStart(2, '0'), category: '', short: '', description: '', images: [], video: '', badge: '', featured: false, visible: true,
      sort: (state.products[state.products.length - 1]?.sort || 0) + 1,
      sizes: [{ label: '50 × 100 cm', price: 450000, salePrice: 0 }, { label: '75 × 150 cm', price: 750000, salePrice: 0 }],
    };
    const cats = [...new Set([...(state.site.collections || []).map((c) => c.category), ...state.products.map((p) => p.category)].filter(Boolean))];
    openSheet(`<div class="sheet__head"><h2>${orig ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2><button class="b b--icon" data-sheet-close>✕</button></div>
      <div class="sheet__body"><datalist id="catList">${cats.map((c) => `<option value="${h(c)}">`).join('')}</datalist><div class="form-grid" id="pForm"></div></div>
      <div class="sheet__foot"><button class="b b--ghost" data-sheet-close>Huỷ</button><button class="b b--primary" id="pSave">${orig ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</button></div>`);
    activeSchema = [{ prefix: '', fields: PRODUCT_FIELDS }];
    const form = $('#pForm');
    const draw = () => { form.innerHTML = PRODUCT_FIELDS.map((f) => fieldHTML(f, draft, '')).join(''); };
    draw();
    bindForm(form, draft, draw);
    $('#pSave').addEventListener('click', async () => {
      if (!draft.name.trim()) { toast('Vui lòng nhập tên tranh', 'err'); return; }
      if (!draft.sizes.some((s) => s.label && (s.price || s.salePrice))) { if (!confirm('Chưa có kích thước/giá – khách sẽ chỉ thấy “Liên hệ”. Vẫn lưu?')) return; }
      const btn = $('#pSave'); btn.disabled = true;
      try {
        const saved = orig ? await api('/api/admin/products/' + orig.id, { method: 'PUT', body: draft }) : await api('/api/admin/products', { method: 'POST', body: draft });
        if (orig) Object.assign(orig, saved); else state.products.push(saved);
        state.products.sort((a, b) => a.sort - b.sort);
        closeSheet(); pageProducts(); toast('Đã lưu sản phẩm', 'ok');
      } catch (e) { toast(e.message, 'err'); btn.disabled = false; }
    });
  }

  /* ---------------- khởi động ---------------- */
  boot().catch(() => {});
})();
