'use strict';

// LeakBySunah
const App = {
  me: null,
  stats: { users: 0, services: 0, generated: 0 },
  discordInvite: '',
  view: 'hub',
  adminTab: 'users',
  adminUserFilter: 'all',
  adminUserQuery: '',
  menuOpen: false,
};

// LeakBySunah
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function api(method, path, body) {
  const opts = { method, headers: {}, credentials: 'same-origin' };
  if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  const r = await fetch(path, opts);
  let data = {};
  try { data = await r.json(); } catch {}
  return { ok: r.ok, status: r.status, data };
}

function fmtCooldown(sec) {
  if (sec <= 0) return '0s';
  if (sec >= 60) return Math.floor(sec / 60) + ' min';
  return sec + 's';
}
function fmtRemaining(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return m > 0 ? `${m} min ${s}s` : `${s}s`;
}
function initial(name) {
  const ch = Array.from(String(name || '?').trim())[0] || '?';
  return ch.toUpperCase();
}
function avatarHtml(name, color, url, cls = 'avatar') {
  if (url) return `<img class="${cls}" src="${esc(url)}" alt="" />`;
  return `<div class="${cls}" style="background:${esc(color || '#4a9eff')}">${esc(initial(name))}</div>`;
}

// LeakBySunah
const ICON = {
  discord: (s = 20) => `<svg class="ico-svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.6 12.6 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.2 14.2 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.1 13.1 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127a12.3 12.3 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.84 19.84 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
  crown: (s = 24) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.6 7.3c.6-.3 1.4-.1 1.7.5l1.9 3.3 3.1-4.6a1.3 1.3 0 0 1 2.1 0l3.1 4.6 1.9-3.3a1.3 1.3 0 1 1 2.3 1.2l-2.7 8.2H6l-2.7-8.2a1.3 1.3 0 0 1 .3-1.4z"/><rect x="6" y="18.4" width="12" height="2.4" rx="1.2"/></svg>`,
  users: () => `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  ticket: () => `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z"/><path d="M13 5.5v2M13 11v2M13 16.5v2"/></svg>`,
  box: () => `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>`,
};

// LeakBySunah
const BRAND_GLYPH = {
  spotify: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.42a.62.62 0 0 1-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 1 1-.28-1.22c3.82-.87 7.09-.5 9.72 1.11c.3.18.39.57.21.86zm1.23-2.73a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 1 1-.45-1.49c3.63-1.1 8.15-.56 11.24 1.33c.37.22.48.7.25 1.07zm.11-2.85C14.83 8.98 9.4 8.8 6.3 9.74a.94.94 0 1 1-.55-1.8c3.56-1.08 9.56-.87 13.33 1.36a.94.94 0 0 1-.96 1.61z"/></svg>`,
  xbox: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.4 5.5C6.4 3.3 9 2 12 2s5.6 1.3 7.6 3.5c.15.16.05.3-.15.2C16.7 4.4 13.3 8 12 9.5C10.7 8 7.3 4.4 4.55 5.7c-.2.1-.3-.04-.15-.2z"/><path d="M3.3 7C4.7 6.3 8.5 10 10.6 12c-2.1 2-5.9 6.7-7.3 5.8A10 10 0 0 1 2 12c0-1.85.5-3.58 1.3-5z"/><path d="M20.7 7c.8 1.42 1.3 3.15 1.3 5a10 10 0 0 1-1.3 5.8c-1.4.9-5.2-3.8-7.3-5.8C15.5 10 19.3 6.3 20.7 7z"/><path d="M12 14.5c1.3 1.5 4.7 5.1 4.7 5.1A10 10 0 0 1 12 22a10 10 0 0 1-4.7-2.4S10.7 16 12 14.5z"/></svg>`,
  crunchyroll: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 8.7 14.9A7.8 7.8 0 1 1 10 6.4A10.4 10.4 0 0 1 12 2z"/><circle cx="15.2" cy="8.4" r="2.3"/></svg>`,
  valorant: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 4.4c0-.4.5-.6.8-.3l7.4 9.2c.2.2 0 .5-.2.5H4.6a.6.6 0 0 1-.6-.4L3 4.7z"/><path d="M21 4.4c0-.4-.5-.6-.8-.3l-5.9 7.3c-.2.2 0 .5.2.5h3.9c.3 0 .5-.1.6-.4L21 4.7z"/></svg>`,
  disney: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 7.5C4 6 5.4 5 8 5c4.4 0 8 2.6 8 5.9S12.4 17 8 17c-1 0-1.9-.1-2.7-.4V7.6h2.2v6.9c.2 0 .4.1.6.1c2.9 0 5.4-1.6 5.4-3.8S11 6.9 8.1 6.9c-1.1 0-1.9.3-1.9.8v.02H4z"/></svg>`,
};
function brandGlyph(slug) { return BRAND_GLYPH[slug] || ''; }

