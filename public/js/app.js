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
  adminServices: [],
  loginError: '',
  hub: null,
  alertTimer: null,
};

// LeakBySunah
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
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
function fmtClock(sec) {
  const v = Math.max(0, sec);
  const m = Math.floor(v / 60), s = v % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function fmtDate(ts) {
  return new Date(ts).toLocaleString(window.LANG === 'fr' ? 'fr-FR' : 'en-US',
    { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function initial(name) {
  const ch = Array.from(String(name || '?').trim())[0] || '?';
  return ch.toUpperCase();
}

// LeakBySunah
function avatarHtml(u, cls) {
  if (u && u.avatar) return `<img class="${cls}" src="${esc(u.avatar)}" alt="" />`;
  const color = (u && u.color) || '#3d9fff';
  return `<div class="${cls} avatar-fallback" style="background:${esc(color)}">${esc(initial(u && u.username))}</div>`;
}

// LeakBySunah
const ICON = {
  discord: (s = 20) => `<svg class="discord-icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.6 12.6 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.2 14.2 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.1 13.1 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127a12.3 12.3 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.84 19.84 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
  chevron: () => `<svg class="profile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
};

// LeakBySunah
function toast(msg, kind = 'ok') {
  const wrap = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; }, 2600);
  setTimeout(() => el.remove(), 3000);
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
      else el.textContent = to.toLocaleString();
    };
    requestAnimationFrame(tick);
  });
}

function debounce(fn, ms) {
  let tmr; return (...a) => { clearTimeout(tmr); tmr = setTimeout(() => fn(...a), ms); };
}

// ── Langue ──────────────────────────────────────────────────────────

// LeakBySunah
function langHtml() {
  const btn = (l) => `<button class="lang-btn ${window.LANG === l ? 'active' : ''}" data-action="lang:${l}">${l.toUpperCase()}</button>`;
  return `<div class="lang-switch">${btn('en')}${btn('fr')}</div>`;
}

// ── Landing (login) ─────────────────────────────────────────────────

function loginBgHtml() {
  return `<div class="bg" aria-hidden="true">
    <div class="spotlight"></div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="grid-overlay"></div>
    <span class="spark spark-1"></span>
    <span class="spark spark-2"></span>
    <span class="spark spark-3"></span>
    <span class="spark spark-4"></span>
    <span class="spark spark-5"></span>
    <span class="spark spark-6"></span>
    <div class="vignette"></div>
  </div>`;
}

// LeakBySunah
function loginStatsHtml() {
  const s = App.stats;
  const pill = (label, n) => `<div class="stat">
    <span class="stat-label">${label}</span><span class="stat-count" data-count="${n}">0</span>
  </div>`;
  return `<div class="stats">
    ${pill(t('users'), s.users)}<span class="stat-sep"></span>
    ${pill(t('services'), s.services)}<span class="stat-sep"></span>
    ${pill(t('generated'), s.generated)}
  </div>`;
}

// LeakBySunah
function renderLanding() {
  document.body.classList.add('login-body');
  document.body.classList.remove('dashboard-body');
  const err = App.loginError;
  $('#app').innerHTML = `
    ${loginBgHtml()}
    <div class="lang-switch-top">${langHtml()}</div>
    <section class="hero">
      <div class="hero-stack">
        <div class="brand-wrap">
          <h1 class="brand"><span class="brand-bet">Bet</span><span class="brand-num">2</span><span class="brand-gen">Gen</span><span class="brand-tld">.xyz</span></h1>
        </div>
        <p class="login-error ${err ? '' : 'hidden'}">${esc(err || '')}</p>
        <button class="btn-3d btn-discord" data-action="login-demo">${ICON.discord(18)} ${t('connectDiscord')}</button>
        ${loginStatsHtml()}
        <button class="btn-3d btn-3d-ghost btn-3d-sm hero-demo" data-action="login-admin">${t('demoAdmin')}</button>
      </div>
    </section>
    <div class="login-overlay" id="login-overlay">
      <div class="login-overlay-card">
        <div class="login-spinner"></div>
        <div class="login-overlay-text">${t('connecting')}</div>
      </div>
    </div>`;
  animateCounts($('#app'));
}

function loginOverlay(on) {
  const el = $('#login-overlay');
  if (el) el.classList.toggle('active', on);
}

// ── Dashboard — coquille ────────────────────────────────────────────

// LeakBySunah
const SECTIONS = ['hub', 'services', 'ranking', 'history', 'admin'];

function headerHtml() {
  const u = App.me;
  const cat = (v, label, extra = '') =>
    `<button class="btn-3d btn-3d-cat ${App.view === v ? 'active' : ''} ${extra}" data-action="nav:${v}">${label}</button>`;

  return `<header class="dash-header">
    <a class="dash-logo" href="/" data-action="nav:hub">
      <span class="brand-bet">Bet</span><span class="brand-num">2</span><span class="brand-gen">Gen</span><span class="brand-tld">.xyz</span>
    </a>
    <nav class="category-nav">
      ${cat('hub', t('hub'))}
      ${cat('services', t('nav_services'))}
      <span class="cat-sep"></span>
      ${cat('ranking', t('ranking'))}
      ${cat('history', t('history'))}
      <span class="cat-sep"></span>
      ${cat('admin', t('admin'), 'admin-only' + (u.isAdmin ? '' : ' hidden'))}
    </nav>
    <div class="dash-header-right">
      ${langHtml()}
      <div class="profile-card" id="profile-card">
        <button class="profile-trigger" data-action="toggle-profile">
          ${avatarHtml(u, 'profile-avatar')}
          <span class="profile-name">${esc(u.username)}</span>
          ${ICON.chevron()}
        </button>
        <div class="profile-expand">
          <div class="profile-expand-inner">
            <span class="profile-badge ${u.isAdmin ? 'admin' : ''}">${u.isAdmin ? t('p_admin') : t('p_member')}</span>
            <button class="profile-menu-btn" data-action="nav:history">${t('history')}</button>
            <button class="profile-menu-btn profile-logout" data-action="logout">${t('logout')}</button>
          </div>
        </div>
      </div>
    </div>
  </header>`;
}

