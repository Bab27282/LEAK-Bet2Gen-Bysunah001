import express from 'express';
import * as store from '../store.js';
import { requireAuth, currentUser, todayStr, dayKey } from '../util.js';

const router = express.Router();

const WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function isReal(u) {
  return !u.discordId || !String(u.discordId).startsWith('demo-');
}

function stats() {
  const db = store.get();
  const realUsers = db.users.filter(isReal).length;
  return {
    users: db.settings.baseUsers + realUsers,
    services: db.services.length,
    generated: db.settings.baseGenerated + db.generations.length,
  };
}

function serviceView(s) {
  const codesLeft = s.stock.length;
  let displayStatus;
  if (s.status === 'disabled') displayStatus = 'disabled';
  else if (s.status === 'awaiting_restock') displayStatus = 'awaiting_restock';
  else if (codesLeft === 0) displayStatus = 'out_of_stock';
  else displayStatus = 'in_stock';
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    color: s.color,
    logo: s.logo || '',
    codesLeft,
    displayStatus,
    generatedCount: s.generatedCount || 0,
  };
}

function cooldownSecFor(user, db) {
  return user.cooldownSec != null ? user.cooldownSec : db.settings.defaultCooldownSec;
}

function rollDaily(user) {
  const today = todayStr();
  if (user.dailyDate !== today) {
    user.dailyDate = today;
    user.dailyCount = 0;
  }
}

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    avatar: u.avatar || null,
    color: u.color || '#4a9eff',
    isAdmin: !!u.isAdmin,
  };
}

export default function apiRoutes() {
  // LeakBySunah
  router.get('/me', (req, res) => {
    const u = currentUser(store, req);
    res.json({
      user: u ? publicUser(u) : null,
      stats: stats(),
      discordInvite: store.get().settings.discord.inviteUrl || '',
    });
  });

  router.get('/stats', (req, res) => res.json(stats()));

  // LeakBySunah
  router.get('/services', (req, res) => {
    const db = store.get();
    const list = [...db.services].sort((a, b) => a.order - b.order).map(serviceView);
    res.json({ services: list });
  });

  // LeakBySunah
  router.get('/hub', requireAuth, (req, res) => {
    const db = store.get();
    const u = currentUser(store, req);
    rollDaily(u);
    store.save();

    const cd = cooldownSecFor(u, db);
    const remaining = Math.max(0, cd * 1000 - (Date.now() - (u.lastGenAt || 0)));

    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const key = dayKey(-i);
      const d = new Date(key + 'T00:00:00');
      last7.push({ label: WEEK[d.getDay()], count: u.dayCounts[key] || 0 });
    }

    res.json({
      day: { used: u.dailyCount, limit: db.settings.dailyLimit },
      cooldownSec: cd,
      cooldownRemainingSec: Math.ceil(remaining / 1000),
      last7,
      discordInvite: db.settings.discord.inviteUrl || '',
    });
  });

  // LeakBySunah
  router.post('/generate', requireAuth, (req, res) => {
    const db = store.get();
    const u = currentUser(store, req);
    if (u.banned) return res.status(403).json({ error: 'banned' });

    const svc = db.services.find((s) => s.id === req.body.serviceId);
    if (!svc) return res.status(404).json({ error: 'service_not_found' });
    if (svc.status === 'disabled') return res.status(400).json({ error: 'disabled' });
    if (svc.status === 'awaiting_restock') return res.status(400).json({ error: 'awaiting_restock' });
    if (svc.stock.length === 0) return res.status(400).json({ error: 'out_of_stock' });

    rollDaily(u);
    if (u.dailyCount >= db.settings.dailyLimit) {
      return res.status(429).json({ error: 'daily_limit', limit: db.settings.dailyLimit });
    }

    const cd = cooldownSecFor(u, db);
    const elapsed = Date.now() - (u.lastGenAt || 0);
    if (elapsed < cd * 1000) {
      return res.status(429).json({
        error: 'cooldown',
        remainingSec: Math.ceil((cd * 1000 - elapsed) / 1000),
      });
    }

    // LeakBySunah
    const entry = svc.stock.shift();
    svc.generatedCount = (svc.generatedCount || 0) + 1;

    const now = Date.now();
    const today = todayStr();
    u.gensCount += 1;
    u.dailyCount += 1;
    u.dayCounts[today] = (u.dayCounts[today] || 0) + 1;
    u.lastGenAt = now;

    const gen = {
      id: 'g_' + now.toString(36) + Math.random().toString(36).slice(2, 6),
      userId: u.id,
      serviceId: svc.id,
      serviceName: svc.name,
      code: entry.code,
      at: now,
    };
    db.generations.push(gen);
    store.save();

    res.json({
      ok: true,
      code: entry.code,
      serviceName: svc.name,
      color: svc.color,
      at: now,
      day: { used: u.dailyCount, limit: db.settings.dailyLimit },
    });
  });

  // LeakBySunah
  router.get('/history', requireAuth, (req, res) => {
    const db = store.get();
    const u = currentUser(store, req);
    const items = db.generations
      .filter((g) => g.userId === u.id)
      .sort((a, b) => b.at - a.at)
      .map((g) => ({ serviceName: g.serviceName, code: g.code, at: g.at }));
    res.json({ items });
  });

  // LeakBySunah
  router.get('/ranking', (req, res) => {
    const db = store.get();
    const real = db.users
      .filter((u) => isReal(u) && u.gensCount > 0)
      .map((u) => ({ username: u.username, gens: u.gensCount, color: u.color, avatar: u.avatar || null }));
    const seed = db.rankSeed.map((r) => ({ username: r.username, gens: r.gens, color: r.color, avatar: null }));
    const all = [...seed, ...real].sort((a, b) => b.gens - a.gens).slice(0, 50)
      .map((r, i) => ({ rank: i + 1, ...r }));
    res.json({ ranking: all });
  });

  return router;
}
