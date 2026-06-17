// make-icons.mjs — render PNG icons from public/icons/icon.svg using sharp.
//   npm i -D sharp   (already in devDeps)
//   node scripts/make-icons.mjs
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICONS = join(fileURLToPath(new URL('..', import.meta.url)), 'public', 'icons');
const svg = await readFile(join(ICONS, 'icon.svg'));

const jobs = [
  { out: 'icon-180.png', size: 180 },
  { out: 'icon-192.png', size: 192 },
  { out: 'icon-512.png', size: 512 },
  { out: 'icon-maskable-512.png', size: 512, pad: 0.16 }, // safe-zone padding for maskable
];

for (const j of jobs) {
  let img = sharp(svg, { density: 384 }).resize(j.size, j.size);
  if (j.pad) {
    const inner = Math.round(j.size * (1 - j.pad * 2));
    img = sharp(svg, { density: 384 }).resize(inner, inner).extend({
      top: Math.round((j.size - inner) / 2), bottom: Math.round((j.size - inner) / 2),
      left: Math.round((j.size - inner) / 2), right: Math.round((j.size - inner) / 2),
      background: '#0c0a07',
    });
  }
  await img.png().toFile(join(ICONS, j.out));
  console.log('  ✓', j.out);
}