// LeakBySunah
function footerHtml() {
  const inv = App.discordInvite || '#';
  return `<footer class="site-footer">
    <a href="#" data-action="noop">${t('privacy')}</a>
    <span class="footer-sep"></span>
    <a href="#" data-action="noop">${t('terms')}</a>
    <span class="footer-sep"></span>
    <a class="footer-discord" href="${esc(inv)}" target="_blank" rel="noopener">${ICON.discord(14)} ${t('discord')}</a>
  </footer>`;
}

function renderShell() {
  document.body.classList.remove('login-body');
  document.body.classList.add('dashboard-body');
  $('#app').innerHTML = `<div class="dashboard">
    ${headerHtml()}
    <main class="dash-main">
      ${SECTIONS.map((s) => `<section class="dash-section" id="section-${s}"></section>`).join('')}
    </main>
    ${footerHtml()}
  </div>`;
  switchSection(App.view);
}

function sectionEl(v) { return $('#section-' + v); }

// LeakBySunah
function switchSection(view) {
  if (!SECTIONS.includes(view)) view = 'hub';
  if (view === 'admin' && !App.me.isAdmin) view = 'hub';
  App.view = view;

  $$('.dash-section').forEach((el) => el.classList.toggle('active', el.id === 'section-' + view));
  $$('.btn-3d-cat').forEach((el) => el.classList.toggle('active', el.dataset.action === 'nav:' + view));

  const el = sectionEl(view);
  if (!el) return;
  if (view === 'hub') return renderHub(el);
  if (view === 'services') return renderServices(el);
  if (view === 'ranking') return renderRanking(el);
  if (view === 'history') return renderHistory(el);
  if (view === 'admin') return renderAdmin(el);
}

function sectionHead(title, desc) {
  return `<div class="section-head">
    <h1 class="section-title">${title}</h1>
    <p class="section-desc">${desc}</p>
  </div>`;
}

// ── Blocs partagés ──────────────────────────────────────────────────

// LeakBySunah
function barState(pct) {
  if (pct >= 100) return 'is-full';
  if (pct >= 75) return 'is-warn';
  return '';
}

function cooldownTipHtml(extraCls = '') {
  const inv = App.discordInvite || '#';
  return `<a class="cooldown-tip ${extraCls}" href="${esc(inv)}" target="_blank" rel="noopener">
    <span class="cooldown-tip-glow"></span>
    <span class="cooldown-tip-icon">${ICON.discord(22)}</span>
    <span class="cooldown-tip-body">
      <span class="cooldown-tip-title">${t('fasterTitle')}</span>
      <span class="cooldown-tip-text">${t('fasterDesc')}</span>
    </span>
    <span class="cooldown-tip-cta">${t('joinDiscord')} <span class="cooldown-tip-arrow">→</span></span>
  </a>`;
}

// LeakBySunah
function chartHtml(last7) {
  const max = Math.max(1, ...last7.map((d) => d.count));
  // Le groupe contient le chiffre (~23% de la hauteur) puis la barre : on
  // repartit les 77% restants pour que la BARRE reste proportionnelle.
  return `<div class="hub-chart">${last7.map((d, i) => {
    const pct = d.count ? Math.round(23 + (d.count / max) * 77) : 0;
    return `<div class="chart-col">
      <div class="chart-bar-wrap">
        <div class="chart-bar-group ${d.count ? '' : 'is-zero'}" ${d.count ? `style="height:${pct}%"` : ''}>
          <span class="chart-value">${d.count || 0}</span>
          ${d.count ? `<div class="chart-bar" style="animation-delay:${(i * 0.05).toFixed(2)}s"></div>` : ''}
        </div>
      </div>
      <span class="chart-label">${esc(d.label)}</span>
    </div>`;
  }).join('')}</div>`;
}

// ── Hub ─────────────────────────────────────────────────────────────

