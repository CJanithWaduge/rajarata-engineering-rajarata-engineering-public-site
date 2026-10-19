import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));

test('Spark Hosting config serves only static public output and does not deploy backend services', async () => {
  const config = JSON.parse(await readFile(path.join(root, 'firebase.spark.json'), 'utf8'));
  assert.equal(config.hosting.public, 'dist/client');
  assert.equal(config.functions, undefined);
  assert.equal(config.storage, undefined);
  assert.equal(config.hosting.rewrites, undefined);
  assert.equal(config.hosting.headers[0].source, '**');
  assert.ok(config.hosting.headers[0].headers.some(
    (header) => header.key === 'X-Robots-Tag' && header.value.includes('noindex'),
  ));
});

test('Spark contact page uses direct configured contact links without an inquiry form', async () => {
  const page = await readFile(path.join(root, 'src', 'pages', 'contact.astro'), 'utf8');
  const hero = await readFile(
    path.join(root, 'src', 'components', 'contact', 'ContactHero.astro'),
    'utf8',
  );
  const options = await readFile(
    path.join(root, 'src', 'components', 'contact', 'OperationalDesks.astro'),
    'utf8',
  );
  const environmentExample = await readFile(path.join(root, '.env.example'), 'utf8');
  assert.doesNotMatch(page, /TechnicalQuotation|EmergencySupport|VisitorInformation/);
  await assert.rejects(readFile(path.join(root, 'src', 'components', 'contact', 'TechnicalQuotation.astro')));
  await assert.rejects(readFile(path.join(root, 'src', 'lib', 'contactForm.ts')));
  assert.match(options, /whatsapp\.href/);
  assert.match(options, /phone\.href/);
  assert.match(options, /const whatsapp = whatsappContact/);
  assert.match(options, /const phone = phoneContact/);
  assert.match(options, /w-full max-w-\[42rem\]/);
  assert.doesNotMatch(hero, /No forms|Message or call/);
  assert.doesNotMatch(options, /Prefer to start with a quick message/);
  assert.match(options, /Location details to be confirmed/);
  assert.doesNotMatch(options, /maps\.google\.com|maps\.app\.goo\.gl/);
  assert.match(environmentExample, /^PUBLIC_WHATSAPP_NUMBER=94771234567$/m);
  assert.match(environmentExample, /^PUBLIC_CONTACT_PHONE=\+94 25 112 3456$/m);
  assert.match(environmentExample, /^PUBLIC_DEMO_MODE=false$/m);
});

test('Spark build runs in production mode and rejects sample or placeholder copy', async () => {
  const script = await readFile(path.join(root, 'scripts', 'build-spark.mjs'), 'utf8');
  assert.match(script, /PUBLIC_DEMO_MODE:\s*'false'/);
  assert.match(script, /Owner-approved publishing is blocked by sample or placeholder copy/);
  assert.match(script, /The retired site-wide demo-content notice is still present/);
  assert.match(script, /Verified WhatsApp direct-contact link is missing/);
  assert.match(script, /Verified telephone direct-contact link is missing/);
  assert.match(script, /Unverified emergency-support messaging is present/);
});

test('Spark deploy script requires explicit project and confirmation and limits deployment to Hosting', async () => {
  const script = await readFile(path.join(root, 'scripts', 'deploy-spark.mjs'), 'utf8');
  assert.match(script, /--confirm-static-hosting-deploy/);
  assert.match(script, /--project/);
  assert.match(script, /firebase\.spark\.json/);
  assert.match(script, /--only hosting/);
  assert.match(script, /scripts\/build-spark\.mjs/);
  assert.doesNotMatch(script, /--only\s+functions/);
});
