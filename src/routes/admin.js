import express from 'express';
import * as store from '../store.js';
import { requireAdmin, id } from '../util.js';

const router = express.Router();

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function toCsv(rows) {
  return rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
}

export default function adminRoutes() {
  router.use(requireAdmin(store));

  // LeakBySunah
  router.get('/users', (req, res) => {
    const db = store.get();
    const q = (req.query.q || '').toString().toLowerCase().trim();
    const filter = (req.query.filter || 'all').toString();
    let list = db.users.slice();
    if (filter === 'active') list = list.filter((u) => !u.banned);
    if (filter === 'banned') list = list.filter((u) => u.banned);
    if (q) list = list.filter((u) =>
      u.username.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.discordId || '').toLowerCase().includes(q));
    list = list.sort((a, b) => b.gensCount - a.gensCount).map((u) => ({
      id: u.id,
      username: u.username,
      avatar: u.avatar || null,
      color: u.color || '#4a9eff',
      discordId: u.discordId || null,
      isAdmin: !!u.isAdmin,
      banned: !!u.banned,
      gensCount: u.gensCount,
      dailyCount: u.dailyCount,
      cooldownSec: u.cooldownSec,
      createdAt: u.createdAt,
    }));
    res.json({ users: list, defaultCooldownSec: db.settings.defaultCooldownSec });
  });

  function findUser(req, res) {
    const u = store.get().users.find((x) => x.id === req.params.id);
    if (!u) { res.status(404).json({ error: 'user_not_found' }); return null; }
    return u;
  }

  router.post('/users/:id/ban', (req, res) => {
    const u = findUser(req, res); if (!u) return;
    u.banned = true; store.save(); res.json({ ok: true });
  });
  router.post('/users/:id/unban', (req, res) => {
    const u = findUser(req, res); if (!u) return;
    u.banned = false; store.save(); res.json({ ok: true });
  });
  router.post('/users/:id/admin', (req, res) => {
    const u = findUser(req, res); if (!u) return;
    u.isAdmin = !!req.body.value; store.save(); res.json({ ok: true });
  });
  router.post('/users/:id/cooldown', (req, res) => {
    const u = findUser(req, res); if (!u) return;
    const s = req.body.seconds;
    u.cooldownSec = (s === null || s === '' || s === undefined) ? null : Math.max(0, parseInt(s, 10) || 0);
    store.save(); res.json({ ok: true, cooldownSec: u.cooldownSec });
  });
  router.delete('/users/:id', (req, res) => {
    const db = store.get();
    const i = db.users.findIndex((x) => x.id === req.params.id);
    if (i === -1) return res.status(404).json({ error: 'user_not_found' });
    db.users.splice(i, 1);
    store.save(); res.json({ ok: true });
  });

  // LeakBySunah
  router.get('/services', (req, res) => {
    const db = store.get();
    const list = [...db.services].sort((a, b) => a.order - b.order).map((s) => ({
      id: s.id, name: s.name, slug: s.slug, color: s.color, logo: s.logo || '',
      status: s.status, order: s.order,
      codesLeft: s.stock.length, generatedCount: s.generatedCount || 0,
    }));
    res.json({ services: list });
  });

  router.post('/services', (req, res) => {
    const db = store.get();
    const { name, color, status, logo } = req.body;
    if (!name) return res.status(400).json({ error: 'name_required' });
    const svc = {
      id: id('s_'),
      order: db.services.length,
      name: String(name).trim(),
      slug: String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      color: color || '#4a9eff',
      logo: logo ? String(logo).trim() : '',
      status: ['active', 'awaiting_restock', 'disabled'].includes(status) ? status : 'active',
      stock: [], generatedCount: 0, createdAt: Date.now(),
    };
    db.services.push(svc);
    store.save();
    res.json({ ok: true, id: svc.id });
  });

  router.put('/services/:id', (req, res) => {
    const svc = store.get().services.find((s) => s.id === req.params.id);
    if (!svc) return res.status(404).json({ error: 'service_not_found' });
    const { name, color, status, order, logo } = req.body;
    if (name != null) svc.name = String(name).trim();
    if (color != null) svc.color = color;
    if (logo != null) svc.logo = String(logo).trim();
    if (status != null && ['active', 'awaiting_restock', 'disabled'].includes(status)) svc.status = status;
    if (order != null) svc.order = parseInt(order, 10) || 0;
    store.save();
    res.json({ ok: true });
  });

  router.post('/services/:id/codes', (req, res) => {
    const svc = store.get().services.find((s) => s.id === req.params.id);
    if (!svc) return res.status(404).json({ error: 'service_not_found' });
    const raw = String(req.body.codes || '');
    const parts = raw.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
    const existing = new Set(svc.stock.map((c) => c.code));
    let added = 0;
    for (const code of parts) {
      if (existing.has(code)) continue;
      existing.add(code);
      svc.stock.push({ id: id('c_'), code, addedAt: Date.now() });
      added++;
    }
    store.save();
    res.json({ ok: true, added, total: svc.stock.length });
  });

  router.delete('/services/:id/codes', (req, res) => {
    const svc = store.get().services.find((s) => s.id === req.params.id);
    if (!svc) return res.status(404).json({ error: 'service_not_found' });
    const cleared = svc.stock.length;
    svc.stock = [];
    store.save();
    res.json({ ok: true, cleared });
  });

  router.delete('/services/:id', (req, res) => {
    const db = store.get();
    const i = db.services.findIndex((s) => s.id === req.params.id);
    if (i === -1) return res.status(404).json({ error: 'service_not_found' });
    db.services.splice(i, 1);
    store.save();
    res.json({ ok: true });
  });

  // LeakBySunah
  router.get('/settings', (req, res) => {
    const s = store.get().settings;
    res.json({
      dailyLimit: s.dailyLimit,
      defaultCooldownSec: s.defaultCooldownSec,
      baseUsers: s.baseUsers,
      baseGenerated: s.baseGenerated,
    });
  });
  router.post('/settings', (req, res) => {
    const s = store.get().settings;
    const { dailyLimit, defaultCooldownSec, baseUsers, baseGenerated } = req.body;
    if (dailyLimit != null) s.dailyLimit = Math.max(0, parseInt(dailyLimit, 10) || 0);
    if (defaultCooldownSec != null) s.defaultCooldownSec = Math.max(0, parseInt(defaultCooldownSec, 10) || 0);
    if (baseUsers != null) s.baseUsers = Math.max(0, parseInt(baseUsers, 10) || 0);
    if (baseGenerated != null) s.baseGenerated = Math.max(0, parseInt(baseGenerated, 10) || 0);
    store.save();
    res.json({ ok: true });
  });

  // LeakBySunah
  router.get('/discord', (req, res) => {
    const d = store.get().settings.discord;
    res.json({
      inviteUrl: d.inviteUrl || '',
      webhookUrl: d.webhookUrl || '',
      oauthConfigured: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
      clientId: process.env.DISCORD_CLIENT_ID || '',
    });
  });
  router.post('/discord', (req, res) => {
    const d = store.get().settings.discord;
    if (req.body.inviteUrl != null) d.inviteUrl = String(req.body.inviteUrl).trim();
    if (req.body.webhookUrl != null) d.webhookUrl = String(req.body.webhookUrl).trim();
    store.save();
    res.json({ ok: true });
  });

  // LeakBySunah
  function sendCsv(res, filename, rows) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('﻿' + toCsv(rows));
  }

  router.get('/export/users.csv', (req, res) => {
    const db = store.get();
    const rows = [['id', 'username', 'discordId', 'isAdmin', 'banned', 'gensCount', 'createdAt']];
    for (const u of db.users)
      rows.push([u.id, u.username, u.discordId || '', u.isAdmin, u.banned, u.gensCount, new Date(u.createdAt).toISOString()]);
    sendCsv(res, 'users.csv', rows);
  });

  router.get('/export/generations.csv', (req, res) => {
    const db = store.get();
    const rows = [['id', 'userId', 'service', 'code', 'at']];
    for (const g of db.generations)
      rows.push([g.id, g.userId, g.serviceName, g.code, new Date(g.at).toISOString()]);
    sendCsv(res, 'generations.csv', rows);
  });

  router.get('/export/stock.csv', (req, res) => {
    const db = store.get();
    const rows = [['service', 'codesLeft', 'status', 'generatedCount']];
    for (const s of db.services)
      rows.push([s.name, s.stock.length, s.status, s.generatedCount || 0]);
    sendCsv(res, 'stock.csv', rows);
  });

  return router;
}