// LeakBySunah
async function renderHub(el) {
  const { data: h } = await api('GET', '/api/hub');
  App.hub = h;
  const pct = h.day && h.day.limit ? Math.min(100, (h.day.used / h.day.limit) * 100) : 0;
  const rem = h.cooldownRemainingSec || 0;
  const s = App.stats;

  const stat = (label, n, accent) => `<div class="hub-stat ${accent ? 'accent' : ''}">
    <span class="hub-stat-label">${label}</span>
    <span class="hub-stat-value" data-count="${n}">0</span>
  </div>`;

  el.innerHTML = `
    ${sectionHead(t('hubTitle', { name: esc(App.me.username) }), t('hubDesc'))}
    <div class="hub-wrap">
      <div class="hub-stats">
        ${stat(t('users'), s.users)}
        <span class="hub-stat-sep"></span>
        ${stat(t('services'), s.services)}
        <span class="hub-stat-sep"></span>
        ${stat(t('generated'), s.generated, true)}
      </div>

      <div class="hub-you">
        <div class="hub-you-row">
          <span class="hub-you-label">${t('yourDay')}</span>
          <span class="hub-you-value">${t('todayCount', { used: h.day.used, limit: h.day.limit })}</span>
        </div>
        <div class="hub-you-bar"><div class="hub-you-bar-fill ${barState(pct)}" style="width:${pct}%"></div></div>
        <div class="hub-you-meta">
          <span>${t('yourCooldown', { v: fmtCooldown(h.cooldownSec) })}</span>
          <span class="hub-you-perk">${rem > 0 ? t('readyIn', { v: fmtRemaining(rem) }) : t('readyNow')}</span>
        </div>
        <button class="hub-you-cta" data-action="nav:services">
          ${t('generateNow')} <span class="hub-you-cta-arrow">→</span>
        </button>
      </div>

      ${cooldownTipHtml('hub-cooldown-tip')}

      <div class="hub-chart-wrap">
        <div class="hub-chart-head"><span class="hub-chart-title">${t('last7days')}</span></div>
        ${chartHtml(h.last7 || [])}
      </div>
    </div>`;
  animateCounts(el);
}

// ── Services ────────────────────────────────────────────────────────

// LeakBySunah
async function renderServices(el) {
  if (!el) return;
  const [{ data: h }, { data: s }] = await Promise.all([
    api('GET', '/api/hub'), api('GET', '/api/services'),
  ]);
  App.hub = h;
  const pct = h.day && h.day.limit ? Math.min(100, (h.day.used / h.day.limit) * 100) : 0;
  const rem = h.cooldownRemainingSec || 0;
  const list = s.services || [];

  const cards = list.map((svc, i) => {
    let stockTxt, paused = false;
    if (svc.displayStatus === 'awaiting_restock') { stockTxt = t('awaitingRestock'); paused = true; }
    else if (svc.displayStatus === 'out_of_stock') { stockTxt = t('outOfStock'); paused = true; }
    else if (svc.displayStatus === 'disabled') { stockTxt = t('disabled'); paused = true; }
    else stockTxt = t('codesLeft', { n: svc.codesLeft });

    const thumb = svc.logo
      ? `<img class="service-card-img" src="${esc(svc.logo)}" alt="${esc(svc.name)}" loading="lazy" data-fallback="${esc(initial(svc.name))}" />`
      : `<div class="service-card-img placeholder">${esc(initial(svc.name))}</div>`;

    return `<article class="service-card ${paused ? 'is-paused' : ''}" style="animation-delay:${(i * 0.04).toFixed(2)}s">
      ${thumb}
      <div class="service-card-body">
        <div class="service-card-name">${esc(svc.name)}</div>
        <div class="service-card-stock">${stockTxt}</div>
        <button class="btn-3d ${paused ? 'btn-3d-ghost' : 'btn-3d-green'} btn-3d-md btn-generate ${rem > 0 && !paused ? 'is-cooldown' : ''}"
          ${paused ? 'disabled' : ''} data-action="generate:${svc.id}">${paused ? stockTxt : t('generate')}</button>
      </div>
    </article>`;
  }).join('');

  el.innerHTML = `
    ${sectionHead(t('servicesTitle'), t('servicesDesc'))}
    <div class="services-top">
      <div class="quota-card">
        <div class="quota-row">
          <span class="quota-label">${t('dailyGenerations')}</span>
          <span class="quota-value">${t('todayCount', { used: h.day.used, limit: h.day.limit })}</span>
        </div>
        <div class="quota-bar"><div class="quota-bar-fill ${barState(pct)}" style="width:${pct}%"></div></div>
        <div class="quota-meta">
          <span>${t('yourCooldown', { v: fmtCooldown(h.cooldownSec) })}</span>
          <span class="quota-perk">${rem > 0 ? t('readyIn', { v: fmtRemaining(rem) }) : t('readyNow')}</span>
        </div>
      </div>
      ${cooldownTipHtml()}
    </div>
    <div class="services-wrap">
      ${list.length
        ? `<div class="services-grid">${cards}</div>`
        : `<div class="services-empty">${t('servicesEmpty')}</div>`}
    </div>`;
  bindImageFallbacks(el);
}

// LeakBySunah
function bindImageFallbacks(root) {
  $$('img[data-fallback]', root).forEach((img) => {
    img.onerror = () => {
      const d = document.createElement('div');
      d.className = 'service-card-img placeholder';
      d.textContent = img.dataset.fallback;
      img.replaceWith(d);
    };
  });
}

// LeakBySunah
async function doGenerate(serviceId, btn) {
  const { ok, status, data } = await api('POST', '/api/generate', { serviceId });
  if (ok) {
    App.stats.generated += 1;
    showCodeModal(data);
    renderServices(sectionEl('services'));
    return;
  }
  if (btn) btn.disabled = false;
  if (status === 401) { boot(); return; }
  if (data.error === 'cooldown') return showAlertModal({
    title: t('a_cooldownTitle'),
    message: t('a_cooldownMsg'),
    seconds: data.remainingSec,
    link: true,
  });
  if (data.error === 'daily_limit') return showAlertModal({
    title: t('a_dailyTitle'),
    message: t('a_dailyMsg', { limit: data.limit }),
    link: true,
  });
  const map = {
    banned: ['t_banned', 'err'], out_of_stock: ['t_outOfStock', 'err'],
    awaiting_restock: ['t_restock', 'warn'], disabled: ['t_restock', 'warn'],
  };
  const m = map[data.error];
  toast(m ? t(m[0]) : t('t_error'), m ? m[1] : 'err');
}

