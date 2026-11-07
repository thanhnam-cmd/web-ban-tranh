/**
 * Sinh bộ tranh mẫu dạng SVG (ảnh minh hoạ) vào public/samples.
 * Chạy: npm run samples
 */
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'public', 'samples');
fs.mkdirSync(OUT, { recursive: true });

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => Math.round(n * 10) / 10;
const lerp = (a, b, t) => a + (b - a) * t;
function mix(c1, c2, t) {
  const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
  const r = Math.round(lerp(a >> 16, b >> 16, t)), g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t)), bl = Math.round(lerp(a & 255, b & 255, t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}
function ridge(w, h, base, amp, r, steps = 9) {
  const pts = [];
  for (let i = 0; i <= steps; i++) pts.push([(w / steps) * i, base - r() * amp]);
  let d = `M0,${h} L0,${f(pts[0][1])} `;
  for (let i = 0; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += `Q${f(pts[i][0])},${f(pts[i][1])} ${f(mx)},${f(my)} `;
  }
  d += `L${w},${f(pts[pts.length - 1][1])} L${w},${h} Z`;
  return d;
}
const grain = (p, w, h, a = 0.09) => `
  <filter id="${p}gr"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/>
  <feColorMatrix values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 ${a}"/></filter>
  <rect width="${w}" height="${h}" filter="url(#${p}gr)"/>`;
const petal = (len, wid) => `M0,0 C${-wid},${-len * 0.35} ${-wid * 0.7},${-len * 0.85} 0,${-len} C${wid * 0.7},${-len * 0.85} ${wid},${-len * 0.35} 0,0Z`;

/* -------------------- các phong cách tranh -------------------- */
const ART = {
  mountains(w, h, p, r, pal = ['#f6c89f', '#e98a6b', '#c2566a', '#6b3a5e', '#2c2240']) {
    let s = `<defs><linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe7c6"/><stop offset="1" stop-color="${pal[0]}"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#${p}sky)"/>
    <circle cx="${f(w * (0.3 + r() * 0.4))}" cy="${f(h * 0.36)}" r="${f(Math.min(w, h) * 0.11)}" fill="#fff4e0" opacity=".9"/>`;
    for (let i = 0; i < 5; i++) {
      const base = h * (0.48 + i * 0.11);
      s += `<path d="${ridge(w, h, base, h * (0.16 - i * 0.015), r)}" fill="${mix(pal[1], pal[4], i / 4)}"/>`;
    }
    return s + grain(p, w, h);
  },
  colorField(w, h, p, r) {
    return `<defs><filter id="${p}b"><feGaussianBlur stdDeviation="${f(w * 0.012)}"/></filter></defs>
    <rect width="${w}" height="${h}" fill="#3b2a26"/>
    <g filter="url(#${p}b)">
      <rect x="${f(w * 0.08)}" y="${f(h * 0.07)}" width="${f(w * 0.84)}" height="${f(h * 0.42)}" rx="8" fill="#c8643b" opacity=".92"/>
      <rect x="${f(w * 0.08)}" y="${f(h * 0.53)}" width="${f(w * 0.84)}" height="${f(h * 0.12)}" rx="8" fill="#e8b25d" opacity=".9"/>
      <rect x="${f(w * 0.08)}" y="${f(h * 0.69)}" width="${f(w * 0.84)}" height="${f(h * 0.24)}" rx="8" fill="#7a2f2a" opacity=".95"/>
    </g>` + grain(p, w, h, 0.12);
  },
  arches(w, h, p, r) {
    const cols = ['#c2603d', '#e0a36b', '#9a6a4f', '#e8cfae', '#7c8a6b', '#d48a5f'];
    const cx = w / 2, by = h * 0.86;
    let s = `<rect width="${w}" height="${h}" fill="#f1e6d6"/><circle cx="${f(w * 0.74)}" cy="${f(h * 0.2)}" r="${f(w * 0.08)}" fill="#d9874f"/>`;
    for (let i = 0; i < 6; i++) {
      const rr = w * (0.38 - i * 0.058);
      s += `<path d="M${f(cx - rr)},${f(by)} A${f(rr)},${f(rr)} 0 0 1 ${f(cx + rr)},${f(by)} Z" fill="${cols[i]}"/>`;
    }
    return s + `<rect y="${f(by)}" width="${w}" height="${f(h - by)}" fill="#e6d5bd"/>` + grain(p, w, h, 0.1);
  },
  waves(w, h, p, r) {
    let s = `<defs><linearGradient id="${p}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1b2e"/><stop offset="1" stop-color="#1f3c5a"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#${p}g)"/><circle cx="${f(w * 0.68)}" cy="${f(h * 0.2)}" r="${f(w * 0.09)}" fill="#f2ead8"/>`;
    for (let i = 0; i < 34; i++) {
      const y = h * 0.38 + i * h * 0.018, a = 6 + i * 1.3, ph = r() * 6;
      let d = `M0,${f(y)}`;
      for (let x = 0; x <= w; x += w / 40) d += ` L${f(x)},${f(y + Math.sin(x / (w / 6) + ph) * a)}`;
      s += `<path d="${d}" fill="none" stroke="#e9e2cf" stroke-width="${f(1 + i * 0.05)}" opacity="${f(0.15 + i * 0.02)}"/>`;
    }
    return s + grain(p, w, h, 0.08);
  },
  lotus(w, h, p, r) {
    const cx = w / 2, cy = h * 0.56, S = Math.min(w, h);
    let s = `<defs>
      <radialGradient id="${p}bg" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#2d3b37"/><stop offset="1" stop-color="#0d1413"/></radialGradient>
      <linearGradient id="${p}pt" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f7e9dc"/><stop offset=".55" stop-color="#eeb3b5"/><stop offset="1" stop-color="#d9727f"/></linearGradient>
      <radialGradient id="${p}halo"><stop offset="0" stop-color="#e9c77b" stop-opacity=".45"/><stop offset="1" stop-color="#e9c77b" stop-opacity="0"/></radialGradient>
    </defs><rect width="${w}" height="${h}" fill="url(#${p}bg)"/>
    <circle cx="${cx}" cy="${f(cy - S * 0.12)}" r="${f(S * 0.42)}" fill="url(#${p}halo)"/>
    <circle cx="${cx}" cy="${f(cy - S * 0.12)}" r="${f(S * 0.3)}" fill="none" stroke="#d8b46a" stroke-width="1.5" opacity=".6"/>`;
    // lá sen
    s += `<ellipse cx="${f(cx - S * 0.26)}" cy="${f(cy + S * 0.27)}" rx="${f(S * 0.22)}" ry="${f(S * 0.06)}" fill="#3f6b4f"/>
      <ellipse cx="${f(cx + S * 0.28)}" cy="${f(cy + S * 0.31)}" rx="${f(S * 0.18)}" ry="${f(S * 0.05)}" fill="#33583f"/>
      <path d="M${cx},${f(cy)} C${f(cx + 6)},${f(cy + S * 0.15)} ${f(cx - 8)},${f(cy + S * 0.3)} ${f(cx)},${f(h)}" stroke="#4b7a58" stroke-width="5" fill="none"/>`;
    const layers = [[9, 0.34, 0.1, 0.8], [7, 0.3, 0.09, 0.92], [5, 0.24, 0.08, 1]];
    layers.forEach(([n, len, wid, op]) => {
      for (let i = 0; i < n; i++) {
        const ang = -80 + (160 / (n - 1)) * i;
        s += `<path d="${petal(S * len, S * wid)}" fill="url(#${p}pt)" opacity="${op}" stroke="#c75f6e" stroke-opacity=".25" transform="translate(${cx},${f(cy)}) rotate(${f(ang)})"/>`;
      }
    });
    s += `<ellipse cx="${cx}" cy="${f(cy - S * 0.05)}" rx="${f(S * 0.05)}" ry="${f(S * 0.03)}" fill="#e3b85a"/>`;
    for (let i = 0; i < 30; i++) s += `<circle cx="${f(r() * w)}" cy="${f(r() * h * 0.7)}" r="${f(r() * 1.6 + 0.4)}" fill="#e9c77b" opacity="${f(r() * 0.6)}"/>`;
    return s + grain(p, w, h, 0.07);
  },
  botanical(w, h, p, r) {
    const cols = ['#2f5d46', '#4c7d5a', '#7fa07a', '#a9bf8e', '#24463a'];
    let s = `<rect width="${w}" height="${h}" fill="#ece3d3"/><circle cx="${f(w * 0.3)}" cy="${f(h * 0.3)}" r="${f(w * 0.22)}" fill="#e2c9a6"/>`;
    for (let i = 0; i < 9; i++) {
      const ang = -70 + i * 17 + r() * 8, len = h * (0.45 + r() * 0.25), wid = w * (0.1 + r() * 0.06);
      const c = cols[i % cols.length];
      s += `<g transform="translate(${f(w * 0.5)},${f(h * 0.98)}) rotate(${f(ang)})"><path d="${petal(len, wid)}" fill="${c}"/><path d="M0,0 L0,${f(-len * 0.97)}" stroke="#ece3d3" stroke-width="2" opacity=".55"/></g>`;
    }
    return s + grain(p, w, h, 0.1);
  },
  gold(w, h, p, r) {
    let s = `<defs><linearGradient id="${p}au" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e2a6"/><stop offset=".5" stop-color="#c9973f"/><stop offset="1" stop-color="#8a6022"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="#0f1b2b"/><rect width="${w}" height="${h}" fill="#1c3550" opacity=".5"/>`;
    for (let i = 0; i < 14; i++) {
      const y0 = h * (0.15 + r() * 0.7), y1 = h * (0.15 + r() * 0.7);
      s += `<path d="M${f(-w * 0.1)},${f(y0)} C${f(w * 0.3)},${f(y0 - h * 0.35 * (r() - 0.3))} ${f(w * 0.7)},${f(y1 + h * 0.3 * (r() - 0.5))} ${f(w * 1.1)},${f(y1)}" fill="none" stroke="url(#${p}au)" stroke-width="${f(1 + r() * (i % 4 === 0 ? 26 : 6))}" stroke-linecap="round" opacity="${f(0.35 + r() * 0.6)}"/>`;
    }
    return s + grain(p, w, h, 0.1);
  },
  moonLake(w, h, p, r) {
    let s = `<defs><linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26244a"/><stop offset=".55" stop-color="#b9789a"/><stop offset=".56" stop-color="#4d4370"/><stop offset="1" stop-color="#1d1b38"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#${p}s)"/><circle cx="${f(w / 2)}" cy="${f(h * 0.33)}" r="${f(w * 0.13)}" fill="#fbeedd"/>`;
    for (let i = 0; i < 14; i++) {
      const y = h * 0.6 + i * h * 0.022, ww = w * (0.22 - i * 0.012);
      s += `<rect x="${f(w / 2 - ww / 2)}" y="${f(y)}" width="${f(ww)}" height="3" rx="1.5" fill="#fbeedd" opacity="${f(0.7 - i * 0.045)}"/>`;
    }
    s += `<path d="${ridge(w, h * 0.56, h * 0.56, h * 0.06, r, 7)}" fill="#3b3160"/>`;
    for (let i = 0; i < 26; i++) {
      const x = (i < 13 ? r() * w * 0.3 : w * 0.7 + r() * w * 0.3), top = h * (0.62 + r() * 0.18);
      s += `<path d="M${f(x)},${h} Q${f(x + 8)},${f((h + top) / 2)} ${f(x + (r() - 0.5) * 30)},${f(top)}" stroke="#141228" stroke-width="${f(2 + r() * 3)}" fill="none"/>`;
    }
    return s + grain(p, w, h, 0.08);
  },
  bauhaus(w, h, p, r) {
    const cols = ['#c8553d', '#f2b134', '#2a6f97', '#1b1b1e', '#e8dcc7', '#8a9a5b'];
    const cw = w / 3, ch = h / 4;
    let s = `<rect width="${w}" height="${h}" fill="#efe6d6"/>`;
    for (let y = 0; y < 4; y++) for (let x = 0; x < 3; x++) {
      const X = x * cw, Y = y * ch, c = cols[Math.floor(r() * cols.length)], t = Math.floor(r() * 4);
      s += `<rect x="${f(X)}" y="${f(Y)}" width="${f(cw)}" height="${f(ch)}" fill="${cols[(x + y) % 2 ? 4 : 5]}" opacity="${(x + y) % 2 ? 1 : 0.35}"/>`;
      if (t === 0) s += `<circle cx="${f(X + cw / 2)}" cy="${f(Y + ch / 2)}" r="${f(Math.min(cw, ch) * 0.4)}" fill="${c}"/>`;
      if (t === 1) s += `<path d="M${f(X)},${f(Y + ch)} A${f(cw / 2)},${f(cw / 2)} 0 0 1 ${f(X + cw)},${f(Y + ch)}Z" fill="${c}"/>`;
      if (t === 2) s += `<path d="M${f(X)},${f(Y)} L${f(X + cw)},${f(Y)} L${f(X)},${f(Y + ch)}Z" fill="${c}"/>`;
      if (t === 3) s += `<rect x="${f(X + cw * 0.2)}" y="${f(Y + ch * 0.2)}" width="${f(cw * 0.6)}" height="${f(ch * 0.6)}" fill="${c}"/>`;
    }
    return s + grain(p, w, h, 0.1);
  },
  bamboo(w, h, p, r) {
    let s = `<defs><linearGradient id="${p}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef0e2"/><stop offset="1" stop-color="#cfdcc0"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${p}m)"/>`;
    for (let layer = 0; layer < 3; layer++) {
      const n = 4 + layer * 2, col = ['#b5c7a2', '#7d9c6b', '#3f6a45'][layer], sw = w * (0.012 + layer * 0.008);
      for (let i = 0; i < n; i++) {
        const x = r() * w;
        s += `<rect x="${f(x)}" y="0" width="${f(sw)}" height="${h}" fill="${col}"/>`;
        for (let y = r() * 120; y < h; y += 90 + r() * 70) s += `<rect x="${f(x - 1)}" y="${f(y)}" width="${f(sw + 2)}" height="3" fill="${mix(col, '#1e3324', 0.4)}"/>`;
        for (let k = 0; k < 3; k++) {
          const ly = r() * h * 0.8, ang = (r() > 0.5 ? 1 : -1) * (40 + r() * 50);
          s += `<path d="${petal(w * (0.06 + layer * 0.02), w * 0.012)}" fill="${col}" transform="translate(${f(x + sw / 2)},${f(ly)}) rotate(${f(ang + 180)})"/>`;
        }
      }
      s += `<rect width="${w}" height="${h}" fill="#eef0e2" opacity="${layer < 2 ? 0.35 : 0}"/>`;
    }
    return s + grain(p, w, h, 0.08);
  },
  ink(w, h, p, r) {
    let s = `<defs><linearGradient id="${p}fd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2a28"/><stop offset=".7" stop-color="#2b2a28" stop-opacity="0"/></linearGradient>
    <filter id="${p}bl"><feGaussianBlur stdDeviation="2"/></filter></defs><rect width="${w}" height="${h}" fill="#f1ebdf"/>`;
    for (let i = 0; i < 4; i++) {
      const base = h * (0.35 + i * 0.16);
      s += `<path d="${ridge(w, h, base, h * 0.22, r, 6)}" fill="url(#${p}fd)" opacity="${f(0.25 + i * 0.2)}" filter="url(#${p}bl)"/>`;
    }
    for (let i = 0; i < 3; i++) {
      const bx = w * (0.55 + r() * 0.3), by = h * (0.18 + r() * 0.1);
      s += `<path d="M${f(bx)},${f(by)} q8,-7 16,0 q8,-7 16,0" stroke="#2b2a28" stroke-width="2" fill="none"/>`;
    }
    s += `<rect x="${f(w * 0.1)}" y="${f(h * 0.1)}" width="${f(w * 0.06)}" height="${f(w * 0.06)}" fill="#b2322b"/>
    <rect x="${f(w * 0.11)}" y="${f(h * 0.1 + w * 0.01)}" width="${f(w * 0.04)}" height="${f(w * 0.04)}" fill="none" stroke="#f1ebdf" stroke-width="2"/>`;
    return s + grain(p, w, h, 0.12);
  },
  terraces(w, h, p, r) {
    const cols = ['#e7c35a', '#d4a640', '#a9b04a', '#7f9a3e', '#c99a35', '#e3b84d', '#90a543', '#5f7d34'];
    let s = `<defs><linearGradient id="${p}sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5e4c3"/><stop offset="1" stop-color="#eac58c"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#${p}sk)"/><circle cx="${f(w * 0.75)}" cy="${f(h * 0.14)}" r="${f(Math.min(w, h) * 0.07)}" fill="#fff3d6"/>
    <path d="${ridge(w, h, h * 0.3, h * 0.1, r, 6)}" fill="#8c9a6a" opacity=".6"/>`;
    for (let i = 0; i < 14; i++) {
      const y = h * (0.3 + i * 0.055);
      let d = `M0,${h} L0,${f(y)}`;
      for (let x = 0; x <= w; x += w / 30) d += ` L${f(x)},${f(y + Math.sin(x / (w / 3) + i * 0.6) * h * 0.035)}`;
      d += ` L${w},${h}Z`;
      s += `<path d="${d}" fill="${cols[i % cols.length]}" stroke="#6f6a33" stroke-opacity=".35" stroke-width="2"/>`;
    }
    return s + grain(p, w, h, 0.09);
  },
};

const ORDER = ['mountains', 'colorField', 'arches', 'waves', 'lotus', 'botanical', 'gold', 'moonLake', 'bauhaus', 'bamboo', 'ink', 'terraces'];
const svg = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

// Tranh sản phẩm 4:5
ORDER.forEach((k, i) => {
  const n = String(i + 1).padStart(2, '0');
  fs.writeFileSync(path.join(OUT, `art-${n}.svg`), svg(800, 1000, ART[k](800, 1000, 'a', rng(100 + i))));
});

// Banner ngang
const heroes = [['mountains', 11, ['#f2b98a', '#d8735f', '#a2475f', '#58305a', '#221b36']], ['lotus', 12], ['terraces', 13]];
heroes.forEach(([k, seed, pal], i) => {
  fs.writeFileSync(path.join(OUT, `hero-0${i + 1}.svg`), svg(1920, 1080, ART[k](1920, 1080, 'h', rng(seed), pal)));
});

/* --------- phối cảnh không gian (tranh treo trong phòng) --------- */
function framed(x, y, fw, fh, art, seed, p, frame = '#6b4b32') {
  const m = fw * 0.06;
  return `<rect x="${x + 6}" y="${y + 10}" width="${fw}" height="${fh}" fill="#000" opacity=".18" filter="url(#sh)"/>
  <rect x="${x}" y="${y}" width="${fw}" height="${fh}" fill="${frame}"/>
  <rect x="${x + 8}" y="${y + 8}" width="${fw - 16}" height="${fh - 16}" fill="#f6f1e8"/>
  <svg x="${x + m}" y="${y + m}" width="${fw - 2 * m}" height="${fh - 2 * m}" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">${ART[art](800, 1000, p, rng(seed))}</svg>`;
}
const W = 1200, H = 900;
const shadowDef = (p) => `<defs><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>
<linearGradient id="lt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
const plant = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-28,0 L28,0 L22,60 L-22,60Z" fill="#c9b49a"/>${[-60, -35, -10, 15, 40, 65].map((a, i) => `<path d="${petal(110 + (i % 2) * 30, 18)}" fill="${i % 2 ? '#4d7a55' : '#3a6444'}" transform="rotate(${a})"/>`).join('')}</g>`;

const rooms = [
  (p) => `${shadowDef(p)}<rect width="${W}" height="${H}" fill="#d9cdbb"/><rect width="${W}" height="${H}" fill="url(#lt)"/>
    <rect y="700" width="${W}" height="200" fill="#a7896b"/><rect y="700" width="${W}" height="6" fill="#8d7257"/>
    ${framed(440, 150, 320, 400, 'mountains', 100, p + 'a')}
    <rect x="300" y="560" width="600" height="150" rx="40" fill="#7d8b80"/><rect x="280" y="600" width="640" height="120" rx="30" fill="#6c7a70"/>
    <rect x="330" y="540" width="160" height="90" rx="26" fill="#e7dccb"/><rect x="710" y="540" width="160" height="90" rx="26" fill="#c9a77f"/>
    <rect x="320" y="715" width="16" height="40" fill="#3d3128"/><rect x="864" y="715" width="16" height="40" fill="#3d3128"/>
    ${plant(1040, 640, 1.1)}<rect x="140" y="420" width="6" height="290" fill="#2f2924"/><path d="M95,420 L190,420 L170,360 L115,360Z" fill="#efe2c9"/>`,
  (p) => `${shadowDef(p)}<rect width="${W}" height="${H}" fill="#c9d1cc"/><rect width="${W}" height="${H}" fill="url(#lt)"/>
    <rect y="720" width="${W}" height="180" fill="#b9a58b"/>
    ${framed(470, 120, 260, 325, 'arches', 102, p + 'a', '#c8b08e')}
    <rect x="300" y="480" width="600" height="250" rx="16" fill="#e9e3d8"/><rect x="300" y="470" width="600" height="60" rx="18" fill="#8a9c92"/>
    <rect x="340" y="530" width="230" height="70" rx="24" fill="#fbf8f2"/><rect x="630" y="530" width="230" height="70" rx="24" fill="#fbf8f2"/>
    <rect x="300" y="620" width="600" height="110" rx="10" fill="#d4c2a5"/>
    <rect x="130" y="560" width="120" height="170" rx="8" fill="#9c7b5b"/><circle cx="190" cy="520" r="34" fill="#f3e3c3"/>`,
  (p) => `${shadowDef(p)}<rect width="${W}" height="${H}" fill="#e3dccf"/><rect width="${W}" height="${H}" fill="url(#lt)"/>
    <rect y="740" width="${W}" height="160" fill="#8f7a64"/>
    ${framed(160, 140, 300, 375, 'terraces', 111, p + 'a')}${framed(500, 200, 220, 275, 'botanical', 105, p + 'b')}
    <rect x="560" y="560" width="520" height="24" fill="#5b4636"/><rect x="590" y="584" width="16" height="160" fill="#4a3a2e"/><rect x="1040" y="584" width="16" height="160" fill="#4a3a2e"/>
    <rect x="760" y="440" width="190" height="120" rx="6" fill="#2a2a2a"/><rect x="845" y="560" width="20" height="10" fill="#2a2a2a"/>
    <rect x="640" y="600" width="140" height="200" rx="20" fill="#36424a"/>${plant(130, 680, 0.9)}`,
  (p) => `${shadowDef(p)}<rect width="${W}" height="${H}" fill="#cbbba3"/><rect width="${W}" height="${H}" fill="url(#lt)"/>
    <rect y="680" width="${W}" height="220" fill="#7a5f45"/>
    ${framed(450, 110, 300, 375, 'lotus', 104, p + 'a', '#3b2a1f')}
    <rect x="380" y="610" width="440" height="40" rx="6" fill="#4a3424"/><rect x="420" y="650" width="22" height="80" fill="#3b2a1f"/><rect x="758" y="650" width="22" height="80" fill="#3b2a1f"/>
    <ellipse cx="560" cy="600" rx="40" ry="26" fill="#d7c7a8"/><rect x="600" y="585" width="18" height="8" fill="#d7c7a8"/>
    <circle cx="660" cy="598" r="13" fill="#e9dcc2"/><circle cx="700" cy="598" r="13" fill="#e9dcc2"/>
    <ellipse cx="300" cy="760" rx="110" ry="26" fill="#a33c2f"/><ellipse cx="900" cy="760" rx="110" ry="26" fill="#a33c2f"/>`,
];
rooms.forEach((fn, i) => fs.writeFileSync(path.join(OUT, `room-0${i + 1}.svg`), svg(W, H, fn('r' + i))));

console.log('Đã tạo ảnh mẫu trong', OUT);
