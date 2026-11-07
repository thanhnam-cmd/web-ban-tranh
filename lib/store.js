/**
 * Lớp lưu trữ dữ liệu.
 * - Có biến môi trường MONGODB_URI  -> lưu vào MongoDB (khuyên dùng khi deploy Render, dữ liệu & ảnh không bị mất).
 * - Không có                         -> lưu file JSON + thư mục uploads trong DATA_DIR (tiện chạy trên máy).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { defaultSite, defaultProducts } = require('./defaults');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const newId = () => crypto.randomBytes(8).toString('hex');

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
/** Gộp nội dung đã lưu với mặc định để các trường mới luôn tồn tại. */
function mergeDefaults(def, saved) {
  if (!isObj(def) || !isObj(saved)) return saved === undefined ? def : saved;
  const out = { ...def };
  for (const k of Object.keys(saved)) out[k] = k in def ? mergeDefaults(def[k], saved[k]) : saved[k];
  return out;
}

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/avif': '.avif' };

class FileStore {
  constructor() { this.kind = 'file'; }
  async init() {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    this.file = path.join(DATA_DIR, 'db.json');
    if (fs.existsSync(this.file)) {
      this.db = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } else {
      this.db = { site: defaultSite(), products: defaultProducts(), orders: [] };
      this.flush();
    }
  }
  flush() {
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.db, null, 2));
    fs.renameSync(tmp, this.file);
  }
  async getSite() { return mergeDefaults(defaultSite(), this.db.site || {}); }
  async saveSite(site) { this.db.site = site; this.flush(); return site; }
  async listProducts() { return [...(this.db.products || [])]; }
  async upsertProduct(p) {
    const i = this.db.products.findIndex((x) => x.id === p.id);
    if (i >= 0) this.db.products[i] = p; else this.db.products.push(p);
    this.flush(); return p;
  }
  async deleteProduct(id) { this.db.products = this.db.products.filter((x) => x.id !== id); this.flush(); }
  async listOrders() { return [...(this.db.orders || [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  async addOrder(o) { this.db.orders.push(o); this.flush(); return o; }
  async updateOrder(id, patch) {
    const o = this.db.orders.find((x) => x.id === id); if (!o) return null;
    Object.assign(o, patch); this.flush(); return o;
  }
  async deleteOrder(id) { this.db.orders = this.db.orders.filter((x) => x.id !== id); this.flush(); }
  async replaceAll(data) {
    this.db = { site: data.site || defaultSite(), products: data.products || [], orders: data.orders || [] };
    this.flush();
  }
  async saveImage(buf, mime) {
    const name = newId() + (EXT[mime] || '.bin');
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
    return '/uploads/' + name;
  }
  async getImage() { return null; }
}

class MongoStore {
  constructor(uri) { this.kind = 'mongodb'; this.uri = uri; }
  async init() {
    const { MongoClient } = require('mongodb');
    this.client = new MongoClient(this.uri);
    await this.client.connect();
    const db = this.client.db(process.env.MONGODB_DB || 'tranh_shop');
    this.kv = db.collection('kv');
    this.products = db.collection('products');
    this.orders = db.collection('orders');
    this.images = db.collection('images');
    const site = await this.kv.findOne({ _id: 'site' });
    if (!site) {
      await this.kv.insertOne({ _id: 'site', data: defaultSite() });
      if ((await this.products.countDocuments()) === 0) {
        await this.products.insertMany(defaultProducts().map((p) => ({ _id: p.id, ...p })));
      }
    }
  }
  strip(doc) { if (!doc) return doc; const { _id, ...rest } = doc; return rest; }
  async getSite() { const d = await this.kv.findOne({ _id: 'site' }); return mergeDefaults(defaultSite(), d ? d.data : {}); }
  async saveSite(site) { await this.kv.updateOne({ _id: 'site' }, { $set: { data: site } }, { upsert: true }); return site; }
  async listProducts() { return (await this.products.find().toArray()).map((d) => this.strip(d)); }
  async upsertProduct(p) { await this.products.replaceOne({ _id: p.id }, { _id: p.id, ...p }, { upsert: true }); return p; }
  async deleteProduct(id) { await this.products.deleteOne({ _id: id }); }
  async listOrders() { return (await this.orders.find().sort({ createdAt: -1 }).toArray()).map((d) => this.strip(d)); }
  async addOrder(o) { await this.orders.insertOne({ _id: o.id, ...o }); return o; }
  async updateOrder(id, patch) {
    await this.orders.updateOne({ _id: id }, { $set: patch });
    return this.strip(await this.orders.findOne({ _id: id }));
  }
  async deleteOrder(id) { await this.orders.deleteOne({ _id: id }); }
  async replaceAll(data) {
    await this.saveSite(data.site || defaultSite());
    await this.products.deleteMany({});
    if (data.products && data.products.length) await this.products.insertMany(data.products.map((p) => ({ _id: p.id, ...p })));
    await this.orders.deleteMany({});
    if (data.orders && data.orders.length) await this.orders.insertMany(data.orders.map((o) => ({ _id: o.id, ...o })));
  }
  async saveImage(buf, mime) {
    const id = newId();
    await this.images.insertOne({ _id: id, mime, data: buf, createdAt: new Date() });
    return '/img/' + id;
  }
  async getImage(id) { return this.images.findOne({ _id: id }); }
}

module.exports = {
  newId,
  UPLOAD_DIR,
  create() { return process.env.MONGODB_URI ? new MongoStore(process.env.MONGODB_URI) : new FileStore(); },
};
