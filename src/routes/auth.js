import express from 'express';
import * as store from '../store.js';
import { id, dayKey, todayStr } from '../util.js';

const router = express.Router();

function palette(seed) {
  const colors = ['#4a9eff', '#7c5cff', '#4ade80', '#f97316', '#ec4899', '#22d3ee', '#eab308'];
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return colors[h % colors.length];
}

function baseUser(fields) {
  return {
    id: id('u_'),
    discordId: null,
    username: 'User',
    avatar: null,
    color: '#4a9eff',
    isAdmin: false,
    banned: false,
    gensCount: 0,
    dailyDate: todayStr(),
    dailyCount: 0,
    lastGenAt: 0,
    cooldownSec: null, // LeakBySunah
    dayCounts: {},
    createdAt: Date.now(),
    ...fields,
  };
}

// LeakBySunah
function upsertDemo(marker, fields) {
  const db = store.get();
  let u = db.users.find((x) => x.discordId === marker);
  if (!u) {
    u = baseUser({ discordId: marker, ...fields });
    db.users.push(u);
    store.save();
  }
  return u;
}

export default function authRoutes() {
  // LeakBySunah
  router.post('/demo', (req, res) => {
    // LeakBySunah
    const seededDays = {};
    const vals = [0, 0, 0, 0, 59, 228, 222]; // LeakBySunah
    for (let i = 0; i < 7; i++) seededDays[dayKey(-(6 - i))] = vals[i];

    const u = upsertDemo('demo-user', {
      username: '/.User',
      color: '#4a9eff',
      dayCounts: seededDays,
      dailyCount: 1,
      dailyDate: todayStr(),
    });
    req.session.userId = u.id;
    res.json({ ok: true });
  });

  // LeakBySunah
  router.post('/demo-admin', (req, res) => {
    const u = upsertDemo('demo-admin', {
      username: 'Sunah_>',
      color: '#22c55e',
      isAdmin: true,
    });
    u.isAdmin = true; // LeakBySunah
    req.session.userId = u.id;
    store.save();
    res.json({ ok: true });
  });

  // LeakBySunah
  router.post('/logout', (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
  });

  // LeakBySunah
  router.get('/discord', (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirect = process.env.DISCORD_REDIRECT_URI;
    if (!clientId || !process.env.DISCORD_CLIENT_SECRET || !redirect) {
      return res.redirect('/?error=discord_not_configured');
    }
    const url = new URL('https://discord.com/api/oauth2/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirect);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'identify');
    res.redirect(url.toString());
  });

  router.get('/discord/callback', async (req, res) => {
    const code = req.query.code;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirect = process.env.DISCORD_REDIRECT_URI;
    if (!code || !clientId || !clientSecret || !redirect) {
      return res.redirect('/?error=discord_error');
    }
    try {
      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code: String(code),
          redirect_uri: redirect,
        }),
      });
      if (!tokenRes.ok) throw new Error('token exchange failed');
      const token = await tokenRes.json();

      const meRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `${token.token_type} ${token.access_token}` },
      });
      if (!meRes.ok) throw new Error('user fetch failed');
      const me = await meRes.json();

      const db = store.get();
      const admins = (process.env.ADMIN_DISCORD_IDS || '')
        .split(',').map((s) => s.trim()).filter(Boolean);
      let u = db.users.find((x) => x.discordId === me.id);
      const avatar = me.avatar
        ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png`
        : null;
      if (!u) {
        u = baseUser({
          discordId: me.id,
          username: me.global_name || me.username,
          avatar,
          color: palette(me.id),
          isAdmin: admins.includes(me.id),
        });
        db.users.push(u);
      } else {
        u.username = me.global_name || me.username;
        u.avatar = avatar;
        if (admins.includes(me.id)) u.isAdmin = true;
      }
      store.save();
      req.session.userId = u.id;
      res.redirect('/');
    } catch (err) {
      console.error('[discord]', err.message);
      res.redirect('/?error=discord_error');
    }
  });

  return router;
}