// ── Ranking ─────────────────────────────────────────────────────────

// LeakBySunah
function podiumSlot(u, place) {
  if (!u) return `<div class="podium-slot slot-${place}"></div>`;
  const metal = place === 1 ? 'gold' : place === 2 ? 'silver' : 'bronze';
  const isMe = App.me && u.username === App.me.username;
  return `<div class="podium-slot slot-${place} ${isMe ? 'is-me' : ''}">
    ${place === 1 ? '<span class="podium-crown">&#9819;</span>' : ''}
    <span class="podium-medal podium-medal-${metal}">${metal}</span>
    <div class="podium-avatar-ring ring-${metal}">${avatarHtml(u, 'podium-avatar')}</div>
    <div class="podium-name">${esc(u.username)}</div>
    <div class="podium-gen">${t('gensCount', { n: u.gens })}</div>
  </div>`;
}

function podiumBlock(place) {
  return `<div class="podium-block block-${place}">
    <div class="podium-block-body">
      <div class="podium-block-top"><span class="podium-block-num">${place}</span></div>
      <div class="podium-block-edge"></div>
    </div>
  </div>`;
}

// LeakBySunah
async function renderRanking(el) {
  const { data } = await api('GET', '/api/ranking');
  const r = data.ranking || [];
  const head = sectionHead(t('rankingTitle'), t('rankingDesc'));

  if (!r.length) {
    el.innerHTML = `${head}<div class="ranking-wrap"><div class="ranking-empty">${t('rankingEmpty')}</div></div>`;
    return;
  }

  const rest = r.slice(3).map((u) => {
    const isMe = App.me && u.username === App.me.username;
    return `<div class="rank-rest-item ${isMe ? 'is-me' : ''}">
      <span class="rank-rest-pos">${u.rank}</span>
      ${avatarHtml(u, 'rank-rest-avatar')}
      <span class="rank-rest-name">${esc(u.username)}</span>
      <span class="rank-rest-gen">${u.gens}</span>
    </div>`;
  }).join('');

  el.innerHTML = `
    ${head}
    <div class="ranking-wrap">
      <div class="podium">
        <div class="podium-glow"></div>
        <div class="podium-slots">
          ${podiumSlot(r[1], 2)}${podiumSlot(r[0], 1)}${podiumSlot(r[2], 3)}
        </div>
        <div class="podium-scene">
          <div class="podium-blocks">
            ${podiumBlock(2)}${podiumBlock(1)}${podiumBlock(3)}
          </div>
        </div>
        <div class="podium-floor">
          <div class="podium-floor-top"></div>
          <div class="podium-floor-edge"></div>
        </div>
      </div>
      ${rest ? `<div class="ranking-rest">${rest}</div>` : ''}
    </div>`;
}

// ── Historique ──────────────────────────────────────────────────────

// LeakBySunah
async function renderHistory(el) {
  const { data } = await api('GET', '/api/history');
  const items = data.items || [];
  const head = sectionHead(t('historyTitle'), t('historyDesc'));

  if (!items.length) {
    el.innerHTML = `${head}<div class="history-wrap"><div class="history-empty">${t('historyEmpty')}</div></div>`;
    return;
  }

  el.innerHTML = `
    ${head}
    <div class="history-wrap">
      <div class="history-list">${items.map((g) => `
        <div class="history-item">
          <div class="history-item-info">
            <div class="history-item-service">${esc(g.serviceName)}</div>
            <div class="history-item-account">${esc(g.code)}</div>
          </div>
          <span class="history-item-date">${esc(fmtDate(g.at))}</span>
          <button class="btn-3d btn-3d-ghost btn-3d-sm btn-history-copy" data-action="copy" data-code="${esc(g.code)}">${t('copy')}</button>
        </div>`).join('')}</div>
    </div>`;
}

// ── Admin ───────────────────────────────────────────────────────────

// LeakBySunah
const ADMIN_TABS = ['users', 'services', 'export', 'discord'];

async function renderAdmin(el) {
  const tab = (id, label) =>
    `<button class="admin-tab ${App.adminTab === id ? 'active' : ''}" data-action="admin-tab:${id}">${label}</button>`;
  el.innerHTML = `
    ${sectionHead(t('adminPanel'), t('manageDesc'))}
    <div class="admin-tabs">
      ${tab('users', t('tab_users'))}${tab('services', t('tab_services'))}
      ${tab('export', t('tab_export'))}${tab('discord', t('tab_discord'))}
    </div>
    ${ADMIN_TABS.map((id) => `<div class="admin-panel ${App.adminTab === id ? 'active' : ''}" id="admin-panel-${id}"></div>`).join('')}`;
  renderAdminPanel();
}

function adminPanelEl(id = App.adminTab) { return $('#admin-panel-' + id); }

function renderAdminPanel() {
  const el = adminPanelEl();
  if (!el) return;
  if (App.adminTab === 'users') return adminUsers(el);
  if (App.adminTab === 'services') return adminServices(el);
  if (App.adminTab === 'export') return adminExport(el);
  if (App.adminTab === 'discord') return adminDiscord(el);
}

