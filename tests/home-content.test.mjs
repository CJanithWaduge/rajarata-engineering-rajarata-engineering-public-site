import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('reads seeded featured project text without replacing fallback artwork', async () => {
  const [parser, watcher] = await Promise.all([
    readFile(
    new URL('../src/lib/homeContent.ts', import.meta.url),
    'utf8',
    ),
    readFile(
    new URL('../src/lib/watchHomeContent.ts', import.meta.url),
    'utf8',
    ),
  ])
  assert.match(parser, /const imageUrl = readString\(record\.imageUrl\)\.trim\(\)/)
  assert.match(
    parser,
    /if \(\(imageUrl && !image\) \|\| !category \|\| !venue \|\| !topic\) return null/,
  )
  assert.match(watcher, /if \(project\.image\) \{/)
  assert.match(watcher, /data-home-project-topic/)
})

test('renders admin-picked internet icons through Iconify SVG masks', async () => {
  const watcher = await readFile(
    new URL('../src/lib/watchHomeContent.ts', import.meta.url),
    'utf8',
  );
  const iconify = await readFile(new URL('../src/lib/iconify.ts', import.meta.url), 'utf8');
  const globalCss = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');

  assert.match(iconify, /material-symbols:\[a-z0-9\]\+/);
  assert.match(iconify, /api\.iconify\.design\/material-symbols/);
  assert.match(watcher, /applyServiceIcon/);
  assert.match(watcher, /iconify-symbol/);
  assert.match(watcher, /iconifyIconUrl/);
  assert.match(watcher, /style\.setProperty/);
  assert.match(globalCss, /\.iconify-symbol/);
  assert.match(globalCss, /mask-image/);
});

test('hydrates the Home closing call button from site settings', async () => {
  const component = await readFile(
    new URL('../src/components/home/ClosingCta.astro', import.meta.url),
    'utf8',
  )

  assert.match(component, /data-site-phone-call/)
  assert.match(component, /data-site-phone-call-value/)
})