function serviceThumb(svc) {
  if (svc.logo) {
    return `<div class="svc-thumb has-img">
      <img class="svc-img" src="${esc(svc.logo)}" alt="${esc(svc.name)}" loading="lazy" onerror="this.parentElement.classList.remove('has-img');this.remove()"/>
    </div>`;
  }
  const glyph = brandGlyph(svc.slug);
  return `<div class="svc-thumb" style="--c:${esc(svc.color)};background:linear-gradient(140deg, ${esc(svc.color)} 0%, ${esc(shade(svc.color, -52))} 100%)">
    <span class="svc-mono">${esc(initial(svc.name))}</span>
    <div class="svc-lockup">
      ${glyph ? `<span class="svc-glyph">${glyph}</span>` : ''}
      <span class="svc-name-big">${esc(svc.name)}</span>
    </div>
  </div>`;
}

// LeakBySunah
function toast(msg, kind = 'ok') {
  const wrap = $('#toasts');
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2600);
  setTimeout(() => t.remove(), 3000);
}

// LeakBySunah
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(t('t_copied'), 'ok');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(t('t_copied'), 'ok'); } catch { toast(t('t_error'), 'err'); }
    ta.remove();
  }
}

// LeakBySunah
function animateCounts(root = document) {
  const els = root.querySelectorAll('[data-count]:not([data-done])');
  els.forEach((el) => {
    el.setAttribute('data-done', '1');
    const to = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (to <= 0) { el.textContent = to; return; }
    const dur = 950, start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// LeakBySunah
function makeStars() {
  const wrap = $('#stars');
  if (!wrap || wrap.childElementCount) return;
  const n = 34;
  let html = '';
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 100, y = Math.random() * 100;
    const d = (Math.random() * 4).toFixed(2);
    const sz = (8 + Math.random() * 8).toFixed(0);
    html += `<span class="star" style="left:${x}%;top:${y}%;font-size:${sz}px;animation-delay:${d}s">+</span>`;
  }
  wrap.innerHTML = html;
}

// LeakBySunah
function langHtml() {
  return `<div class="lang">
    <button data-action="lang:en" class="${window.LANG === 'en' ? 'active' : ''}">EN</button>
    <button data-action="lang:fr" class="${window.LANG === 'fr' ? 'active' : ''}">FR</button>
  </div>`;
}

// LeakBySunah
function footerHtml() {
  const inv = App.discordInvite || '#';
  return `<div class="footer">
    <a href="#" data-action="noop">${t('privacy')}</a> ·
    <a href="#" data-action="noop">${t('terms')}</a> ·
    <a class="fdiscord" href="${esc(inv)}" target="_blank" rel="noopener">${ICON.discord(16)} ${t('discord')}</a>
  </div>`;
}

// LeakBySunah
function statsHtml(activeGen) {
  const s = App.stats;
  return `<div class="stats-row">
    <div class="stat-pill">${t('users')} <b data-count="${s.users}">0</b></div>
    <div class="stat-pill">${t('services')} <b data-count="${s.services}">0</b></div>
    <div class="stat-pill ${activeGen ? 'accent' : ''}">${t('generated')} <b data-count="${s.generated}">0</b></div>
  </div>`;
}

// LeakBySunah
// LeakBySunah
// LeakBySunah
function renderLanding() {
  document.body.classList.add('logged-out');
  $('#app').innerHTML = `
    <div class="lang-fixed">${langHtml()}</div>
    <div class="center-wrap">
      <div class="landing-logo"><span class="b">Bet</span><span class="two">2</span><span class="b">Gen</span><span class="xyz">.xyz</span></div>
      <button class="btn btn-discord connect" data-action="login-demo">${ICON.discord(20)} ${t('connectDiscord')}</button>
      ${statsHtml(true)}
      <button class="mini" style="margin-top:18px;background:transparent;border:none;color:var(--muted)" data-action="login-admin">${t('demoAdmin')}</button>
    </div>`;
  animateCounts($('#app'));
}

// LeakBySunah
// LeakBySunah
// LeakBySunah
function topbarHtml() {
  const u = App.me;
  const navItem = (v, label) =>
    `<button class="nav-btn ${App.view === v ? 'active' : ''}" data-action="nav:${v}">${label}</button>`;
  let nav = navItem('hub', t('hub')) + navItem('services', t('nav_services')) +
    navItem('ranking', t('ranking')) + navItem('history', t('history'));
  if (u.isAdmin) nav += `<button class="nav-btn admin ${App.view === 'admin' ? 'active' : ''}" data-action="nav:admin">${t('admin')}</button>`;

  return `<div class="topbar">
    <div class="brand">Bet<span class="two">2</span>Gen<span class="xyz">.xyz</span></div>
    <div class="nav">${nav}</div>
    <div class="topbar-right">
      ${langHtml()}
      <div class="userbox">
        <button class="userbtn" data-action="toggle-menu">
          ${avatarHtml(u.username, u.color, u.avatar)}
          <span>${esc(u.username)}</span><span class="caret">▾</span>
        </button>
        ${App.menuOpen ? `<div class="menu">
          <button class="danger" data-action="logout">${t('logout')}</button>
        </div>` : ''}
      </div>
    </div>
  </div>`;
}

function renderShell() {
  document.body.classList.remove('logged-out');
  $('#app').innerHTML = topbarHtml() + `<div class="page" id="view"></div>` + footerHtml();
  renderView();
}

function viewEl() { return $('#view'); }

async function renderView() {
  const el = viewEl();
  if (!el) return;
  switch (App.view) {
    case 'hub': return renderHub(el);
    case 'services': return renderServices(el);
    case 'ranking': return renderRanking(el);
    case 'history': return renderHistory(el);
    case 'admin': return renderAdmin(el);
    default: return renderHub(el);
  }
}

// LeakBySunah
async function renderHub(el) {
  const { data: h } = await api('GET', '/api/hub');
  const pct = h.day.limit ? Math.min(100, (h.day.used / h.day.limit) * 100) : 0;
  const max = Math.max(1, ...h.last7.map((d) => d.count));
  const bars = h.last7.map((d) => {
    const height = d.count ? Math.max(6, (d.count / max) * 100) : 2;
    return `<div class="chart-col">
      <div class="chart-val ${d.count ? '' : 'zero'}">${d.count || 0}</div>
      <div class="chart-bar-wrap"><div class="chart-bar ${d.count ? '' : 'zero'}" style="height:${height}%"></div></div>
      <div class="chart-day">${d.label}</div>
    </div>`;
  }).join('');

  el.innerHTML = `
    ${statsHtml(true)}
    <div class="card">
      <div class="progress-label">
        <span class="card-title">${t('yourDay')}</span>
        <span class="val">${t('todayCount', { used: h.day.used, limit: h.day.limit })}</span>
      </div>
      <div class="progress"><i style="width:${pct}%"></i></div>
      <div class="cooldown-note">${t('yourCooldown', { v: fmtCooldown(h.cooldownSec) })}</div>
      <div style="margin-top:18px"><button class="btn btn-primary" data-action="nav:services">${t('generateNow')}</button></div>
    </div>

    <div class="card">
      <div class="card-head"><span class="card-title muted">${t('last7days')}</span></div>
      <div class="chart">${bars}</div>
    </div>

    ${promoHtml()}
  `;
  animateCounts(el);
}

function promoHtml() {
  const inv = App.discordInvite || '#';
  return `<div class="card promo">
    <div class="promo-ico">${ICON.discord(24)}</div>
    <div class="promo-txt"><b>${t('fasterTitle')}</b><span>${t('fasterDesc')}</span></div>
    <a class="btn btn-discord btn-inline btn-sm" href="${esc(inv)}" target="_blank" rel="noopener">${t('openDiscord')}</a>
  </div>`;
}

// LeakBySunah
async function renderServices(el) {
  const [{ data: h }, { data: s }] = await Promise.all([
    api('GET', '/api/hub'), api('GET', '/api/services'),
  ]);
  const pct = h.day && h.day.limit ? Math.min(100, (h.day.used / h.day.limit) * 100) : 0;

  const cards = s.services.map((svc) => {
    let stockTxt, stockCls, disabled = false;
    if (svc.displayStatus === 'awaiting_restock') { stockTxt = t('awaitingRestock'); stockCls = 'restock'; disabled = true; }
    else if (svc.displayStatus === 'out_of_stock') { stockTxt = t('outOfStock'); stockCls = 'out'; disabled = true; }
    else if (svc.displayStatus === 'disabled') { stockTxt = t('disabled'); stockCls = 'out'; disabled = true; }
    else { stockTxt = t('codesLeft', { n: svc.codesLeft }); stockCls = 'in'; }

    const btnLabel = svc.displayStatus === 'awaiting_restock' ? t('awaitingRestock') : t('generate');
    return `<div class="svc">
      ${serviceThumb(svc)}
      <div class="svc-body">
        <h3>${esc(svc.name)}</h3>
        <div class="svc-stock ${stockCls}">${stockTxt}</div>
        <button class="btn ${disabled ? 'btn-ghost' : 'btn-primary'}" ${disabled ? 'disabled' : ''} data-action="generate:${svc.id}">${btnLabel}</button>
      </div>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div class="svc-top">
      <div class="card">
        <div class="progress-label">
          <span class="card-title">${t('dailyGenerations')}</span>
          <span class="val">${t('todayCount', { used: h.day.used, limit: h.day.limit })}</span>
        </div>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <div class="cooldown-note">${t('yourCooldown', { v: fmtCooldown(h.cooldownSec) })}</div>
      </div>
      ${promoHtml()}
    </div>
    <div class="grid">${cards}</div>
  `;
  animateCounts(el);
}

// LeakBySunah
function shade(hex, amt) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  let r = (num >> 16) + amt, g = ((num >> 8) & 0xff) + amt, b = (num & 0xff) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

async function doGenerate(serviceId) {
  const { ok, status, data } = await api('POST', '/api/generate', { serviceId });
  if (ok) {
    // LeakBySunah
    App.stats.generated += 1;
    showCodeModal(data);
    renderView();
    return;
  }
  if (status === 401) { boot(); return; }
  const map = {
    banned: ['t_banned', 'err'], out_of_stock: ['t_outOfStock', 'err'],
    awaiting_restock: ['t_restock', 'warn'], disabled: ['t_restock', 'warn'],
  };
  if (data.error === 'cooldown') return toast(t('t_cooldown', { v: fmtRemaining(data.remainingSec) }), 'warn');
  if (data.error === 'daily_limit') return toast(t('t_dailyLimit', { limit: data.limit }), 'warn');
  const m = map[data.error];
  toast(m ? t(m[0]) : t('t_error'), m ? m[1] : 'err');
}

function showCodeModal(data) {
  $('#modal-root').innerHTML = `
    <div class="overlay" data-action="close-modal">
      <div class="modal" data-stop="1">
        <div class="m-badge" style="background:${esc(data.color || '#3d8bfd')}">${esc(initial(data.serviceName))}</div>
        <h3>${t('codeReady')}</h3>
        <div class="m-sub">${t('codeReadySub', { svc: esc(data.serviceName) })}</div>
        <div class="code-box"><code>${esc(data.code)}</code>
          <button class="mini" data-action="copy" data-code="${esc(data.code)}">${t('copy')}</button>
        </div>
        <div class="m-actions">
          <button class="btn btn-primary" data-action="copy" data-code="${esc(data.code)}">${t('copyCode')}</button>
          <button class="btn btn-ghost" data-action="close-modal">${t('close')}</button>
        </div>
      </div>
    </div>`;
}
function closeModal() { $('#modal-root').innerHTML = ''; }

// LeakBySunah
async function renderRanking(el) {
  const { data } = await api('GET', '/api/ranking');
  const r = data.ranking || [];
  if (!r.length) { el.innerHTML = `<div class="empty">${t('rankingEmpty')}</div>`; return; }
  const top = r.slice(0, 3);
  const rest = r.slice(3);
  const g = top[0], s = top[1], b = top[2];

  const topCol = (u, place) => {
    if (!u) return `<div class="ptop"></div>`;
    const cls = place === 1 ? 'gold' : place === 2 ? 'silver' : 'bronze';
    const badge = place === 1 ? 'GOLD' : place === 2 ? 'SILVER' : 'BRONZE';
    const crown = place === 1 ? `<div class="crown">${ICON.crown(26)}</div>` : '';
    return `<div class="ptop ${cls}">
      ${crown}
      <div class="badge ${cls}">${badge}</div>
      ${avatarHtml(u.username, u.color, u.avatar, 'pav')}
      <div class="pname">${esc(u.username)}</div>
      <div class="pgens">${u.gens} gens</div>
    </div>`;
  };

  const restHtml = rest.map((u) => `
    <div class="rank-row">
      <div class="rk">${u.rank}</div>
      ${avatarHtml(u.username, u.color, u.avatar, 'pav')}
      <div class="rn">${esc(u.username)}</div>
      <div class="rg">${u.gens} <span>gens</span></div>
    </div>`).join('');

  el.innerHTML = `
    <div class="podium-wrap">
      <div class="podium-tops">
        ${topCol(s, 2)}${topCol(g, 1)}${topCol(b, 3)}
      </div>
      <div class="podium-blocks">
        <div class="pblock b2">2</div><div class="pblock b1">1</div><div class="pblock b3">3</div>
      </div>
      <div class="podium-base"></div>
    </div>
    <div class="rank-list">${restHtml}</div>
  `;
}

// LeakBySunah
async function renderHistory(el) {
  const { data } = await api('GET', '/api/history');
  const items = data.items || [];
  if (!items.length) { el.innerHTML = `<div class="empty">${t('historyEmpty')}</div>`; return; }
  el.innerHTML = `<div class="hist-list">${items.map((g) => {
    const d = new Date(g.at);
    const date = d.toLocaleString(window.LANG === 'fr' ? 'fr-FR' : 'en-US',
      { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `<div class="hist-row">
      <div class="hl"><b>${esc(g.serviceName)}</b><span class="hcode">${esc(g.code)}</span></div>
      <div class="hr"><span class="hdate">${esc(date)}</span>
        <button class="mini" data-action="copy" data-code="${esc(g.code)}">${t('copy')}</button></div>
    </div>`;
  }).join('')}</div>`;
}

// LeakBySunah
async function renderAdmin(el) {
  const tabBtn = (id, label) =>
    `<button class="tab ${App.adminTab === id ? 'active' : ''}" data-action="admin-tab:${id}">${label}</button>`;
  el.innerHTML = `
    <div class="admin-head">
      <h1>${t('adminPanel')}</h1><p>${t('manageDesc')}</p>
    </div>
    <div class="tabs">
      ${tabBtn('users', t('tab_users'))}${tabBtn('services', t('tab_services'))}
      ${tabBtn('export', t('tab_export'))}${tabBtn('discord', t('tab_discord'))}
    </div>
    <div id="admin-body"></div>`;
  renderAdminBody();
}

function adminBodyEl() { return $('#admin-body'); }

async function renderAdminBody() {
  const el = adminBodyEl();
  if (!el) return;
  if (App.adminTab === 'users') return adminUsers(el);
  if (App.adminTab === 'services') return adminServices(el);
  if (App.adminTab === 'export') return adminExport(el);
  if (App.adminTab === 'discord') return adminDiscord(el);
}

async function adminUsers(el) {
  const q = encodeURIComponent(App.adminUserQuery);
  const { data } = await api('GET', `/api/admin/users?q=${q}&filter=${App.adminUserFilter}`);
  const seg = (id, label) =>
    `<button class="${App.adminUserFilter === id ? 'active' : ''}" data-action="admin-filter:${id}">${label}</button>`;
  const rows = (data.users || []).map((u) => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        ${avatarHtml(u.username, u.color, u.avatar, 'pav')}<span>${esc(u.username)}</span>
        ${u.isAdmin ? `<span class="tag admin">${t('a_admin')}</span>` : ''}</div></td>
      <td class="muted small">${esc(u.discordId || u.id.slice(0, 10))}</td>
      <td><b>${u.gensCount}</b></td>
      <td class="muted small">${u.cooldownSec == null ? t('a_default') : fmtCooldown(u.cooldownSec)}</td>
      <td>${u.banned ? `<span class="tag banned">${t('a_banned')}</span>` : `<span class="tag active">${t('a_active')}</span>`}</td>
      <td><div class="row-actions">
        ${u.banned
          ? `<button class="mini green" data-action="user-unban" data-id="${u.id}">${t('unban')}</button>`
          : `<button class="mini red" data-action="user-ban" data-id="${u.id}">${t('ban')}</button>`}
        <button class="mini" data-action="user-admin" data-id="${u.id}" data-val="${u.isAdmin ? '0' : '1'}">${u.isAdmin ? t('rmAdmin') : t('mkAdmin')}</button>
        <button class="mini" data-action="user-cooldown" data-id="${u.id}">${t('th_cooldown')}</button>
        <button class="mini red" data-action="user-del" data-id="${u.id}">${t('del')}</button>
      </div></td>
    </tr>`).join('');

  el.innerHTML = `
    <div class="searchbar">
      <input class="input" id="user-search" placeholder="${t('searchUsers')}" value="${esc(App.adminUserQuery)}" />
      <div class="seg">${seg('all', t('allUsers'))}${seg('active', t('a_active'))}${seg('banned', t('a_banned'))}</div>
    </div>
    ${(data.users || []).length ? `<table class="admin-table">
      <thead><tr><th>${t('th_user')}</th><th>${t('th_id')}</th><th>${t('th_gens')}</th><th>${t('th_cooldown')}</th><th>${t('th_status')}</th><th>${t('th_actions')}</th></tr></thead>
      <tbody>${rows}</tbody></table>` : `<div class="empty">${t('noUsers')}</div>`}
  `;

  const search = $('#user-search');
  if (search) {
    search.oninput = debounce((e) => { App.adminUserQuery = e.target.value; adminUsers(el); }, 250);
    // LeakBySunah
    search.focus();
    const v = search.value; search.value = ''; search.value = v;
  }
}

async function adminServices(el) {
  const { data } = await api('GET', '/api/admin/services');
  const statusOpts = (cur) => `
    <option value="active" ${cur === 'active' ? 'selected' : ''}>${t('st_active')}</option>
    <option value="awaiting_restock" ${cur === 'awaiting_restock' ? 'selected' : ''}>${t('st_restock')}</option>
    <option value="disabled" ${cur === 'disabled' ? 'selected' : ''}>${t('st_disabled')}</option>`;

  const cards = (data.services || []).map((s) => `
    <div class="asvc" data-svc="${s.id}">
      <div class="asvc-head">
        <div class="asvc-dot" style="background:${esc(s.color)}"></div>
        <div><b>${esc(s.name)}</b><div class="sub">${t('stockLabel', { n: s.codesLeft })} · ${t('genLabel', { n: s.generatedCount })}</div></div>
      </div>
      <div class="field"><label>${t('f_name')}</label><input class="input" data-f="name" value="${esc(s.name)}" /></div>
      <div class="field"><label>${t('f_logo')}</label><input class="input" data-f="logo" value="${esc(s.logo || '')}" placeholder="https://.../logo.png" /><div class="hint">${t('f_logo_h')}</div></div>
      <div style="display:flex;gap:12px">
        <div class="field" style="flex:1"><label>${t('f_status')}</label><select class="input" data-f="status">${statusOpts(s.status)}</select></div>
        <div class="field"><label>${t('f_color')}</label><input type="color" class="input" data-f="color" value="${esc(s.color)}" style="width:56px;padding:4px" /></div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="mini green" data-action="svc-save" data-id="${s.id}">${t('save')}</button>
        <button class="mini red" data-action="svc-clear" data-id="${s.id}">${t('clearStock')}</button>
        <button class="mini red" data-action="svc-del" data-id="${s.id}">${t('deleteService')}</button>
      </div>
      <div class="field"><label>${t('addCodes')}</label><textarea class="input" data-f="codes" placeholder="${t('pasteCodes')}"></textarea></div>
      <button class="mini" data-action="svc-addcodes" data-id="${s.id}">${t('addCodes')}</button>
    </div>`).join('');

  el.innerHTML = `
    <div style="margin-bottom:16px"><button class="btn btn-primary btn-inline btn-sm" data-action="svc-add">${t('addService')}</button></div>
    <div class="admin-svc">${cards}</div>`;
}

async function adminExport(el) {
  el.innerHTML = `
    <div class="card" style="margin-bottom:18px"><span class="card-title">${t('exportTitle')}</span></div>
    <div class="export-grid">
      <div class="export-card"><div class="ico">${ICON.users()}</div><b>${t('exp_users')}</b><span>${t('exp_users_d')}</span>
        <a class="btn btn-primary" href="/api/admin/export/users.csv">${t('download')}</a></div>
      <div class="export-card"><div class="ico">${ICON.ticket()}</div><b>${t('exp_gens')}</b><span>${t('exp_gens_d')}</span>
        <a class="btn btn-primary" href="/api/admin/export/generations.csv">${t('download')}</a></div>
      <div class="export-card"><div class="ico">${ICON.box()}</div><b>${t('exp_stock')}</b><span>${t('exp_stock_d')}</span>
        <a class="btn btn-primary" href="/api/admin/export/stock.csv">${t('download')}</a></div>
    </div>`;
}

async function adminDiscord(el) {
  const [{ data: d }, { data: st }] = await Promise.all([
    api('GET', '/api/admin/discord'), api('GET', '/api/admin/settings'),
  ]);
  el.innerHTML = `
    <div class="card form-narrow">
      <div class="field"><label>${t('d_invite')}</label><input class="input" id="d-invite" value="${esc(d.inviteUrl)}" placeholder="https://discord.gg/..." />
        <div class="hint">${t('d_invite_h')}</div></div>
      <div class="field"><label>${t('d_webhook')}</label><input class="input" id="d-webhook" value="${esc(d.webhookUrl)}" placeholder="https://discord.com/api/webhooks/..." />
        <div class="hint">${t('d_webhook_h')}</div></div>
      <div class="field"><label>${t('d_oauth')}</label>
        <div class="${d.oauthConfigured ? 'tag active' : 'tag restock'}" style="display:inline-block">${d.oauthConfigured ? t('d_configured') : t('d_notconfigured')}</div>
        <div class="hint">${t('d_oauth_h')}</div></div>
      <button class="btn btn-primary btn-inline btn-sm" data-action="discord-save">${t('save')}</button>
    </div>

    <div class="card form-narrow" style="margin-top:16px">
      <div class="card-head"><span class="card-title">${t('settings')}</span></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div class="field" style="flex:1;min-width:130px"><label>${t('s_dailyLimit')}</label><input class="input" id="s-daily" type="number" value="${st.dailyLimit}" /></div>
        <div class="field" style="flex:1;min-width:130px"><label>${t('s_cooldown')}</label><input class="input" id="s-cooldown" type="number" value="${st.defaultCooldownSec}" /></div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div class="field" style="flex:1;min-width:130px"><label>${t('s_baseUsers')}</label><input class="input" id="s-users" type="number" value="${st.baseUsers}" /></div>
        <div class="field" style="flex:1;min-width:130px"><label>${t('s_baseGen')}</label><input class="input" id="s-gen" type="number" value="${st.baseGenerated}" /></div>
      </div>
      <button class="btn btn-primary btn-inline btn-sm" data-action="settings-save">${t('save')}</button>
    </div>`;
}

function debounce(fn, ms) {
  let tmr; return (...a) => { clearTimeout(tmr); tmr = setTimeout(() => fn(...a), ms); };
}

// LeakBySunah
document.addEventListener('click', async (e) => {
  const target = e.target.closest('[data-action]');
  // LeakBySunah
  if (App.menuOpen && !e.target.closest('.userbox')) { App.menuOpen = false; if (App.me) renderShell(); }
  if (!target) return;
  const action = target.getAttribute('data-action');
  if (action === 'noop') { e.preventDefault(); return; }

  // LeakBySunah
  if (action.startsWith('lang:')) {
    window.setLang(action.split(':')[1]);
    App.me ? renderShell() : renderLanding();
    return;
  }
  // LeakBySunah
  if (action.startsWith('nav:')) { App.view = action.split(':')[1]; App.menuOpen = false; renderShell(); return; }

  if (action === 'toggle-menu') { App.menuOpen = !App.menuOpen; renderShell(); return; }
  if (action === 'login-demo') { await api('POST', '/auth/demo'); await boot(); return; }
  if (action === 'login-admin') { await api('POST', '/auth/demo-admin'); await boot(); return; }
  if (action === 'logout') { await api('POST', '/auth/logout'); App.me = null; App.view = 'hub'; await boot(); return; }

  if (action.startsWith('generate:')) {
    const id = action.split(':')[1];
    target.disabled = true;
    await doGenerate(id);
    return;
  }
  if (action === 'close-modal') { closeModal(); return; }
  if (action === 'copy') { copyText(target.getAttribute('data-code')); return; }
  if (action === 'open-discord') return;

  // LeakBySunah
  if (action.startsWith('admin-tab:')) { App.adminTab = action.split(':')[1]; renderAdmin(viewEl()); return; }
  if (action.startsWith('admin-filter:')) { App.adminUserFilter = action.split(':')[1]; adminUsers(adminBodyEl()); return; }

  // LeakBySunah
  if (action === 'user-ban') { await api('POST', `/api/admin/users/${target.dataset.id}/ban`); adminUsers(adminBodyEl()); return; }
  if (action === 'user-unban') { await api('POST', `/api/admin/users/${target.dataset.id}/unban`); adminUsers(adminBodyEl()); return; }
  if (action === 'user-admin') { await api('POST', `/api/admin/users/${target.dataset.id}/admin`, { value: target.dataset.val === '1' }); adminUsers(adminBodyEl()); return; }
  if (action === 'user-del') { await api('DELETE', `/api/admin/users/${target.dataset.id}`); adminUsers(adminBodyEl()); return; }
  if (action === 'user-cooldown') {
    const v = prompt('Cooldown in seconds (empty = default):', '');
    if (v === null) return;
    await api('POST', `/api/admin/users/${target.dataset.id}/cooldown`, { seconds: v.trim() === '' ? null : v.trim() });
    toast(t('t_saved'), 'ok'); adminUsers(adminBodyEl()); return;
  }

  // LeakBySunah
  if (action === 'svc-add') {
    const name = prompt(t('f_name') + ':', 'New service');
    if (!name) return;
    await api('POST', '/api/admin/services', { name, color: '#4a9eff', status: 'active' });
    adminServices(adminBodyEl()); return;
  }
  if (action === 'svc-save') {
    const card = target.closest('.asvc');
    await api('PUT', `/api/admin/services/${target.dataset.id}`, {
      name: $('[data-f="name"]', card).value,
      color: $('[data-f="color"]', card).value,
      logo: $('[data-f="logo"]', card).value,
      status: $('[data-f="status"]', card).value,
    });
    toast(t('t_saved'), 'ok'); adminServices(adminBodyEl()); return;
  }
  if (action === 'svc-addcodes') {
    const card = target.closest('.asvc');
    const codes = $('[data-f="codes"]', card).value;
    if (!codes.trim()) return;
    const { data } = await api('POST', `/api/admin/services/${target.dataset.id}/codes`, { codes });
    toast(t('t_added', { n: data.added }), 'ok'); adminServices(adminBodyEl()); return;
  }
  if (action === 'svc-clear') {
    if (!confirm(t('clearStock') + '?')) return;
    await api('DELETE', `/api/admin/services/${target.dataset.id}/codes`);
    toast(t('t_cleared'), 'ok'); adminServices(adminBodyEl()); return;
  }
  if (action === 'svc-del') {
    if (!confirm(t('deleteService') + '?')) return;
    await api('DELETE', `/api/admin/services/${target.dataset.id}`);
    adminServices(adminBodyEl()); return;
  }

  // LeakBySunah
  if (action === 'discord-save') {
    await api('POST', '/api/admin/discord', { inviteUrl: $('#d-invite').value, webhookUrl: $('#d-webhook').value });
    App.discordInvite = $('#d-invite').value;
    toast(t('t_saved'), 'ok'); return;
  }
  if (action === 'settings-save') {
    await api('POST', '/api/admin/settings', {
      dailyLimit: $('#s-daily').value, defaultCooldownSec: $('#s-cooldown').value,
      baseUsers: $('#s-users').value, baseGenerated: $('#s-gen').value,
    });
    toast(t('t_saved'), 'ok'); return;
  }
});

// LeakBySunah
async function boot() {
  makeStars();
  const { data } = await api('GET', '/api/me');
  App.me = data.user;
  App.stats = data.stats || App.stats;
  App.discordInvite = data.discordInvite || '';
  if (App.me) renderShell(); else renderLanding();
}

// LeakBySunah
(function checkError() {
  const p = new URLSearchParams(location.search);
  if (p.get('error') === 'discord_not_configured') {
    setTimeout(() => toast(t('t_discordNotConfigured'), 'warn'), 400);
    history.replaceState({}, '', '/');
  } else if (p.get('error') === 'discord_error') {
    setTimeout(() => toast(t('t_error'), 'err'), 400);
    history.replaceState({}, '', '/');
  }
})();

boot();