// LeakBySunah
async function adminUsers(el) {
  if (!el) return;
  const q = encodeURIComponent(App.adminUserQuery);
  const { data } = await api('GET', `/api/admin/users?q=${q}&filter=${App.adminUserFilter}`);
  const users = data.users || [];
  const seg = (id, label) =>
    `<button class="admin-filter-btn ${App.adminUserFilter === id ? 'active' : ''}" data-action="admin-filter:${id}">${label}</button>`;

  const items = users.map((u) => `
    <div class="admin-user-item ${u.banned ? 'is-banned' : ''}">
      ${avatarHtml(u, 'admin-user-avatar')}
      <div class="admin-user-info">
        <div class="admin-user-top">
          <span class="admin-user-name">${esc(u.username)}</span>
          ${u.isAdmin ? `<span class="admin-user-badge badge-admin">${t('a_admin')}</span>` : ''}
          <span class="admin-user-badge ${u.banned ? 'badge-banned' : 'badge-active'}">${u.banned ? t('a_banned') : t('a_active')}</span>
        </div>
        <p class="admin-user-meta">
          <span class="admin-user-id">${esc(u.discordId || u.id)}</span>
          <span class="admin-user-sep">·</span>${t('gensCount', { n: u.gensCount })}
          <span class="admin-user-sep">·</span>${u.cooldownSec == null ? t('a_default') : fmtCooldown(u.cooldownSec)}
        </p>
      </div>
      <div class="admin-user-actions">
        ${u.banned
          ? `<button class="btn-3d btn-3d-ghost btn-3d-sm" data-action="user-unban" data-id="${u.id}">${t('unban')}</button>`
          : `<button class="btn-3d btn-3d-danger btn-3d-sm" data-action="user-ban" data-id="${u.id}">${t('ban')}</button>`}
        <button class="btn-3d btn-3d-ghost btn-3d-sm" data-action="user-admin" data-id="${u.id}" data-val="${u.isAdmin ? '0' : '1'}">${u.isAdmin ? t('rmAdmin') : t('mkAdmin')}</button>
        <button class="btn-3d btn-3d-ghost btn-3d-sm" data-action="user-cooldown" data-id="${u.id}">${t('th_cooldown')}</button>
        <button class="btn-3d btn-3d-danger btn-3d-sm" data-action="user-del" data-id="${u.id}">${t('del')}</button>
      </div>
    </div>`).join('');

  el.innerHTML = `
    <div class="admin-panel-card">
      <div class="admin-users-toolbar">
        <input class="field-input admin-users-search" id="user-search" placeholder="${t('searchUsers')}" value="${esc(App.adminUserQuery)}" />
        <div class="admin-users-filters">${seg('all', t('allUsers'))}${seg('active', t('a_active'))}${seg('banned', t('a_banned'))}</div>
      </div>
      <p class="admin-users-summary">${t('usersFound', { n: users.length })}</p>
      ${users.length ? `<div class="admin-users-list">${items}</div>` : `<div class="admin-empty">${t('noUsers')}</div>`}
    </div>`;

  const search = $('#user-search');
  if (search) {
    search.oninput = debounce((e) => { App.adminUserQuery = e.target.value; adminUsers(el); }, 250);
    search.focus();
    const v = search.value; search.value = ''; search.value = v;
  }
}

// LeakBySunah
function statusOptions(cur) {
  return `
    <option value="active" ${cur === 'active' ? 'selected' : ''}>${t('st_active')}</option>
    <option value="awaiting_restock" ${cur === 'awaiting_restock' ? 'selected' : ''}>${t('st_restock')}</option>
    <option value="disabled" ${cur === 'disabled' ? 'selected' : ''}>${t('st_disabled')}</option>`;
}

// LeakBySunah
async function adminServices(el) {
  if (!el) return;
  const { data } = await api('GET', '/api/admin/services');
  const list = data.services || [];
  App.adminServices = list;

  const low = list.filter((s) => s.status === 'active' && s.codesLeft < 5);

  const items = list.map((s) => {
    const paused = s.status !== 'active';
    const isLow = !paused && s.codesLeft < 5;
    const thumb = s.logo
      ? `<img class="admin-item-img" src="${esc(s.logo)}" alt="" />`
      : `<div class="admin-item-img avatar-fallback" style="background:${esc(s.color)}">${esc(initial(s.name))}</div>`;
    return `<div class="admin-item ${isLow ? 'is-low-stock' : ''} ${paused ? 'is-paused' : ''}">
      <div class="admin-item-info">
        ${thumb}
        <div class="admin-item-sub">
          <span class="admin-item-name">${esc(s.name)}</span>
          <span class="admin-item-stock">${t('stockLabel', { n: s.codesLeft })} · ${t('genLabel', { n: s.generatedCount })}</span>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="btn-3d btn-3d-ghost btn-3d-sm" data-action="svc-edit" data-id="${s.id}">${t('edit')}</button>
        <button class="btn-3d btn-3d-green btn-3d-sm" data-action="svc-stock" data-id="${s.id}">${t('stock')}</button>
        <button class="btn-3d btn-3d-danger btn-3d-sm" data-action="svc-del" data-id="${s.id}">${t('del')}</button>
      </div>
    </div>`;
  }).join('');

  const alert = low.length
    ? `<div class="admin-stock-alert">${t('stockAlert', { n: low.length })} <strong>${low.map((s) => esc(s.name)).join(', ')}</strong></div>`
    : '';

  el.innerHTML = `
    ${alert}
    <div class="admin-layout">
      <div class="admin-form">
        <div class="admin-form-title">${t('newService')}</div>
        <div class="field">
          <label class="field-label" for="new-name">${t('f_name')}</label>
          <input class="field-input" id="new-name" placeholder="Netflix, Spotify, ..." />
        </div>
        <div class="field">
          <label class="field-label" for="new-logo">${t('f_logo')}</label>
          <input class="field-input" id="new-logo" placeholder="https://.../logo.png" />
          <span class="field-hint">${t('f_logo_h')}</span>
        </div>
        <div class="admin-security-grid">
          <div class="field">
            <label class="field-label" for="new-status">${t('f_status')}</label>
            <select class="field-input" id="new-status">${statusOptions('active')}</select>
          </div>
          <div class="field">
            <label class="field-label" for="new-color">${t('f_color')}</label>
            <input class="field-input" type="color" id="new-color" value="#3d9fff" />
          </div>
        </div>
        <div class="admin-security-actions">
          <button class="btn-3d btn-3d-green btn-3d-md" data-action="svc-create">${t('addService')}</button>
        </div>
      </div>
      <div class="admin-list-wrap">
        <div class="admin-form-title">${t('tab_services')}</div>
        ${list.length ? `<div class="admin-list">${items}</div>` : `<div class="admin-empty">${t('noServices')}</div>`}
      </div>
    </div>`;
}

