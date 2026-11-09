const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const storeLib = require('./lib/store');

const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SECRET = process.env.SESSION_SECRET || crypto.createHash('sha256').update('mh-session:' + ADMIN_PASSWORD).digest('hex');
const SESSION_DAYS = 7;
// mã phiên bản để trình duyệt tải lại CSS/JS sau mỗi lần deploy
const VERSION = String(process.env.RENDER_GIT_COMMIT || Date.now().toString(36)).slice(0, 10);

const store = storeLib.create();
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '3mb' }));
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  next();
});

/* ---------------- tiện ích ---------------- */
const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sortProducts = (list) => list.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

function rateLimiter(max, windowMs) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const rec = hits.get(key) || { n: 0, reset: now + windowMs };
    if (now > rec.reset) { rec.n = 0; rec.reset = now + windowMs; }
    rec.n++;
    hits.set(key, rec);
    if (hits.size > 5000) hits.clear();
    if (rec.n > max) return res.status(429).json({ error: 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.' });
    next();
  };
}

/* ---------------- xác thực quản trị ---------------- */
const hmac = (v) => crypto.createHmac('sha256', SECRET).update(String(v)).digest('hex');
const signToken = (exp) => exp + '.' + hmac(exp);
function verifyToken(tok) {
  if (!tok || typeof tok !== 'string') return false;
  const [exp, sig] = tok.split('.');
  if (!exp || !sig) return false;
  const good = hmac(exp);
  if (sig.length !== good.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good)) && Number(exp) > Date.now();
}
function readCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function requireAdmin(req, res, next) {
  if (!verifyToken(readCookies(req).adm)) return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn.' });
  // chống CSRF: mọi request thay đổi dữ liệu phải có header tuỳ chỉnh (trình duyệt không gửi được từ site khác)
  if (req.method !== 'GET' && req.get('x-admin') !== '1') return res.status(403).json({ error: 'Forbidden' });
  next();
}
const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

/* ---------------- chuẩn hoá dữ liệu ---------------- */
function cleanProduct(b, id) {
  const sizes = (Array.isArray(b.sizes) ? b.sizes : [])
    .map((s) => ({
      label: str(s.label, 60),
      price: Math.max(0, Math.round(Number(s.price) || 0)),
      salePrice: Math.max(0, Math.round(Number(s.salePrice) || 0)),
    }))
    .filter((s) => s.label && (s.price || s.salePrice))
    .slice(0, 12);
  return {
    id,
    code: str(b.code, 30),
    name: str(b.name, 150) || 'Tác phẩm chưa đặt tên',
    category: str(b.category, 60),
    short: str(b.short, 300),
    description: str(b.description, 5000),
    images: (Array.isArray(b.images) ? b.images : []).map((u) => str(u, 500)).filter(Boolean).slice(0, 12),
    video: str(b.video, 500),
    sizes,
    badge: str(b.badge, 30),
    featured: !!b.featured,
    visible: b.visible !== false,
    sort: Number(b.sort) || 0,
  };
}
const priceOf = (s) => (s.salePrice && s.salePrice < s.price ? s.salePrice : s.price || s.salePrice);

/* ---------------- API công khai ---------------- */
app.get('/api/site', async (req, res) => res.json(await store.getSite()));
app.get('/api/products', async (req, res) => {
  res.json(sortProducts((await store.listProducts()).filter((p) => p.visible !== false)));
});

