const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'dist', 'sw.js');

if (!fs.existsSync(swPath)) {
  throw new Error('dist/sw.js not found. Run the build before bumping the cache version.');
}

const swSource = fs.readFileSync(swPath, 'utf8');
const placeholder = '__CACHE_VERSION__';

if (!swSource.includes(placeholder)) {
  throw new Error('CACHE_VERSION placeholder not found in dist/sw.js');
}

const nextVersion = new Date().toISOString();

const updatedSource = swSource.replace(placeholder, nextVersion);

fs.writeFileSync(swPath, updatedSource, 'utf8');
console.log(`Injected service worker cache version: ${placeholder} -> ${nextVersion}`);