// LeakBySunah
async function adminExport(el) {
  if (!el) return;
  const card = (title, desc, count, href) => `<div class="admin-members-export">
    <div class="admin-force-info">
      <div class="admin-form-title" style="margin-bottom:0">${title}</div>
      <p class="admin-members-desc">${desc}</p>
      <p class="admin-members-count">${count}</p>
    </div>
    <a class="btn-3d btn-3d-green btn-3d-md" href="${href}">${t('download')}</a>
  </div>`;

  el.innerHTML = `
    <p class="admin-users-summary">${t('exportTitle')}</p>
    ${card(t('exp_users'), t('exp_users_d'), t('usersFound', { n: App.stats.users }), '/api/admin/export/users.csv')}
    ${card(t('exp_gens'), t('exp_gens_d'), t('gensCount', { n: App.stats.generated }), '/api/admin/export/generations.csv')}
    ${card(t('exp_stock'), t('exp_stock_d'), t('servicesCount', { n: App.stats.services }), '/api/admin/export/stock.csv')}`;
}

// LeakBySunah
async function adminDiscord(el) {
  if (!el) return;
  const [{ data: d }, { data: st }] = await Promise.all([
    api('GET', '/api/admin/discord'), api('GET', '/api/admin/settings'),
  ]);

  el.innerHTML = `
    <div class="admin-panel-card" style="margin-bottom:1.5rem">
      <div class="admin-discord-head">
        <div class="admin-form-title" style="margin-bottom:0">${t('tab_discord')}</div>
      </div>
      <div class="field">
        <label class="field-label" for="d-invite">${t('d_invite')}</label>
        <input class="field-input" id="d-invite" value="${esc(d.inviteUrl)}" placeholder="https://discord.gg/..." />
        <span class="field-hint">${t('d_invite_h')}</span>
      </div>
      <div class="field">
        <label class="field-label" for="d-webhook">${t('d_webhook')}</label>
        <input class="field-input" id="d-webhook" value="${esc(d.webhookUrl)}" placeholder="https://discord.com/api/webhooks/..." />
        <span class="field-hint">${t('d_webhook_h')}</span>
      </div>
      <dl class="admin-discord-status">
        <div class="admin-discord-row">
          <dt>${t('d_oauth')}</dt>
          <dd>${d.oauthConfigured ? t('d_configured') : t('d_notconfigured')}</dd>
        </div>
      </dl>
      <p class="admin-security-meta">${t('d_oauth_h')}</p>
      <div class="admin-security-actions">
        <button class="btn-3d btn-3d-green btn-3d-md" data-action="discord-save">${t('save')}</button>
      </div>
    </div>

    <div class="admin-panel-card">
      <div class="admin-form-title">${t('settings')}</div>
      <div class="admin-security-grid admin-security-form">
        <div class="field">
          <label class="field-label" for="s-daily">${t('s_dailyLimit')}</label>
          <input class="field-input" id="s-daily" type="number" min="0" value="${st.dailyLimit}" />
        </div>
        <div class="field">
          <label class="field-label" for="s-cooldown">${t('s_cooldown')}</label>
          <input class="field-input" id="s-cooldown" type="number" min="0" value="${st.defaultCooldownSec}" />
        </div>
        <div class="field">
          <label class="field-label" for="s-users">${t('s_baseUsers')}</label>
          <input class="field-input" id="s-users" type="number" min="0" value="${st.baseUsers}" />
        </div>
        <div class="field">
          <label class="field-label" for="s-gen">${t('s_baseGen')}</label>
          <input class="field-input" id="s-gen" type="number" min="0" value="${st.baseGenerated}" />
        </div>
      </div>
      <div class="admin-security-actions">
        <button class="btn-3d btn-3d-green btn-3d-md" data-action="settings-save">${t('save')}</button>
      </div>
    </div>`;
}

// ── Modales ─────────────────────────────────────────────────────────

// LeakBySunah
function openModal(html) {
  closeModal(true);
  $('#modal-root').innerHTML = `<div class="modal-backdrop" data-action="close-modal"></div>${html}`;
  setTimeout(() => {
    $$('#modal-root .modal-backdrop, #modal-root .modal').forEach((el) => el.classList.add('active'));
  }, 10);
}

function closeModal(instant) {
  if (App.alertTimer) { clearInterval(App.alertTimer); App.alertTimer = null; }
  const root = $('#modal-root');
  if (!root || !root.innerHTML) return;
  if (instant) { root.innerHTML = ''; return; }
  $$('#modal-root .modal-backdrop, #modal-root .modal').forEach((el) => el.classList.remove('active'));
  setTimeout(() => { if (root) root.innerHTML = ''; }, 300);
}

