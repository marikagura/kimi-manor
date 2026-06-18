// make-icons.mjs — render the PWA PNG sizes from public/icons/icon.png
// (the gilt-fox master, 1024×1024). Run after replacing icon.png:
//   node scripts/make-icons.mjs
import sharp from 'sharp';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICONS = join(fileURLToPath(new URL('..', import.meta.url)), 'public', 'icons');
const SRC = join(ICONS, 'icon.png');

const jobs = [
  { out: 'icon-180.png', size: 180 },           // apple-touch-icon
  { out: 'icon-192.png', size: 192 },           // pwa / favicon
  { out: 'icon-512.png', size: 512 },           // pwa
  { out: 'icon-maskable-512.png', size: 512 },  // pwa maskable
];

for (const j of jobs) {
  await sharp(SRC).resize(j.size, j.size, { fit: 'cover' }).png().toFile(join(ICONS, j.out));
  console.log('  ✓', j.out);
}