app.post('/api/orders', rateLimiter(8, 10 * 60 * 1000), async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true, code: 'DH000000' }); // bẫy bot
  const name = str(b.name, 100);
  const phone = str(b.phone, 20).replace(/[\s.\-()]/g, '');
  const address = str(b.address, 300);
  const note = str(b.note, 1000);
  if (!name) return res.status(400).json({ error: 'Vui lòng nhập họ tên.' });
  if (!/^(\+?84|0)\d{8,10}$/.test(phone)) return res.status(400).json({ error: 'Số điện thoại chưa đúng.' });
  if (!address) return res.status(400).json({ error: 'Vui lòng nhập địa chỉ nhận hàng.' });

  const products = await store.listProducts();
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 30).map((it) => {
    const p = products.find((x) => x.id === it.productId && x.visible !== false);
    if (!p) return null;
    const s = p.sizes.find((x) => x.label === it.size) || p.sizes[0];
    if (!s) return null;
    const qty = Math.min(50, Math.max(1, parseInt(it.qty, 10) || 1));
    const price = priceOf(s);
    return { productId: p.id, code: p.code, name: p.name, size: s.label, price, qty, image: p.images[0] || '' };
  }).filter(Boolean);
  if (!items.length) return res.status(400).json({ error: 'Vui lòng chọn ít nhất một mẫu tranh.' });

  const d = new Date();
  const code = 'DH' + d.toISOString().slice(2, 10).replace(/-/g, '') + crypto.randomInt(1000, 9999);
  const order = {
    id: storeLib.newId(),
    code,
    createdAt: d.toISOString(),
    name, phone, address, note,
    items,
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
    status: 'new',
    adminNote: '',
  };
  await store.addOrder(order);
  res.json({ ok: true, code });
});

/* ---------------- API quản trị ---------------- */
app.post('/api/admin/login', rateLimiter(10, 15 * 60 * 1000), (req, res) => {
  const pw = str((req.body || {}).password, 200);
  if (!pw || !safeEqual(pw, ADMIN_PASSWORD)) return res.status(401).json({ error: 'Mật khẩu không đúng.' });
  const exp = Date.now() + SESSION_DAYS * 864e5;
  res.set('Set-Cookie', `adm=${encodeURIComponent(signToken(exp))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${IS_PROD || req.secure ? '; Secure' : ''}`);
  res.json({ ok: true });
});
app.post('/api/admin/logout', (req, res) => {
  res.set('Set-Cookie', 'adm=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  res.json({ ok: true });
});
app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ ok: true, storage: store.kind, defaultPassword: !process.env.ADMIN_PASSWORD });
});

app.get('/api/admin/site', requireAdmin, async (req, res) => res.json(await store.getSite()));
app.put('/api/admin/site', requireAdmin, async (req, res) => {
  const site = req.body;
  if (!site || typeof site !== 'object' || Array.isArray(site)) return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  res.json(await store.saveSite(site));
});

app.get('/api/admin/products', requireAdmin, async (req, res) => res.json(sortProducts(await store.listProducts())));
app.post('/api/admin/products', requireAdmin, async (req, res) => {
  res.json(await store.upsertProduct(cleanProduct(req.body || {}, storeLib.newId())));
});
app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  res.json(await store.upsertProduct(cleanProduct(req.body || {}, req.params.id)));
});
app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  await store.deleteProduct(req.params.id);
  res.json({ ok: true });
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => res.json(await store.listOrders()));
app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const patch = {};
  const STATUSES = ['new', 'confirmed', 'shipping', 'done', 'cancelled'];
  if (STATUSES.includes(req.body.status)) patch.status = req.body.status;
  if (typeof req.body.adminNote === 'string') patch.adminNote = str(req.body.adminNote, 2000);
  const o = await store.updateOrder(req.params.id, patch);
  if (!o) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
  res.json(o);
});
app.delete('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  await store.deleteOrder(req.params.id);
  res.json({ ok: true });
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)),
});
app.post('/api/admin/upload', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF (tối đa 10MB).' });
  res.json({ url: await store.saveImage(req.file.buffer, req.file.mimetype) });
});

const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^audio\/(mpeg|mp3|mp4|x-m4a|aac|ogg|wav|x-wav)$/.test(file.mimetype)),
});
app.post('/api/admin/upload-audio', requireAdmin, uploadAudio.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Chỉ chấp nhận file nhạc MP3, M4A, AAC, OGG, WAV (tối đa 15MB).' });
  res.json({ url: await store.saveImage(req.file.buffer, req.file.mimetype) });
});