function modalHead(title) {
  return `<div class="modal-head">
    <h3>${title}</h3>
    <button class="panel-close" data-action="close-modal" aria-label="${t('close')}">×</button>
  </div>`;
}

// LeakBySunah
function showCodeModal(data) {
  openModal(`<div class="modal" id="code-modal">
    ${modalHead(t('codeReady'))}
    <div class="modal-service">${t('codeReadySub', { svc: esc(data.serviceName) })}</div>
    <div class="account-box">
      <code>${esc(data.code)}</code>
      <button class="btn-3d btn-3d-ghost btn-3d-sm" data-action="copy" data-code="${esc(data.code)}">${t('copy')}</button>
    </div>
    <div class="alert-actions">
      <button class="btn-3d btn-3d-green btn-3d-md" data-action="copy" data-code="${esc(data.code)}">${t('copyCode')}</button>
      <button class="btn-3d btn-3d-ghost btn-3d-md" data-action="close-modal">${t('close')}</button>
    </div>
  </div>`);
}

// LeakBySunah
function showAlertModal({ title, message, seconds, link }) {
  const inv = App.discordInvite || '';
  openModal(`<div class="modal" id="alert-modal">
    ${modalHead(title)}
    <div class="modal-body">
      <p class="alert-message">${message}</p>
      ${seconds != null ? `<p class="alert-timer" id="alert-timer">${fmtClock(seconds)}</p>` : ''}
      <div class="alert-actions">
        <button class="btn-3d btn-3d-ghost btn-3d-md" data-action="close-modal">${t('close')}</button>
        <a class="alert-link" href="${esc(inv || '#')}" target="_blank" rel="noopener" ${link && inv ? '' : 'hidden'}>${t('reduceCooldown')}</a>
      </div>
    </div>
  </div>`);

  if (seconds != null) {
    // Echeance absolue : un onglet en arriere-plan throttle setInterval,
    // un simple decrement par tick deriverait.
    const deadline = Date.now() + seconds * 1000;
    App.alertTimer = setInterval(() => {
      const left = Math.ceil((deadline - Date.now()) / 1000);
      const el = $('#alert-timer');
      if (!el) { clearInterval(App.alertTimer); App.alertTimer = null; return; }
      el.textContent = fmtClock(left);
      if (left <= 0) {
        clearInterval(App.alertTimer); App.alertTimer = null;
        closeModal();
        renderServices(sectionEl('services'));
      }
    }, 1000);
  }
}

// LeakBySunah
function showServiceModal(svc) {
  openModal(`<div class="modal" id="svc-modal">
    ${modalHead(esc(svc.name))}
    <div class="field">
      <label class="field-label" for="e-name">${t('f_name')}</label>
      <input class="field-input" id="e-name" value="${esc(svc.name)}" />
    </div>
    <div class="field">
      <label class="field-label" for="e-logo">${t('f_logo')}</label>
      <input class="field-input" id="e-logo" value="${esc(svc.logo || '')}" placeholder="https://.../logo.png" />
    </div>
    <div class="admin-security-grid">
      <div class="field">
        <label class="field-label" for="e-status">${t('f_status')}</label>
        <select class="field-input" id="e-status">${statusOptions(svc.status)}</select>
      </div>
      <div class="field">
        <label class="field-label" for="e-color">${t('f_color')}</label>
        <input class="field-input" type="color" id="e-color" value="${esc(svc.color)}" />
      </div>
    </div>
    <div class="stock-modal-actions">
      <button class="btn-3d btn-3d-ghost btn-3d-sm" data-action="close-modal">${t('close')}</button>
      <button class="btn-3d btn-3d-green btn-3d-sm" data-action="svc-save" data-id="${svc.id}">${t('save')}</button>
    </div>
  </div>`);
}

// LeakBySunah
function showStockModal(svc) {
  openModal(`<div class="modal modal-stock" id="stock-modal">
    ${modalHead(t('stock') + ' — ' + esc(svc.name))}
    <p class="stock-modal-hint">${t('pasteCodes')}</p>
    <p class="stock-modal-count">${t('stockLabel', { n: svc.codesLeft })}</p>
    <textarea class="field-textarea stock-textarea" id="stock-codes" placeholder="CODE-1&#10;CODE-2&#10;CODE-3"></textarea>
    <div class="stock-modal-actions">
      <button class="btn-3d btn-3d-danger btn-3d-sm" data-action="svc-clear" data-id="${svc.id}">${t('clearStock')}</button>
      <button class="btn-3d btn-3d-green btn-3d-sm" data-action="svc-addcodes" data-id="${svc.id}">${t('addCodes')}</button>
    </div>
  </div>`);
  setTimeout(() => { const ta = $('#stock-codes'); if (ta) ta.focus(); }, 60);
}

function findService(id) { return App.adminServices.find((s) => s.id === id); }

// ── Évènements ──────────────────────────────────────────────────────

