/* =========================================================
   Mộc Họa – giao diện bán tranh với hiệu ứng cuộn điện ảnh
   ========================================================= */
(() => {
  'use strict';
  const D = window.__DATA__ || { site: {}, products: [] };
  const S = D.site;
  const P = D.products || [];

  /* ---------------- tiện ích ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const h = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const url = (u) => (/^(https?:\/\/|\/(?!\/))/i.test(u || '') ? h(u) : '');
  const money = (n) => (Number(n) || 0).toLocaleString('vi-VN') + 'đ';
  const priceOf = (s) => (s.salePrice && s.salePrice < s.price ? s.salePrice : s.price || s.salePrice);
  const minSize = (p) => (p.sizes || []).reduce((m, s) => (!m || priceOf(s) < priceOf(m) ? s : m), null);
  const pct = (s) => (s.salePrice && s.price > s.salePrice ? Math.round((1 - s.salePrice / s.price) * 100) : 0);
  const tel = (v) => 'tel:' + String(v || '').replace(/[^\d+]/g, '');
  const zalo = (v) => 'https://zalo.me/' + String(v || '').replace(/\D/g, '');
  const pad = (n) => String(n).padStart(2, '0');
  const byId = (id) => P.find((p) => p.id === id);
  const lines = (t) => String(t || '').split('\n').filter((x) => x.trim() !== '');
  const splitLines = (t) => lines(t).map((l, i) => `<span class="line"><span class="line__in" style="--d:${i}">${h(l)}</span></span>`).join('');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const isDesktop = () => window.innerWidth > 900;
  const brand = S.brand || {};

  const toast = (msg) => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('is-show'), 2600);
  };

  /* ---------------- giỏ tranh ---------------- */
  const CART_KEY = 'mh_cart_v1';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
  cart = cart.filter((it) => { const p = byId(it.productId); return p && p.sizes.some((s) => s.label === it.size); });
  const saveCart = () => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* bỏ qua */ }
    renderCart();
  };
  const addToCart = (productId, size, qty = 1) => {
    const ex = cart.find((i) => i.productId === productId && i.size === size);
    if (ex) ex.qty = Math.min(50, ex.qty + qty); else cart.push({ productId, size, qty });
    saveCart();
    const btn = $('#cartBtn');
    btn.classList.remove('is-bump'); void btn.offsetWidth; btn.classList.add('is-bump');
  };
  const cartTotal = () => cart.reduce((s, it) => { const p = byId(it.productId); const z = p && p.sizes.find((x) => x.label === it.size); return s + (z ? priceOf(z) * it.qty : 0); }, 0);
  const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);

  /* ---------------- khối giao diện ---------------- */
  const shortName = () => brand.shortName || brand.name || '';
  // "Xưởng Mành tre trúc Hồng Dương" -> dòng nhỏ "Xưởng Mành tre trúc" + chữ lớn "Hồng Dương"
  const logoHTML = () => {
    const full = String(brand.name || ''), sn = shortName();
    const pre = sn && full !== sn && full.endsWith(sn) ? full.slice(0, -sn.length).trim() : '';
    return `${brand.logo ? `<img class="logo__img" src="${url(brand.logo)}" alt="">` : '<span class="logo__mark"></span>'}<span class="logo__text">${pre ? `<em>${h(pre)}</em>` : ''}<b>${h(pre ? sn : full)}</b><small>${h(brand.tagline)}</small></span>`;
  };

  const sizeBtns = (p, sel) => (p.sizes || []).map((s) => `
    <button type="button" class="size${s.label === sel ? ' is-active' : ''}" data-size="${h(s.label)}">
      <span class="size__label">${h(s.label)}</span>
      <span class="size__price">${pct(s) ? `<del>${money(s.price)}</del>` : ''}<b>${money(priceOf(s))}</b></span>
      ${pct(s) ? `<em>-${pct(s)}%</em>` : ''}
    </button>`).join('');

  const cardHTML = (p, cls = '') => {
    const m = minSize(p);
    return `<article class="card ${cls}" data-id="${h(p.id)}" data-cat="${h(p.category)}">
      <button class="card__media" data-open="${h(p.id)}" data-cursor="Xem mẫu" aria-label="Xem ${h(p.name)}">
        <span class="card__frame"><img src="${url(p.images[0])}" alt="${h(p.name)}" loading="lazy"></span>
        ${p.badge ? `<span class="badge">${h(p.badge)}</span>` : ''}
        ${m && pct(m) ? `<span class="badge badge--sale">-${pct(m)}%</span>` : ''}
      </button>
      <div class="card__body">
        <span class="card__code">${h(p.code)}${p.category ? ' · ' + h(p.category) : ''}</span>
        <h3 class="card__name">${h(p.name)}</h3>
        <div class="card__price">${m ? `<small>Từ</small><strong>${money(priceOf(m))}</strong>${pct(m) ? `<del>${money(m.price)}</del>` : ''}` : '<strong>Liên hệ</strong>'}</div>
        <div class="card__actions">
          <button class="btn btn--line btn--sm" data-open="${h(p.id)}">Chi tiết</button>
          <button class="btn btn--accent btn--sm" data-quick="${h(p.id)}">Đặt ngay</button>
        </div>
      </div>
    </article>`;
  };

  function heroHTML() {
    const hs = S.hero || {};
    const slides = hs.slides && hs.slides.length ? hs.slides : [{ title: brand.name }];
    return `<section class="hero" id="top">
      <div class="hero__frame"><div class="hero__media">
        ${slides.map((s, i) => `<div class="hero__slide${i ? '' : ' is-active'}"><img class="hero__bg" src="${url(s.image)}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}><img class="hero__art" src="${url(s.image)}" alt="" ${i ? 'loading="lazy"' : ''}></div>`).join('')}
        <div class="hero__shade"></div>
      </div></div>
      <div class="hero__content container">
        <div class="hero__texts">
        ${slides.map((s, i) => `<div class="hero__text${i ? '' : ' is-active'}">
          <p class="eyebrow eyebrow--light"><span class="line"><span class="line__in">${h(s.eyebrow)}</span></span></p>
          <h1 class="hero__title">${splitLines(s.title)}</h1>
          <p class="hero__sub">${h(s.subtitle)}</p>
        </div>`).join('')}
        </div>
        <div class="hero__cta">
          <a href="#bo-suu-tap" class="btn btn--accent">${h(hs.ctaPrimary || 'Khám phá')} <span aria-hidden="true">→</span></a>
          <a href="#dat-hang" class="btn btn--ghost-light">${h(hs.ctaSecondary || 'Đặt hàng')}</a>
        </div>
      </div>
      <div class="hero__ui container">
        <div class="hero__dots">${slides.length > 1 ? slides.map((_, i) => `<button class="${i ? '' : 'is-active'}" data-i="${i}" aria-label="Banner ${i + 1}"><i>${pad(i + 1)}</i><span></span></button>`).join('') : ''}</div>
        <div class="hero__scroll"><span>Cuộn để khám phá</span><i></i></div>
      </div>
    </section>`;
  }

  function marqueeHTML() {
    const items = (S.marquee && S.marquee.items) || [];
    if (!items.length) return '';
    const row = items.map((t) => `<span>${h(t)}</span><i>✦</i>`).join('');
    return `<section class="marquee" aria-hidden="true"><div class="marquee__track"><div class="marquee__row">${row}</div><div class="marquee__row">${row}</div></div></section>`;
  }

  function introHTML() {
    const it = S.intro || {};
    const words = String(it.statement || '').split(/\s+/).map((w) => `<span class="w">${h(w)}</span>`).join(' ');
    return `<section class="intro" id="gioi-thieu">
      <div class="container intro__grid">
        <p class="eyebrow" data-reveal>${h(it.eyebrow)}</p>
        <h2 class="intro__statement">${words}</h2>
        <div class="intro__media"><div class="reveal-img"><img src="${url(it.image)}" alt="" loading="lazy" data-parallax></div></div>
        <div class="intro__body">
          <p data-reveal>${h(it.body)}</p>
          <div class="stats">${(it.stats || []).map((s) => `<div class="stat" data-reveal><strong data-count="${h(s.value)}" data-suffix="${h(s.suffix)}">${h(Number(s.value).toLocaleString('vi-VN'))}${h(s.suffix)}</strong><span>${h(s.label)}</span></div>`).join('')}</div>
        </div>
      </div>
    </section>`;
  }

  const collections = () => (S.collections || []).filter((c) => c && (c.title || c.category));
  const colId = (i) => (i === 0 ? 'bo-suu-tap' : 'bst-' + (i + 1));

  const countOf = (c) => P.filter((p) => c.category && p.category === c.category).length;

  function collectionsHTML() {
    const cols = collections();
    const tabs = cols.length > 1 ? `<section class="col-tabs-wrap"><div class="container">
      <header class="sec-head sec-head--center"><p class="eyebrow" data-reveal>Hai bộ sưu tập chính</p><h2 class="h2" data-lines>${splitLines('Chọn dòng mành\nbạn yêu thích')}</h2></header>
      <div class="col-tabs">${cols.map((c, i) => `<a class="col-tab${url(c.image) ? ' col-tab--img' : ''}" href="#${colId(i)}-sp" data-reveal data-cursor="Xem mẫu">
        ${url(c.image) ? `<span class="col-tab__img"><img src="${url(c.image)}" alt="${h(c.name || c.category)}" loading="lazy"></span>` : ''}
        <span class="col-tab__foot">
          <span class="col-tab__text"><b>${h(c.name || c.category)}</b>${c.nameNote ? `<em>${h(c.nameNote)}</em>` : ''}</span>
          <span class="col-tab__count">${countOf(c) ? 'Xem sản phẩm' : 'Đang cập nhật'} →</span>
        </span>
      </a>`).join('')}</div>
    </div></section>` : '';
    return tabs + cols.map((c, i) => {
      const list = P.filter((p) => c.category && p.category === c.category);
      let belt = '';
      if (list.length) {
        let row = list;
        while (row.length < 8) row = row.concat(list); // đủ dài để dải trôi liền mạch
        const group = row.map((p) => cardHTML(p, 'card--feature')).join('');
        belt = `<div class="belt" id="${colId(i)}-sp"><div class="belt__track"><div class="belt__group">${group}</div><div class="belt__group" aria-hidden="true" inert>${group}</div></div></div>`;
      } else {
        belt = `<div class="container" id="${colId(i)}-sp"><div class="col-empty" data-reveal><span class="col-empty__icon">🎋</span><p>${h(c.emptyText || 'Mẫu đang được cập nhật.')}</p>
          <div class="col-empty__btns">${brand.zalo ? `<a class="btn btn--accent" href="${zalo(brand.zalo)}" target="_blank" rel="noopener">Nhắn Zalo xem mẫu</a>` : ''}${brand.phone ? `<a class="btn btn--line" href="${tel(brand.phone)}">Gọi ${h(brand.phone)}</a>` : ''}</div></div></div>`;
      }
      return `<section class="featured featured--${i % 2 ? 'b' : 'a'}" id="${colId(i)}">
        <div class="container featured__head">
          <div class="col-head">
            <div class="col-head__name" data-reveal><span><small>Bộ sưu tập</small><b>${h(c.name || c.category || c.eyebrow)}</b>${c.nameNote ? `<em>(${h(c.nameNote)})</em>` : ''}</span></div>
            <h2 class="h2" data-lines>${splitLines(c.title)}</h2>
          </div>
          <div class="featured__aside" data-reveal>
            <p class="featured__sub">${h(c.description)}</p>
            ${(c.highlights || []).length ? `<div class="col-meaning"><b>${h(c.highlightsTitle || 'Ý nghĩa / Điểm nhấn')}</b><ul class="highlights">${c.highlights.map((t) => `<li>${h(t)}</li>`).join('')}</ul></div>` : ''}
            <div class="featured__ctrl">
              ${list.length ? `<button class="arrow" data-belt="-1" aria-label="Mẫu trước">←</button><button class="arrow" data-belt="1" aria-label="Mẫu tiếp">→</button>` : ''}
              <a href="#dat-hang" class="link-arrow">Chọn mẫu & đặt mua <span>→</span></a>
            </div>
          </div>
        </div>
        ${belt}
      </section>`;
    }).join('');
  }

  function catalogHTML() {
    const cats = [...new Set(P.map((p) => p.category).filter(Boolean))];
    return `<section class="catalog" id="tat-ca">
      <div class="container">
        <div class="catalog__head">
          <h2 class="h2" data-lines>${splitLines((S.collection || {}).allTitle || 'Tất cả tác phẩm')}</h2>
          <div class="chips" role="tablist">${['Tất cả', ...cats].map((c, i) => `<button class="chip${i ? '' : ' is-active'}" data-cat="${i ? h(c) : ''}">${h(c)}</button>`).join('')}</div>
        </div>
        <div class="grid" id="grid">${P.map((p) => cardHTML(p)).join('')}</div>
      </div>
    </section>`;
  }

  function spacesHTML() {
    const sp = S.spaces || {};
    if (!(sp.items || []).length) return '';
    return `<section class="spaces" id="khong-gian">
      <div class="container">
        <header class="sec-head"><p class="eyebrow" data-reveal>${h(sp.eyebrow)}</p><h2 class="h2" data-lines>${splitLines(sp.title)}</h2><p class="sec-head__sub" data-reveal>${h(sp.subtitle)}</p></header>
        <div class="spaces__grid">
          ${sp.items.map((it, i) => `<article class="space-card" data-reveal>
            <div class="space-card__img"><img src="${url(it.image)}" alt="${h(it.title)}" loading="lazy"></div>
            <div class="space-card__body"><span class="space-card__num">${pad(i + 1)}</span><h3>${h(it.title)}</h3><p>${h(it.text)}</p></div>
          </article>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function processHTML() {
    const pr = S.process || {};
    const steps = pr.steps || [];
    if (!steps.length) return '';
    return `<section class="process sec-mint" id="quy-trinh">
      <div class="container">
        <header class="sec-head"><p class="eyebrow" data-reveal>${h(pr.eyebrow)}</p><h2 class="h2" data-lines>${splitLines(pr.title)}</h2></header>
        <div class="process__grid">
          <div class="process__visual">
            <div class="process__frame">${steps.map((s, i) => `<img class="process__img${i ? '' : ' is-active'}" src="${url(s.image)}" alt="" loading="lazy">`).join('')}</div>
            <div class="process__count"><b id="pcur">01</b><span>/ ${pad(steps.length)}</span></div>
          </div>
          <ol class="process__steps">
            ${steps.map((s, i) => `<li class="pstep${i ? '' : ' is-active'}" data-i="${i}">
              <img class="pstep__img" src="${url(s.image)}" alt="" loading="lazy">
              <span class="pstep__n">${pad(i + 1)}</span><h3>${h(s.title)}</h3><p>${h(s.text)}</p>
            </li>`).join('')}
          </ol>
        </div>
      </div>
    </section>`;
  }

  function featuresHTML() {
    const ft = S.features || {};
    if (!(ft.items || []).length) return '';
    return `<section class="features"><div class="container">
      <header class="sec-head sec-head--center"><p class="eyebrow" data-reveal>${h(ft.eyebrow)}</p><h2 class="h2" data-lines>${splitLines(ft.title)}</h2></header>
      <div class="features__grid">${ft.items.map((f) => `<div class="feature" data-reveal><span class="feature__icon">${h(f.icon)}</span><h3>${h(f.title)}</h3><p>${h(f.text)}</p></div>`).join('')}</div>
    </div></section>`;
  }

  function orderHTML() {
    const o = S.order || {};
    const pr = S.promo || {};
    return `<section class="order sec-peach" id="dat-hang">
      <div class="container order__grid">
        <div class="order__left">
          <p class="eyebrow" data-reveal>${h(o.eyebrow)}</p>
          <h2 class="h2" data-lines>${splitLines(o.title)}</h2>
          <p class="order__lead" data-reveal>${h(o.subtitle)}</p>
          ${pr.enabled ? `<div class="promo" data-reveal>
            <p class="promo__eyebrow">${h(pr.eyebrow)}</p><h3>${h(pr.title)}</h3><p>${h(pr.text)}</p>
            <div class="countdown" id="countdown">
              <div data-unit="d"><b>00</b><span>Ngày</span></div><div><b data-cd="h">00</b><span>Giờ</span></div><div><b data-cd="m">00</b><span>Phút</span></div><div><b data-cd="s">00</b><span>Giây</span></div>
            </div>
          </div>` : ''}
          <ul class="order__trust" data-reveal>
            ${String(o.shippingText || '').split('·').map((t) => t.trim()).filter(Boolean).map((t) => `<li>${h(t)}</li>`).join('')}
            <li>Hotline: <a href="${tel(brand.phone)}">${h(brand.phone)}</a></li>
          </ul>
        </div>
        <form class="order__card" id="orderForm" novalidate>
          <div class="order__step"><span>1</span>Chọn mẫu & kích thước</div>
          <div class="picker">
            <div class="picker__row">
              <img class="picker__thumb" id="pickThumb" alt="">
              <label class="field field--select"><span>Mẫu tranh</span>
                <select id="pickProduct">${P.filter((p) => p.sizes.length).map((p) => `<option value="${h(p.id)}">${h(p.code)} – ${h(p.name)}</option>`).join('')}</select>
              </label>
            </div>
            <div class="sizes sizes--compact" id="pickSizes"></div>
            <button type="button" class="btn btn--line btn--block" id="pickAdd">+ Thêm mẫu này vào đơn</button>
          </div>
          <div class="order__items" id="orderItems"></div>
          <div class="order__step"><span>2</span>Thông tin nhận hàng</div>
          <div class="fields">
            <label class="field"><span>Họ và tên *</span><input name="name" autocomplete="name" required maxlength="100"></label>
            <label class="field"><span>Số điện thoại *</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="20"></label>
            <label class="field field--full"><span>Địa chỉ nhận hàng *</span><input name="address" autocomplete="street-address" required maxlength="300"></label>
            <label class="field field--full"><span>Ghi chú (kích thước riêng, thời gian giao…)</span><textarea name="note" rows="2" maxlength="1000"></textarea></label>
            <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          </div>
          <div class="order__total"><span>Tổng tiền <small>(tạm tính)</small></span><strong id="orderTotal">0đ</strong></div>
          <p class="form-error" id="orderError" role="alert"></p>
          <button class="btn btn--accent btn--block btn--lg" type="submit" id="orderSubmit">Gửi đơn đặt hàng</button>
          <p class="order__fine">Đây là yêu cầu đặt hàng, chưa phải thanh toán. Hoặc đặt nhanh qua <a href="${zalo(brand.zalo)}" target="_blank" rel="noopener">Zalo</a>.</p>
        </form>
      </div>
    </section>`;
  }

  function reviewsHTML() {
    const t = S.testimonials || {};
    if (!(t.items || []).length) return '';
    return `<section class="reviews" id="danh-gia">
      <div class="container"><header class="sec-head"><p class="eyebrow" data-reveal>${h(t.eyebrow)}</p><h2 class="h2" data-lines>${splitLines(t.title)}</h2></header></div>
      <div class="reviews__track" id="reviewsTrack">
        ${t.items.map((r) => `<figure class="review" data-reveal>
          <div class="review__stars" aria-label="${Number(r.rating) || 5} sao">${'★'.repeat(Math.max(1, Math.min(5, Number(r.rating) || 5)))}</div>
          <blockquote>“${h(r.text)}”</blockquote>
          <figcaption><span class="review__avatar">${h(String(r.name || '?').replace(/^(Anh|Chị|Cô|Chú|Bác)\s+/i, '').charAt(0))}</span><span><b>${h(r.name)}</b><small>${h(r.role)}</small></span></figcaption>
        </figure>`).join('')}
      </div>
    </section>`;
  }

  function faqHTML() {
    const f = S.faq || {};
    if (!(f.items || []).length) return '';
    return `<section class="faq" id="hoi-dap"><div class="container faq__grid">
      <h2 class="h2" data-lines>${splitLines(f.title)}</h2>
      <div class="faq__list">${f.items.map((q, i) => `<details${i ? '' : ' open'} data-reveal><summary>${h(q.q)}<i></i></summary><p>${h(q.a)}</p></details>`).join('')}</div>
    </div></section>`;
  }

  function footerHTML() {
    const ft = S.footer || {};
    return `<div class="container footer__grid">
        <div class="footer__about"><a href="#top" class="logo">${logoHTML()}</a><p>${h(ft.about)}</p></div>
        <div><h4>Liên hệ</h4><ul>
          ${brand.phone ? `<li><a href="${tel(brand.phone)}">☎ ${h(brand.phone)}</a></li>` : ''}
          ${brand.phone2 ? `<li><a href="${tel(brand.phone2)}">☎ ${h(brand.phone2)}</a></li>` : ''}
          ${brand.zalo ? `<li><a href="${zalo(brand.zalo)}" target="_blank" rel="noopener">💬 Zalo ${h(brand.zalo)}</a></li>` : ''}
          ${brand.email ? `<li><a href="mailto:${h(brand.email)}">✉ ${h(brand.email)}</a></li>` : ''}
          ${brand.address ? `<li>⌂ ${h(brand.address)}</li>` : ''}
          ${brand.hours ? `<li>◷ ${h(brand.hours)}</li>` : ''}
        </ul></div>
        <div><h4>Khám phá</h4><ul>
          ${collections().map((c, i) => `<li><a href="#${colId(i)}">${h(c.category)}</a></li>`).join('')}
          <li><a href="#tat-ca">Tất cả mẫu mành</a></li><li><a href="#quy-trinh">Chất liệu & quy trình</a></li><li><a href="#dat-hang">Đặt hàng</a></li>
        </ul></div>
        <div><h4>Đặt hàng ngay</h4>
          <div class="footer__btns">
            ${brand.phone ? `<a class="btn btn--accent btn--sm" href="${tel(brand.phone)}">Gọi ${h(brand.phone)}</a>` : ''}
            ${brand.zalo ? `<a class="btn btn--line btn--sm" href="${zalo(brand.zalo)}" target="_blank" rel="noopener">Chat Zalo</a>` : ''}
            ${url(brand.facebook) ? `<a class="btn btn--line btn--sm" href="${url(brand.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ''}
          </div>
        </div>
      </div>
      <div class="footer__big" aria-hidden="true" style="--n:${Math.max(4, [...String(shortName())].length)}">${[...String(shortName())].map((c) => `<span>${c === ' ' ? '&nbsp;' : h(c)}</span>`).join('')}</div>
      <div class="container footer__bottom"><span>${h(ft.copyright)}</span><a href="#top">Lên đầu trang ↑</a></div>`;
  }

  /* ---------------- dựng trang ---------------- */
  function render() {
    document.title = (S.seo && S.seo.title) || brand.name || document.title;
    const an = S.announcement || {};
    if (an.enabled && an.text) { $('#announce').innerHTML = `<div class="announce__inner">${h(an.text)}</div>`; document.body.classList.add('has-announce'); } else $('#announce').remove();
    $('#logo').innerHTML = logoHTML();
    $('#nav').innerHTML = collections().map((c, i) => `<a href="#${colId(i)}">${h(c.navLabel || c.category || 'Bộ sưu tập ' + (i + 1))}</a>`).join('')
      + '<a href="#quy-trinh">Chất liệu</a><a href="#hoi-dap">Hỏi đáp</a><a href="#dat-hang">Đặt hàng</a>';
    $('#preloaderBrand').innerHTML = [...String(shortName())].map((c, i) => `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : h(c)}</span>`).join('');
    const hp = $('#headerPhone');
    if (brand.phone) { hp.href = tel(brand.phone); hp.textContent = brand.phone; } else hp.remove();

    $('#main').innerHTML = heroHTML() + marqueeHTML() + introHTML() + collectionsHTML() + catalogHTML() + spacesHTML() + processHTML() + featuresHTML() + orderHTML() + reviewsHTML() + faqHTML();
    $('#footer').innerHTML = footerHTML();

    $('#floatContact').innerHTML = `
      ${brand.zalo ? `<a href="${zalo(brand.zalo)}" target="_blank" rel="noopener" class="fc fc--zalo" aria-label="Chat Zalo">Zalo</a>` : ''}
      ${brand.phone ? `<a href="${tel(brand.phone)}" class="fc fc--phone" aria-label="Gọi điện"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg></a>` : ''}`;
    $('#mobileBar').innerHTML = `
      ${brand.phone ? `<a href="${tel(brand.phone)}">☎<span>Gọi ngay</span></a>` : ''}
      ${brand.zalo ? `<a href="${zalo(brand.zalo)}" target="_blank" rel="noopener"><b class="zl">Z</b><span>Zalo</span></a>` : ''}
      <a href="#dat-hang" class="mobile-bar__cta">Đặt hàng <em id="mbCount">0</em></a>`;
  }

  /* ---------------- banner trượt ---------------- */
  function initHeroSlider() {
    const slides = $$('.hero__slide'), texts = $$('.hero__text'), dots = $$('.hero__dots button');
    if (slides.length < 2) return;
    let cur = 0, timer;
    const go = (n) => {
      cur = (n + slides.length) % slides.length;
      [slides, texts, dots].forEach((g) => g.forEach((el, i) => el.classList.toggle('is-active', i === cur)));
      clearTimeout(timer);
      timer = setTimeout(() => go(cur + 1), 6500);
    };
    dots.forEach((d) => d.addEventListener('click', () => go(+d.dataset.i)));
    timer = setTimeout(() => go(1), 6500);
  }

  /* ---------------- lọc danh mục ---------------- */
  function initFilter() {
    $$('.chip').forEach((c) => c.addEventListener('click', () => {
      $$('.chip').forEach((x) => x.classList.toggle('is-active', x === c));
      const cat = c.dataset.cat;
      $$('#grid .card').forEach((card, i) => {
        const show = !cat || card.dataset.cat === cat;
        card.hidden = !show;
        if (show) { card.classList.remove('is-in'); void card.offsetWidth; card.style.setProperty('--stagger', (i % 8) * 60 + 'ms'); card.classList.add('is-in'); }
      });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }));
  }

  /* ---------------- modal sản phẩm ---------------- */
  let lastFocus = null;
  function openLayer(el) { lastFocus = document.activeElement; el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('is-locked'); if (window.__lenis) window.__lenis.stop(); }
  function closeLayer(el) {
    el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
    if (!$$('.modal.is-open, .drawer.is-open, .lightbox.is-open').length) { document.documentElement.classList.remove('is-locked'); if (window.__lenis) window.__lenis.start(); }
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function openProduct(id) {
    const p = byId(id); if (!p) return;
    let size = (minSize(p) || {}).label, qty = 1;
    const body = $('#productModalBody');
    body.innerHTML = `<button class="icon-btn modal__close" data-close aria-label="Đóng">✕</button>
      <div class="pm">
        <div class="pm__gallery">
          <button class="pm__main" data-cursor="Phóng to"><img id="pmMain" src="${url(p.images[0])}" alt="${h(p.name)}"></button>
          ${p.images.length > 1 ? `<div class="pm__thumbs">${p.images.map((u, i) => `<button class="${i ? '' : 'is-active'}" data-src="${url(u)}"><img src="${url(u)}" alt=""></button>`).join('')}</div>` : ''}
          ${url(p.video) ? `<a class="link-arrow pm__video" href="${url(p.video)}" target="_blank" rel="noopener">▶ Xem video sản phẩm</a>` : ''}
        </div>
        <div class="pm__info">
          <span class="pm__code">${h(p.code)}${p.category ? ' · ' + h(p.category) : ''}</span>
          <h2 class="pm__name">${h(p.name)}</h2>
          <p class="pm__short">${h(p.short)}</p>
          ${p.sizes.length ? `
          <div class="pm__label">Chọn kích thước</div>
          <div class="sizes" id="pmSizes">${sizeBtns(p, size)}</div>
          <div class="pm__row">
            <div class="qty"><button type="button" data-q="-1" aria-label="Giảm">−</button><span id="pmQty">1</span><button type="button" data-q="1" aria-label="Tăng">+</button></div>
            <div class="pm__price" id="pmPrice"></div>
          </div>
          <div class="pm__btns"><button class="btn btn--line" id="pmAdd">Thêm vào giỏ</button><button class="btn btn--accent" id="pmBuy">Đặt ngay</button></div>`
          : `<div class="pm__btns"><a class="btn btn--accent" href="${zalo(brand.zalo)}" target="_blank" rel="noopener">Liên hệ báo giá</a></div>`}
          <ul class="pm__perks"><li>Vận chuyển toàn quốc</li><li>Nan trúc tự nhiên, in UV sắc nét</li><li>Nẹp gỗ, dây treo sẵn – cuộn gọn sau Tết</li></ul>
          <div class="pm__desc">${h(p.description).replace(/\n/g, '<br>')}</div>
        </div>
      </div>`;
    const upd = () => {
      const s = p.sizes.find((x) => x.label === size); if (!s) return;
      $('#pmPrice').innerHTML = `${pct(s) ? `<del>${money(s.price * qty)}</del>` : ''}<strong>${money(priceOf(s) * qty)}</strong>`;
      $('#pmQty').textContent = qty;
      $$('#pmSizes .size').forEach((b) => b.classList.toggle('is-active', b.dataset.size === size));
    };
    if (p.sizes.length) {
      upd();
      $('#pmSizes').addEventListener('click', (e) => { const b = e.target.closest('.size'); if (b) { size = b.dataset.size; upd(); } });
      $$('[data-q]', body).forEach((b) => b.addEventListener('click', () => { qty = Math.max(1, Math.min(50, qty + Number(b.dataset.q))); upd(); }));
      $('#pmAdd').addEventListener('click', () => { addToCart(p.id, size, qty); toast(`Đã thêm “${p.name}” vào giỏ`); closeLayer($('#productModal')); });
      $('#pmBuy').addEventListener('click', () => { addToCart(p.id, size, qty); closeLayer($('#productModal')); goTo('#dat-hang'); });
    }
    $$('.pm__thumbs button', body).forEach((b) => b.addEventListener('click', () => {
      $('#pmMain').src = b.dataset.src;
      $$('.pm__thumbs button', body).forEach((x) => x.classList.toggle('is-active', x === b));
    }));
    $('.pm__main', body).addEventListener('click', () => openLightbox($('#pmMain').src));
    openLayer($('#productModal'));
    body.scrollTop = 0;
    $('.modal__close', body).focus({ preventScroll: true });
  }

  function openLightbox(src) {
    const lb = $('#lightbox');
    $('img', lb).src = src;
    openLayer(lb);
  }

  /* ---------------- giỏ & đặt hàng ---------------- */
  function itemRow(it, idx, compact) {
    const p = byId(it.productId);
    const s = p.sizes.find((x) => x.label === it.size);
    return `<div class="item" data-idx="${idx}">
      <img src="${url(p.images[0])}" alt="">
      <div class="item__main">
        <b>${h(p.name)}</b>
        <select class="item__size" aria-label="Kích thước">${p.sizes.map((z) => `<option ${z.label === it.size ? 'selected' : ''} value="${h(z.label)}">${h(z.label)} – ${money(priceOf(z))}</option>`).join('')}</select>
        <div class="item__row">
          <div class="qty qty--sm"><button type="button" data-iq="-1" aria-label="Giảm">−</button><span>${it.qty}</span><button type="button" data-iq="1" aria-label="Tăng">+</button></div>
          <strong>${money(priceOf(s) * it.qty)}</strong>
        </div>
      </div>
      <button type="button" class="item__rm" data-rm aria-label="Xoá">✕</button>
    </div>`;
  }
  function bindItems(root) {
    root.onclick = (e) => {
      const row = e.target.closest('.item'); if (!row) return;
      const it = cart[+row.dataset.idx]; if (!it) return;
      if (e.target.closest('[data-rm]')) { cart.splice(+row.dataset.idx, 1); saveCart(); return; }
      const q = e.target.closest('[data-iq]');
      if (q) { it.qty = Math.max(1, Math.min(50, it.qty + Number(q.dataset.iq))); saveCart(); }
    };
    root.onchange = (e) => {
      if (!e.target.classList.contains('item__size')) return;
      const it = cart[+e.target.closest('.item').dataset.idx];
      const dup = cart.find((x) => x !== it && x.productId === it.productId && x.size === e.target.value);
      if (dup) { dup.qty += it.qty; cart.splice(cart.indexOf(it), 1); } else it.size = e.target.value;
      saveCart();
    };
  }

  function renderCart() {
    const n = cartCount();
    $('#cartCount').textContent = n;
    $('#cartCount').classList.toggle('is-empty', !n);
    const mb = $('#mbCount'); if (mb) mb.textContent = n;
    const empty = `<div class="empty"><p>Chưa có tranh nào được chọn.</p><a href="#tat-ca" class="link-arrow" data-close>Xem bộ sưu tập →</a></div>`;
    $('#cartBody').innerHTML = cart.length ? cart.map((it, i) => itemRow(it, i)).join('') : empty;
    $('#cartFoot').innerHTML = cart.length ? `<div class="order__total"><span>Tạm tính</span><strong>${money(cartTotal())}</strong></div><a href="#dat-hang" class="btn btn--accent btn--block" data-checkout>Tiến hành đặt hàng →</a>` : '';
    const oi = $('#orderItems');
    if (oi) {
      oi.innerHTML = cart.length ? `<div class="order__items-head">Tranh đã chọn (${n})</div>` + cart.map((it, i) => itemRow(it, i)).join('') : '';
      $('#orderTotal').textContent = money(cartTotal());
    }
  }

  function initOrder() {
    const sel = $('#pickProduct'); if (!sel) return;
    let size = null;
    const upd = () => {
      const p = byId(sel.value); if (!p) return;
      if (!p.sizes.some((s) => s.label === size)) size = (minSize(p) || {}).label;
      $('#pickThumb').src = p.images[0] || '';
      $('#pickSizes').innerHTML = sizeBtns(p, size);
    };
    sel.addEventListener('change', () => { size = null; upd(); });
    $('#pickSizes').addEventListener('click', (e) => { const b = e.target.closest('.size'); if (b) { size = b.dataset.size; upd(); } });
    $('#pickAdd').addEventListener('click', () => { const p = byId(sel.value); if (!p) return; addToCart(p.id, size, 1); toast(`Đã thêm ${p.code} (${size}) vào đơn`); });
    $('#pickThumb').addEventListener('click', () => openProduct(sel.value));
    upd();
    bindItems($('#orderItems'));
    bindItems($('#cartBody'));

    const form = $('#orderForm');
    const err = $('#orderError');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.textContent = '';
      const fd = Object.fromEntries(new FormData(form));
      if (!cart.length) {
        const p = byId(sel.value);
        if (p && size) addToCart(p.id, size, 1); // nếu chưa thêm thì lấy mẫu đang chọn
      }
      const phone = String(fd.phone || '').replace(/[\s.\-()]/g, '');
      const bad = !cart.length ? 'Vui lòng chọn ít nhất một mẫu tranh.' : !fd.name.trim() ? 'Vui lòng nhập họ và tên.'
        : !/^(\+?84|0)\d{8,10}$/.test(phone) ? 'Số điện thoại chưa đúng (VD: 0909123456).' : !fd.address.trim() ? 'Vui lòng nhập địa chỉ nhận hàng.' : '';
      $$('.field input', form).forEach((i) => i.classList.remove('is-invalid'));
      if (bad) {
        err.textContent = bad;
        const f = !fd.name.trim() ? 'name' : !/^(\+?84|0)\d{8,10}$/.test(phone) ? 'phone' : !fd.address.trim() ? 'address' : '';
        if (f) { form.elements[f].classList.add('is-invalid'); form.elements[f].focus(); }
        return;
      }
      const btn = $('#orderSubmit');
      btn.disabled = true; btn.textContent = 'Đang gửi…';
      try {
        const res = await fetch('/api/orders', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...fd, items: cart.map(({ productId, size: sz, qty }) => ({ productId, size: sz, qty })) }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Không gửi được đơn hàng, vui lòng thử lại.');
        const total = cartTotal();
        cart = []; saveCart();
        form.innerHTML = `<div class="success">
          <div class="success__check"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="none"/><path d="M15 27l7 7 15-16" fill="none"/></svg></div>
          <h3>Đặt hàng thành công!</h3>
          <p>Mã đơn của bạn: <b>${h(data.code)}</b><br>Tổng tiền: <b>${money(total)}</b></p>
          <p>${h((S.order || {}).successText)}</p>
          <div class="success__btns"><a href="#tat-ca" class="btn btn--line">Xem thêm tranh</a>${brand.zalo ? `<a class="btn btn--accent" href="${zalo(brand.zalo)}" target="_blank" rel="noopener">Nhắn Zalo xác nhận</a>` : ''}</div>
        </div>`;
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        const top = form.getBoundingClientRect().top + window.scrollY - 100;
        if (window.__lenis) window.__lenis.scrollTo(top, { immediate: true }); else window.scrollTo(0, top);
      } catch (ex) {
        err.textContent = ex.message;
        btn.disabled = false; btn.textContent = 'Gửi đơn đặt hàng';
      }
    });
  }

  /* ---------------- đồng hồ đếm ngược ---------------- */
  function initCountdown() {
    const el = $('#countdown'); if (!el) return;
    const pr = S.promo || {};
    const fixed = pr.endDate ? new Date(pr.endDate).getTime() : NaN;
    const target = () => {
      if (!isNaN(fixed) && fixed > Date.now()) return fixed;
      const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); // ưu đãi trong ngày
    };
    const dEl = $('[data-unit="d"]', el);
    const tick = () => {
      let s = Math.max(0, Math.floor((target() - Date.now()) / 1000));
      const d = Math.floor(s / 86400); s %= 86400;
      dEl.hidden = d === 0;
      $('b', dEl).textContent = pad(d);
      $('[data-cd="h"]', el).textContent = pad(Math.floor(s / 3600));
      $('[data-cd="m"]', el).textContent = pad(Math.floor((s % 3600) / 60));
      $('[data-cd="s"]', el).textContent = pad(s % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------------- điều hướng & sự kiện chung ---------------- */
  function goTo(hash) {
    if (hash === '#dat-hang' && !isDesktop() && $('#orderForm')) hash = '#orderForm'; // mobile: tới thẳng form
    const t = hash === '#top' ? 0 : $(hash);
    if (t === null) return;
    if (window.__lenis) window.__lenis.scrollTo(t, { offset: hash === '#top' ? 0 : -70, duration: 1.6 });
    else if (t === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    else t.scrollIntoView({ behavior: 'smooth' });
  }

  function initEvents() {
    document.addEventListener('click', (e) => {
      const open = e.target.closest('[data-open]');
      if (open) { e.preventDefault(); openProduct(open.dataset.open); return; }
      const quick = e.target.closest('[data-quick]');
      if (quick) {
        const p = byId(quick.dataset.quick); const m = minSize(p);
        if (!m) { openProduct(p.id); return; }
        addToCart(p.id, m.label, 1);
        toast(`Đã chọn “${p.name}” – ${m.label}. Bạn có thể đổi kích thước ở form đặt hàng.`);
        goTo('#dat-hang');
        return;
      }
      const close = e.target.closest('[data-close]');
      if (close) { const layer = close.closest('.modal, .drawer, .lightbox'); if (layer) closeLayer(layer); }
      if (e.target.closest('[data-checkout]')) { e.preventDefault(); closeLayer($('#cartDrawer')); goTo('#dat-hang'); return; }
      const a = e.target.closest('a[href^="#"]');
      if (a && a.getAttribute('href').length > 1) {
        e.preventDefault();
        document.body.classList.remove('nav-open');
        goTo(a.getAttribute('href'));
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const layers = $$('.lightbox.is-open, .modal.is-open, .drawer.is-open');
      if (layers.length) closeLayer(layers[0]);
    });
    $('#cartBtn').addEventListener('click', () => openLayer($('#cartDrawer')));
    $('#burger').addEventListener('click', () => document.body.classList.toggle('nav-open'));

    // header: nền đặc khi cuộn, ẩn khi cuộn xuống
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const hd = $('#header');
      hd.classList.toggle('is-scrolled', y > 60);
      hd.classList.toggle('is-hidden', y > lastY && y > 400 && !document.body.classList.contains('nav-open'));
      lastY = y;
      document.body.classList.toggle('show-bar', y > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // kéo để cuộn khu đánh giá
    const tr = $('#reviewsTrack');
    if (tr) {
      let down = false, sx = 0, sl = 0;
      tr.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = tr.scrollLeft; tr.classList.add('is-drag'); });
      window.addEventListener('pointerup', () => { down = false; tr.classList.remove('is-drag'); });
      tr.addEventListener('pointermove', (e) => { if (down) tr.scrollLeft = sl - (e.clientX - sx); });
    }

    // bước quy trình (dùng IntersectionObserver – chạy cả khi không có GSAP)
    const steps = $$('.pstep');
    if (steps.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((ents) => ents.forEach((en) => {
        if (!en.isIntersecting) return;
        const i = +en.target.dataset.i;
        steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
        $$('.process__img').forEach((im, k) => im.classList.toggle('is-active', k === i));
        $('#pcur').textContent = pad(i + 1);
      }), { rootMargin: '-45% 0px -45% 0px' });
      steps.forEach((s) => io.observe(s));
    }
  }

  /* ---------------- dải tranh trôi ngang (bộ sưu tập nổi bật) ---------------- */
  function initBelts() { $$('.belt').forEach(initBelt); }
  function initBelt(belt) {
    const track = $('.belt__track', belt);
    const group = $('.belt__group', belt);
    const SPEED = isDesktop() ? 42 : 30; // px mỗi giây
    let x = 0, half = 0, nudge = 0, hover = false, inView = true, drag = null, last = performance.now();
    const measure = () => { half = group.offsetWidth; };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);

    // rê chuột: dừng lại để xem; rời chuột: chạy tiếp
    belt.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hover = true; });
    belt.addEventListener('pointerleave', () => { hover = false; });

    // kéo / vuốt bằng tay
    belt.addEventListener('pointerdown', (e) => { drag = { sx: e.clientX, x0: x, moved: false }; });
    window.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.sx;
      if (Math.abs(dx) > 6) { drag.moved = true; belt.classList.add('is-drag'); }
      if (drag.moved) x = drag.x0 + dx;
    }, { passive: true });
    window.addEventListener('pointerup', () => {
      if (drag && drag.moved) setTimeout(() => belt.classList.remove('is-drag'), 0);
      setTimeout(() => { drag = null; }, 0);
    });
    belt.addEventListener('click', (e) => { if (drag && drag.moved) { e.preventDefault(); e.stopPropagation(); } }, true);

    // nút mũi tên
    $$('[data-belt]', belt.closest('section')).forEach((b) => b.addEventListener('click', () => {
      const card = $('.card', group);
      const step = card ? card.offsetWidth + parseFloat(getComputedStyle(card).marginRight || 0) + 28 : 320;
      nudge -= Number(b.dataset.belt) * step;
    }));

    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { inView = en.isIntersecting; }).observe(belt);

    const tick = (now) => {
      const dt = Math.min(64, now - last) / 1000; last = now;
      if (inView && half) {
        if (!drag && !hover && !reduceMotion) x -= SPEED * dt;
        if (Math.abs(nudge) > 0.5) { const s = nudge * 0.12; x += s; nudge -= s; } else nudge = 0;
        while (x <= -half) { x += half; if (drag) drag.x0 += half; }
        while (x > 0) { x -= half; if (drag) drag.x0 -= half; }
        track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------------- nút bật nhạc xuân ----------------
     - Có link nhạc (mp3) trong Quản trị → phát file đó, lặp lại.
     - Không có → tự chơi một giai điệu ngũ cung tươi vui bằng Web Audio (không cần file, không vướng bản quyền). */
  function initMusic() {
    const cfg = S.music || {};
    if (cfg.enabled === false) return;
    const btn = document.createElement('button');
    btn.className = 'music-btn';
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `<span class="music-btn__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="music-btn__label">${h(cfg.label || 'Nhạc xuân')}</span>`;
    document.body.appendChild(btn);

    let playing = false, audio = null, ctx = null, master = null, timer = null, step = 0, nextTime = 0;
    const fileUrl = url(cfg.url);

    // giai điệu ngũ cung (Đô – Rê – Fa – Sol – La), 0 = nghỉ
    const N = { C4: 261.63, D4: 293.66, F4: 349.23, G4: 392, A4: 440, C5: 523.25, D5: 587.33, F5: 698.46, G5: 783.99 };
    const tune = ['G4', 'A4', 'C5', 'A4', 'G4', 'F4', 'D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'C5', 'A4', 'G4', 0,
      'F4', 'G4', 'A4', 'G4', 'F4', 'D4', 'C4', 'D4', 'F4', 'G4', 'A4', 'C5', 'G4', 0, 0, 0,
      'C5', 'D5', 'F5', 'D5', 'C5', 'A4', 'G4', 'A4', 'C5', 'D5', 'G5', 'F5', 'D5', 'C5', 'A4', 0,
      'G4', 'A4', 'C5', 'A4', 'G4', 'F4', 'D4', 'F4', 'G4', 'F4', 'D4', 'C4', 'C4', 0, 0, 0];
    const bass = [130.81, 98, 87.31, 98]; // C3 G2 F2 G2 – mỗi ô nhịp
    const BEAT = 60 / 92 / 2; // móc đơn, 92 bpm

    function pluck(freq, t, vol = 0.22, len = 1.1) {
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = 'triangle'; o2.type = 'sine';
      o.frequency.setValueAtTime(freq * 1.012, t); o.frequency.exponentialRampToValueAtTime(freq, t + 0.08); // luyến nhẹ như đàn tranh
      o2.frequency.setValueAtTime(freq * 2, t);
      f.type = 'lowpass'; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(900, t + len);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      const g2 = ctx.createGain(); g2.gain.value = 0.25;
      o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(master);
      o.start(t); o2.start(t); o.stop(t + len + 0.05); o2.stop(t + len + 0.05);
    }
    function schedule() {
      while (nextTime < ctx.currentTime + 0.25) {
        const note = tune[step % tune.length];
        if (note) pluck(N[note], nextTime);
        if (step % 8 === 0) pluck(bass[(step / 8) % bass.length], nextTime, 0.16, 2.4);
        if (step % 32 === 28) pluck(N.C5 * 2, nextTime, 0.05, 1.8); // tiếng chuông nhỏ
        nextTime += BEAT; step++;
      }
    }
    function startSynth() {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (!master) {
        master = ctx.createGain(); master.gain.value = 0;
        const delay = ctx.createDelay(); delay.delayTime.value = BEAT * 3;
        const fb = ctx.createGain(); fb.gain.value = 0.28;
        master.connect(ctx.destination); master.connect(delay); delay.connect(fb); fb.connect(delay); fb.connect(ctx.destination);
      }
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.5, ctx.currentTime, 0.4);
      nextTime = ctx.currentTime + 0.1;
      timer = setInterval(schedule, 80);
    }
    function stopSynth() {
      clearInterval(timer);
      if (master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    }
    function toggle() {
      playing = !playing;
      try {
        if (fileUrl) {
          audio = audio || Object.assign(new Audio(fileUrl), { loop: true, volume: 0.5 });
          if (playing) audio.play().catch(() => { playing = false; update(); toast('Không phát được nhạc.'); }); else audio.pause();
        } else if (playing) startSynth(); else stopSynth();
      } catch (e) { playing = false; }
      update();
    }
    function update() {
      btn.classList.toggle('is-on', playing);
      btn.setAttribute('aria-pressed', String(playing));
      btn.setAttribute('aria-label', playing ? 'Tắt nhạc xuân' : 'Bật nhạc xuân');
    }
    update();
    btn.addEventListener('click', toggle);
    document.addEventListener('visibilitychange', () => { if (document.hidden && playing) toggle(); });
  }

  /* ---------------- con trỏ tuỳ biến ---------------- */
  function initCursor() {
    if (!finePointer || reduceMotion) return;
    const c = $('#cursor'), label = $('.cursor__label', c);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    document.body.classList.add('has-cursor');
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; c.classList.add('is-visible'); }, { passive: true });
    document.addEventListener('mouseleave', () => c.classList.remove('is-visible'));
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, select, input, textarea, summary');
      c.classList.toggle('is-label', !!t);
      c.classList.toggle('is-link', !t && !!link);
      label.textContent = t ? t.dataset.cursor : '';
    });
    const loop = () => {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------------- hiệu ứng nghiêng thẻ ---------------- */
  function initTilt() {
    if (!finePointer || reduceMotion) return;
    document.addEventListener('pointermove', (e) => {
      const m = e.target.closest('.card__media');
      $$('.card__media.is-tilt').forEach((x) => { if (x !== m) { x.classList.remove('is-tilt'); x.style.removeProperty('--rx'); x.style.removeProperty('--ry'); } });
      if (!m) return;
      const r = m.getBoundingClientRect();
      m.classList.add('is-tilt');
      m.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 8 + 'deg');
      m.style.setProperty('--rx', -((e.clientY - r.top) / r.height - 0.5) * 8 + 'deg');
    }, { passive: true });
  }

  /* ---------------- chuyển động điện ảnh (GSAP) ---------------- */
  function initMotion() {
    const gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST || reduceMotion) { document.documentElement.classList.add('no-motion'); return; }
    gsap.registerPlugin(ST);
    document.documentElement.classList.add('has-motion');

    if (window.Lenis) {
      const lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 1 });
      window.__lenis = lenis;
      lenis.on('scroll', ST.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // đổi tông nền sáng/tối theo từng phân cảnh
    $$('[data-tone="dark"]').forEach((sec) => ST.create({
      trigger: sec, start: 'top 55%', end: 'bottom 45%',
      onToggle: (self) => document.body.classList.toggle('is-dark', self.isActive),
    }));

    const mm = gsap.matchMedia();

    // HERO: khung ảnh co lại thành “màn chiếu”, chữ trôi lên
    mm.add('(min-width: 0px)', () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=85%', scrub: 0.8, pin: true, anticipatePin: 1 } });
      tl.to('.hero__frame', { clipPath: 'inset(9% 5% 9% 5% round 28px)', ease: 'none' }, 0)
        .to('.hero__media', { scale: 0.92, ease: 'none' }, 0)
        .to('.hero__content', { yPercent: -35, autoAlpha: 0, ease: 'none' }, 0)
        .to('.hero__ui', { autoAlpha: 0, ease: 'none' }, 0);
    });

    // marquee phản ứng theo vận tốc cuộn
    const mq = $('.marquee__track');
    if (mq) {
      const loop = gsap.to(mq, { xPercent: -50, ease: 'none', duration: 28, repeat: -1 });
      let dir = 1;
      ST.create({
        onUpdate: (self) => {
          const v = self.getVelocity();
          if (v) dir = v > 0 ? 1 : -1;
          gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(v) / 300, 6)), duration: 0.3, overwrite: true });
          gsap.to(mq, { skewX: gsap.utils.clamp(-8, 8, -v / 200), duration: 0.4, overwrite: 'auto' });
        },
      });
    }

    // tiêu đề tách dòng trượt lên
    $$('[data-lines]').forEach((el) => {
      gsap.from($$('.line__in', el), { yPercent: 110, rotate: 2, duration: 1.1, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 85%', onEnter: () => el.classList.add('is-drawn') } });
    });

    // hiện dần các phần tử
    gsap.set('[data-reveal]', { y: 40, autoAlpha: 0 });
    ST.batch('[data-reveal]', {
      start: 'top 92%', once: true,
      onEnter: (els) => gsap.to(els, { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', stagger: 0.08, overwrite: true }),
    });
    gsap.set('#grid .card', { y: 70, autoAlpha: 0 });
    ST.batch('#grid .card', {
      start: 'top 95%', once: true,
      onEnter: (els) => gsap.to(els, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'power3.out', stagger: 0.08 }),
    });

    // câu tuyên ngôn: từng chữ sáng dần theo cuộn
    const words = $$('.intro__statement .w');
    if (words.length) gsap.fromTo(words, { opacity: 0.12 }, { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: '.intro__statement', start: 'top 80%', end: 'bottom 40%', scrub: true } });

    // ảnh lộ dần + parallax
    $$('.reveal-img').forEach((w) => {
      gsap.fromTo(w, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: w, start: 'top 85%' } });
    });
    $$('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1.15, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // số liệu đếm lên
    $$('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count) || 0, suf = el.dataset.suffix || '', o = { v: 0 };
      el.textContent = '0' + suf;
      gsap.to(o, { v: end, duration: 2.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('vi-VN') + suf; } });
    });

    // dải tranh nổi bật trượt nhẹ vào khi xuất hiện
    $$('.belt').forEach((b) => gsap.from(b, { x: 120, autoAlpha: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 90%' } }));


    // chữ khổng lồ ở chân trang
    gsap.from('.footer__big span', { yPercent: 100, ease: 'expo.out', duration: 1.4, stagger: 0.04, scrollTrigger: { trigger: '.footer__big', start: 'top 95%' } });

    // ảnh/hình nền khu đặt hàng zoom nhẹ
    window.addEventListener('load', () => ST.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST.refresh());
  }

  /* ---------------- preloader ---------------- */
  function finishLoading() {
    const done = () => {
      document.documentElement.classList.add('is-loaded');
      setTimeout(() => $('#preloader') && $('#preloader').remove(), 1400);
    };
    const minTime = new Promise((r) => setTimeout(r, reduceMotion ? 0 : 1100));
    const img = $('.hero__slide img');
    const imgReady = new Promise((r) => { if (!img || img.complete) r(); else { img.onload = r; img.onerror = r; } });
    Promise.race([Promise.all([minTime, imgReady]), new Promise((r) => setTimeout(r, 3000))]).then(done);
  }

  /* ---------------- khởi chạy ---------------- */
  render();
  renderCart();
  initHeroSlider();
  initFilter();
  initOrder();
  initCountdown();
  initEvents();
  initBelts();
  initMusic();
  initCursor();
  initTilt();
  initMotion();
  finishLoading();
})();
