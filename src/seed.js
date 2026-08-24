import { genCode, id } from './util.js';

// LeakBySunah
// LeakBySunah
function demoCodes(n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push({ id: id('c_'), code: genCode(), addedAt: Date.now() });
  return out;
}

// LeakBySunah
const SERVICES = [
  { name: 'Xbox',         slug: 'xbox',       color: '#107C10', codes: 0,   status: 'active' },
  { name: 'CapCut',       slug: 'capcut',     color: '#ff0050', codes: 126, status: 'active' },
  { name: 'Valorant',     slug: 'valorant',   color: '#ff4655', codes: 419, status: 'active' },
  { name: 'ADN',          slug: 'adn',        color: '#0099e5', codes: 56,  status: 'active' },
  { name: 'Paramount+',   slug: 'paramount',  color: '#0064ff', codes: 0,   status: 'awaiting_restock' },
  { name: 'Molotov TV',   slug: 'molotov',    color: '#ffd800', codes: 0,   status: 'active' },
  { name: 'Crunchyroll',  slug: 'crunchyroll',color: '#f47521', codes: 88,  status: 'active' },
  { name: 'Spotify',      slug: 'spotify',    color: '#1DB954', codes: 210, status: 'active' },
  { name: 'Disney+',      slug: 'disney',     color: '#113ccf', codes: 77,  status: 'active' },
  { name: 'NordVPN',      slug: 'nordvpn',    color: '#4687ff', codes: 143, status: 'active' },
];

// LeakBySunah
// LeakBySunah
const RANK_SEED = [
  { username: 'ت kari',                          gens: 2055, color: '#e7e7ea' },
  { username: 'emimi^p^',                         gens: 1449, color: '#4ade80' },
  { username: 'Hein',                             gens: 569,  color: '#c0392b' },
  { username: 'Melancolie',                       gens: 546,  color: '#8b1e1e' },
  { username: 'Legacy AutoBump',                  gens: 430,  color: '#57e389' },
  { username: 'Sans',                             gens: 407,  color: '#3b3b3b' },
  { username: 'Zer0',                             gens: 393,  color: '#6b7280' },
  { username: '8h',                               gens: 372,  color: '#cbd5e1' },
  { username: 'tpl je peu plus envoyer de msg',   gens: 340,  color: '#7c5cff' },
  { username: 'Yagami',                           gens: 322,  color: '#2c2c2c' },
];

export function seed() {
  return {
    settings: {
      dailyLimit: 50,
      defaultCooldownSec: 1800, // LeakBySunah
      baseUsers: 1577,          // LeakBySunah
      baseGenerated: 23905,     // LeakBySunah
      siteName: 'Bet2Gen',
      author: 'Sunah',
      discord: {
        inviteUrl: process.env.DISCORD_INVITE || '',
        webhookUrl: '',
        clientId: process.env.DISCORD_CLIENT_ID || '',
        // LeakBySunah
      },
    },
    services: SERVICES.map((s, i) => ({
      id: id('s_'),
      order: i,
      name: s.name,
      slug: s.slug,
      color: s.color,
      logo: '',                       // LeakBySunah
      status: s.status,               // LeakBySunah
      stock: demoCodes(s.codes),      // LeakBySunah
      generatedCount: 0,
      createdAt: Date.now(),
    })),
    rankSeed: RANK_SEED.map((r) => ({ id: id('rs_'), ...r })),
    users: [],        // LeakBySunah
    generations: [],  // LeakBySunah
  };
}
