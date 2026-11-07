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
