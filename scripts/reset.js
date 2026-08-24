// LeakBySunah
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = path.join(__dirname, '..', 'data', 'db.json');

if (fs.existsSync(db)) {
  fs.rmSync(db);
  console.log('Database reset. It will be reseeded on next `npm start`.');
} else {
  console.log('No database found — nothing to reset.');
}