// LeakBySunah
document.addEventListener('click', async (e) => {
  const card = $('#profile-card');
  if (card && card.classList.contains('open') && !e.target.closest('.profile-card')) card.classList.remove('open');

  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.getAttribute('data-action');
  if (action === 'noop') { e.preventDefault(); return; }

  // LeakBySunah
  if (action.startsWith('lang:')) {
    window.setLang(action.split(':')[1]);
    App.me ? renderShell() : renderLanding();
    return;
  }
  if (action === 'toggle-profile') {
    if (card) card.classList.toggle('open');
    return;
  }
  if (action.startsWith('nav:')) {
    e.preventDefault();
    if (card) card.classList.remove('open');
    switchSection(action.split(':')[1]);
    return;
  }

  // LeakBySunah
  if (action === 'login-demo' || action === 'login-admin') {
    target.disabled = true;
    loginOverlay(true);
    App.loginError = '';
    const { ok } = await api('POST', action === 'login-admin' ? '/auth/demo-admin' : '/auth/demo');
    if (!ok) { loginOverlay(false); App.loginError = t('t_error'); renderLanding(); return; }
    await boot();
    return;
  }
  if (action === 'logout') { await api('POST', '/auth/logout'); App.me = null; App.view = 'hub'; await boot(); return; }

  if (action.startsWith('generate:')) {
    target.disabled = true;
    await doGenerate(action.split(':')[1], target);
    return;
  }
  if (action === 'close-modal') { closeModal(); return; }
  if (action === 'copy') { copyText(target.getAttribute('data-code')); return; }

  // LeakBySunah
  if (action.startsWith('admin-tab:')) {
    App.adminTab = action.split(':')[1];
    $$('.admin-tab').forEach((b) => b.classList.toggle('active', b.dataset.action === action));
    ADMIN_TABS.forEach((id) => {
      const p = adminPanelEl(id);
      if (p) p.classList.toggle('active', id === App.adminTab);
    });
    renderAdminPanel();
    return;
  }
  if (action.startsWith('admin-filter:')) {
    App.adminUserFilter = action.split(':')[1];
    adminUsers(adminPanelEl('users'));
    return;
  }

  // LeakBySunah
  if (action === 'user-ban') { await api('POST', `/api/admin/users/${target.dataset.id}/ban`); adminUsers(adminPanelEl('users')); return; }
  if (action === 'user-unban') { await api('POST', `/api/admin/users/${target.dataset.id}/unban`); adminUsers(adminPanelEl('users')); return; }
  if (action === 'user-admin') { await api('POST', `/api/admin/users/${target.dataset.id}/admin`, { value: target.dataset.val === '1' }); adminUsers(adminPanelEl('users')); return; }
  if (action === 'user-del') {
    if (!confirm(t('del') + ' ?')) return;
    await api('DELETE', `/api/admin/users/${target.dataset.id}`);
    await refreshStats();
    adminUsers(adminPanelEl('users')); return;
  }
  if (action === 'user-cooldown') {
    const v = prompt(t('s_cooldown'), '');
    if (v === null) return;
    await api('POST', `/api/admin/users/${target.dataset.id}/cooldown`, { seconds: v.trim() === '' ? null : v.trim() });
    toast(t('t_saved'), 'ok'); adminUsers(adminPanelEl('users')); return;
  }

  // LeakBySunah
  if (action === 'svc-create') {
    const name = $('#new-name').value.trim();
    if (!name) { toast(t('nameRequired'), 'warn'); $('#new-name').focus(); return; }
    await api('POST', '/api/admin/services', {
      name,
      logo: $('#new-logo').value.trim(),
      color: $('#new-color').value,
      status: $('#new-status').value,
    });
    toast(t('t_saved'), 'ok');
    await refreshStats();
    adminServices(adminPanelEl('services')); return;
  }
  if (action === 'svc-edit') { const s = findService(target.dataset.id); if (s) showServiceModal(s); return; }
  if (action === 'svc-stock') { const s = findService(target.dataset.id); if (s) showStockModal(s); return; }
  if (action === 'svc-save') {
    await api('PUT', `/api/admin/services/${target.dataset.id}`, {
      name: $('#e-name').value,
      logo: $('#e-logo').value,
      color: $('#e-color').value,
      status: $('#e-status').value,
    });
    closeModal();
    toast(t('t_saved'), 'ok'); adminServices(adminPanelEl('services')); return;
  }
  if (action === 'svc-addcodes') {
    const codes = $('#stock-codes').value;
    if (!codes.trim()) return;
    const { data } = await api('POST', `/api/admin/services/${target.dataset.id}/codes`, { codes });
    closeModal();
    toast(t('t_added', { n: data.added }), 'ok'); adminServices(adminPanelEl('services')); return;
  }
  if (action === 'svc-clear') {
    if (!confirm(t('clearStock') + ' ?')) return;
    await api('DELETE', `/api/admin/services/${target.dataset.id}/codes`);
    closeModal();
    toast(t('t_cleared'), 'ok'); adminServices(adminPanelEl('services')); return;
  }
  if (action === 'svc-del') {
    if (!confirm(t('deleteService') + ' ?')) return;
    await api('DELETE', `/api/admin/services/${target.dataset.id}`);
    await refreshStats();
    adminServices(adminPanelEl('services')); return;
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
    await refreshStats();
    toast(t('t_saved'), 'ok'); return;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const card = $('#profile-card');
  if (card) card.classList.remove('open');
  closeModal();
});

// ── Boot ────────────────────────────────────────────────────────────

async function refreshStats() {
  const { data } = await api('GET', '/api/stats');
  if (data && data.users != null) App.stats = data;
}

// LeakBySunah
async function boot() {
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
    App.loginError = t('t_discordNotConfigured');
    history.replaceState({}, '', '/');
  } else if (p.get('error') === 'discord_error') {
    App.loginError = t('t_error');
    history.replaceState({}, '', '/');
  }
})();

boot();
