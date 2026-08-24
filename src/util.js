import crypto from 'node:crypto';

// LeakBySunah
export function id(prefix = '') {
  return prefix + crypto.randomBytes(9).toString('hex');
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // LeakBySunah
function block() {
  let s = '';
  for (let i = 0; i < 4; i++) {
    s += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  }
  return s;
}
// LeakBySunah
export function genCode() {
  return `${block()}-${block()}-${block()}`;
}

// LeakBySunah
export function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10); // LeakBySunah
}
export function dayKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return todayStr(d);
}

// LeakBySunah
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'not_authenticated' });
  }
  next();
}

export function requireAdmin(store) {
  return (req, res, next) => {
    const uid = req.session && req.session.userId;
    if (!uid) return res.status(401).json({ error: 'not_authenticated' });
    const user = store.get().users.find((u) => u.id === uid);
    if (!user || !user.isAdmin) return res.status(403).json({ error: 'forbidden' });
    req.currentUser = user;
    next();
  };
}

export function currentUser(store, req) {
  const uid = req.session && req.session.userId;
  if (!uid) return null;
  return store.get().users.find((u) => u.id === uid) || null;
}
