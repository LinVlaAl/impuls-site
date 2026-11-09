/* Импульс — сервер данных: цены, сроки, статистика и журнал посещений (IP)
 * Запуск:  node impulse-server.js
 * Порт по умолчанию 8082 (переменная PORT). Файл журнала — visits.json рядом со скриптом.
 * Код доступа к записи/журналу — переменная ADMIN_PW (по умолчанию 4061), смените её!
 * Зависимостей нет — чистый Node.js.
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '8082', 10);
const ADMIN_PW = process.env.ADMIN_PW || '4061';
const DATA_FILE = path.join(__dirname, 'visits.json');
const MAX_LOG = 50000; // храним не больше записей, чтобы файл не рос бесконечно

/* ---------- хранилище ---------- */
let data = { prices: {}, optPrices: {}, stock: {}, news: { text: '', until: '' }, visits: [], models: {}, booklets: 0 };
try { data = Object.assign(data, JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))); } catch (e) { /* первый запуск */ }
if (!Array.isArray(data.visits)) data.visits = [];

function save() {
  try {
    if (data.visits.length > MAX_LOG) data.visits = data.visits.slice(-MAX_LOG);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
  } catch (e) { console.error('save:', e.message); }
}

/* ---------- ответ ---------- */
function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}
function readBody(req) {
  return new Promise(function (res) {
    let s = '';
    req.on('data', function (c) { s += c; if (s.length > 1e6) req.destroy(); });
    req.on('end', function () { try { res(JSON.parse(s || '{}')); } catch (e) { res({}); } });
    req.on('error', function () { res({}); });
  });
}
function clientIP(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf) return String(xf).split(',')[0].trim();          // за nginx / прокси
  return (req.socket && req.socket.remoteAddress) || '';    // напрямую
}

/* ---------- сервер ---------- */
const srv = http.createServer(async function (req, res) {
  const url = (req.url || '').split('?')[0];

  if (req.method === 'OPTIONS') return send(res, 204, {});

  /* GET /api/all — отдаём цены/сроки/новость всем (без секретов) */
  if (req.method === 'GET' && url === '/api/all') {
    return send(res, 200, { prices: data.prices, optPrices: data.optPrices, stock: data.stock, news: data.news });
  }

  /* POST /api/all — сохранить цены/сроки/новость (код доступа) */
  if (req.method === 'POST' && url === '/api/all') {
    const b = await readBody(req);
    if (b.pw !== ADMIN_PW) return send(res, 403, { ok: false, error: 'Код неверный.' });
    if (b.prices && typeof b.prices === 'object') data.prices = b.prices;
    if (b.optPrices && typeof b.optPrices === 'object') data.optPrices = b.optPrices;
    if (b.stock && typeof b.stock === 'object') data.stock = b.stock;
    if (b.news && typeof b.news === 'object') data.news = b.news;
    save();
    return send(res, 200, { ok: true });
  }

  /* POST /api/track — событие (visit, booklet, export…); IP пишем здесь */
  if (req.method === 'POST' && url === '/api/track') {
    const b = await readBody(req);
    const ev = String(b.ev || 'visit').slice(0, 32);
    const rec = {
      ts: Date.now(),
      ip: clientIP(req),
      ev: ev,
      model: String(b.model || '').slice(0, 64),
      page: String(b.page || '').slice(0, 128),
      ua: String(req.headers['user-agent'] || '').slice(0, 200)
    };
    data.visits.push(rec);
    if (ev === 'visit') data.visitsCount = (data.visitsCount || 0) + 1;
    if (ev === 'booklet') data.booklets = (data.booklets || 0) + 1;
    if (ev !== 'visit') data.models = data.models || {}, data.models[rec.model] = (data.models[rec.model] || 0) + 1;
    save();
    return send(res, 200, { ok: true });
  }

  /* GET /api/stats — агрегаты (без IP — публично) */
  if (req.method === 'GET' && url === '/api/stats') {
    return send(res, 200, { visits: data.visitsCount || data.visits.filter(function (v) { return v.ev === 'visit'; }).length, booklets: data.booklets || 0, models: data.models || {} });
  }

  /* POST /api/visits — журнал посещений с IP (код доступа) */
  if (req.method === 'POST' && url === '/api/visits') {
    const b = await readBody(req);
    if (b.pw !== ADMIN_PW) return send(res, 403, { ok: false, error: 'Код неверный.' });
    const limit = Math.max(1, Math.min(parseInt(b.limit || '300', 10) || 300, 5000));
    const list = data.visits.slice(-limit).reverse();
    return send(res, 200, { ok: true, total: data.visits.length, visits: list });
  }

  send(res, 404, { error: 'not found' });
});

srv.listen(PORT, function () {
  console.log('Сервер данных «Импульс» слушает порт ' + PORT);
  console.log('Журнал посещений: ' + DATA_FILE);
  console.log('Код доступа: ' + (process.env.ADMIN_PW ? 'задан через переменную ADMIN_PW' : 'по умолчанию 4061 — СМЕНИТЕ ЕГО!'));
});