app.get('/api/admin/export', requireAdmin, async (req, res) => {
  res.set('Content-Disposition', `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json({ site: await store.getSite(), products: await store.listProducts(), orders: await store.listOrders() });
});
app.post('/api/admin/import', requireAdmin, express.json({ limit: '20mb' }), async (req, res) => {
  const d = req.body || {};
  if (!d.site || !Array.isArray(d.products)) return res.status(400).json({ error: 'File sao lưu không hợp lệ' });
  await store.replaceAll({ site: d.site, products: d.products.map((p) => cleanProduct(p, p.id || storeLib.newId())), orders: Array.isArray(d.orders) ? d.orders : [] });
  res.json({ ok: true });
});

/* ---------------- ảnh tải lên ---------------- */
app.use('/uploads', express.static(storeLib.UPLOAD_DIR, { maxAge: '30d', immutable: true }));
app.get('/img/:id', async (req, res) => {
  const img = await store.getImage(req.params.id);
  if (!img) return res.status(404).end();
  const buf = img.data.buffer ? Buffer.from(img.data.buffer) : img.data;
  res.set('Content-Type', img.mime);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.set('Accept-Ranges', 'bytes');
  // Safari cần trả từng đoạn (Range) mới phát được file nhạc
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (m && (m[1] || m[2])) {
    let start = m[1] ? +m[1] : buf.length - +m[2];
    let end = m[1] && m[2] ? +m[2] : buf.length - 1;
    if (start < 0) start = 0;
    if (start >= buf.length || end < start) { res.set('Content-Range', `bytes */${buf.length}`); return res.status(416).end(); }
    end = Math.min(end, buf.length - 1);
    res.status(206).set('Content-Range', `bytes ${start}-${end}/${buf.length}`);
    return res.send(buf.subarray(start, end + 1));
  }
  res.send(buf);
});

/* ---------------- trang ---------------- */
const TEMPLATE_PATH = path.join(__dirname, 'views', 'index.html');
let templateCache = null;
const getTemplate = () => (IS_PROD && templateCache) || (templateCache = fs.readFileSync(TEMPLATE_PATH, 'utf8'));

app.get('/', async (req, res, next) => {
  try {
    const [site, products] = await Promise.all([store.getSite(), store.listProducts()]);
    const visible = sortProducts(products.filter((p) => p.visible !== false));
    const abs = (u) => (u && u.startsWith('/') ? `${req.protocol}://${req.get('host')}${u}` : u || '');
    const data = JSON.stringify({ site, products: visible }).replace(/</g, '\\u003c');
    const html = getTemplate()
      .replace(/%%TITLE%%/g, esc(site.seo.title || site.brand.name))
      .replace(/%%DESC%%/g, esc(site.seo.description))
      .replace(/%%OG%%/g, esc(abs(site.seo.ogImage)))
      .replace(/%%ACCENT%%/g, esc(/^#[0-9a-f]{3,8}$/i.test(site.theme.accent) ? site.theme.accent : '#c4553a'))
      .replace(/%%VER%%/g, VERSION)
      .replace('%%DATA%%', data);
    res.set('Cache-Control', 'no-cache');
    res.type('html').send(html);
  } catch (e) { next(e); }
});
const ADMIN_HTML = fs.readFileSync(path.join(__dirname, 'public', 'admin', 'index.html'), 'utf8').replace(/%%VER%%/g, VERSION);
app.get(['/admin', '/admin/'], (req, res) => { res.set('Cache-Control', 'no-cache'); res.type('html').send(ADMIN_HTML); });
app.use(express.static(path.join(__dirname, 'public'), { maxAge: IS_PROD ? '1d' : 0, index: false }));
app.get('/healthz', (req, res) => res.send('ok'));

app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api/')) return res.status(500).json({ error: 'Lỗi máy chủ, vui lòng thử lại.' });
  res.status(500).send('Lỗi máy chủ');
});

store.init().then(() => {
  app.listen(PORT, () => {
    console.log(`▶ Website đang chạy: http://localhost:${PORT}`);
    console.log(`▶ Trang quản trị:   http://localhost:${PORT}/admin  (lưu trữ: ${store.kind})`);
    if (!process.env.ADMIN_PASSWORD) console.log('⚠ Đang dùng mật khẩu mặc định "admin123" – đặt biến ADMIN_PASSWORD khi deploy!');
  });
}).catch((e) => {
  console.error('Không khởi tạo được bộ lưu trữ:', e);
  process.exit(1);
});
