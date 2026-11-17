// Runs after `next build`: lists every file in out/ and writes out/sw.js from the template.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const OUT = 'out', BASE = '/antrenman';
const walk = dir => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const files = walk(OUT).map(p => relative(OUT, p).split(sep).join('/')).filter(f => f !== 'sw.js' && f !== '.nojekyll' && !f.endsWith('.map'));
// Pages are requested as /dir/, not /dir/index.html
const urls = files.map(f => `${BASE}/${f === 'index.html' ? '' : f.endsWith('/index.html') ? f.slice(0, -'index.html'.length) : f}`);
const hash = createHash('sha1');
for (const f of files) hash.update(f).update(readFileSync(join(OUT, f)));

const sw = readFileSync('scripts/sw.template.js', 'utf8')
  .replace('__VERSION__', hash.digest('hex').slice(0, 12))
  .replace('__FILES__', JSON.stringify(urls));
writeFileSync(join(OUT, 'sw.js'), sw);
console.log(`sw.js: ${urls.length} files precached`);
