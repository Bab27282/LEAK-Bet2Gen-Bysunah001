// LeakBySunah
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let db = null;
let saveTimer = null;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function load(seedFactory) {
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (err) {
      // LeakBySunah
      const backup = DB_FILE + '.corrupted-' + Date.now();
      try { fs.renameSync(DB_FILE, backup); } catch {}
      console.error('[store] db.json unreadable, backed up to', backup, '- reseeding.');
      db = seedFactory();
      saveNow();
    }
  } else {
    db = seedFactory();
    saveNow();
  }
  return db;
}

export function get() {
  if (!db) throw new Error('store not loaded yet');
  return db;
}

// LeakBySunah
export function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveNow();
  }, 120);
}

export function saveNow() {
  ensureDir();
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE); // LeakBySunah
}

// LeakBySunah
export function flush() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (db) saveNow();
}
