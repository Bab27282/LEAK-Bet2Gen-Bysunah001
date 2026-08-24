import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as store from './src/store.js';
import { seed } from './src/seed.js';
import authRoutes from './src/routes/auth.js';
import apiRoutes from './src/routes/api.js';
import adminRoutes from './src/routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// LeakBySunah
store.load(seed);

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'bet2gen-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 30 },
}));

// LeakBySunah
app.use('/auth', authRoutes());
app.use('/api/admin', adminRoutes());
app.use('/api', apiRoutes());

// LeakBySunah
app.use(express.static(path.join(__dirname, 'public')));

// LeakBySunah
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// LeakBySunah
app.use((req, res) => res.status(404).json({ error: 'not_found' }));

const server = app.listen(PORT, () => {
  console.log('\n  Bet2Gen  by Sunah');
  console.log(`  ▶  http://localhost:${PORT}\n`);
});

// LeakBySunah
function shutdown() {
  store.flush();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
