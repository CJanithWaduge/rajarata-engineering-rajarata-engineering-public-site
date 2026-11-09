import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('homepage services grid shows the three requested services', async () => {
  const homepage = await readFile(
    new URL('../src/components/home/ServicesGrid.astro', import.meta.url),
    'utf8',
  );
  const directory = await readFile(
    new URL('../src/components/services/ServicesDirectory.astro', import.meta.url),
    'utf8',
  );

  assert.match(homepage, /grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6/);
  assert.equal((homepage.match(/data-card-tilt/g) ?? []).length, 3);
  assert.match(
    homepage,
    /Residential, Commercial &amp; Industrial Electrical Installations/,
  );
  assert.match(homepage, /CCTV Camera Installation &amp; Maintenance/);
  assert.match(homepage, /MDB \/ SMDB Panel Installation/);
  assert.doesNotMatch(homepage, /Cable Tray &amp; Cable Laying/);
  const cardNumbers = [...homepage.matchAll(/<!-- Service \d{2} -->[\s\S]*?>(\d{2})<\/span\s*>/g)]
    .map(([, number]) => number);
  assert.deepEqual(cardNumbers, ['01', '02', '03']);
  assert.match(homepage, /href="\/services#service-01"/);
  assert.match(homepage, /href="\/services#service-07"/);
  assert.match(homepage, /href="\/services#service-03"/);
  assert.match(directory, /title="MDB \/ SMDB Panel Installation"/);
  assert.match(directory, /title="Cable Tray Installation & Cable Laying"/);
});
