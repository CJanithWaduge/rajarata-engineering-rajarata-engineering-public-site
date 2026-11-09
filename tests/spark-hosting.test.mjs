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

test('mutable public image assets revalidate instead of using a week-long browser cache', async () => {
  for (const filename of ['firebase.json', 'firebase.spark.json']) {
    const config = JSON.parse(await readFile(path.join(root, filename), 'utf8'));
    const imageHeaders = config.hosting.headers.find(
      (entry) => entry.source === '**/*.@(webp|png|jpg|jpeg|svg|ico)',
    );
    assert.ok(imageHeaders, `${filename} must define image cache headers`);
    assert.ok(imageHeaders.headers.some(
      (header) => header.key === 'Cache-Control' && header.value === 'no-cache',
    ));
  }
});

test('Firestore-managed content stays hidden until a server snapshot is applied', async () => {
  const css = await readFile(path.join(root, 'src', 'styles', 'global.css'), 'utf8');
  const base = await readFile(path.join(root, 'src', 'layouts', 'Base.astro'), 'utf8');
  const watcherNames = [
    'watchSiteSettings.ts',
    'watchHomeContent.ts',
    'watchServicesContent.ts',
    'watchAboutContent.ts',
    'watchProjectsContent.ts',
  ];

  assert.match(css, /html\[data-live-content="pending"\]/);
  assert.match(css, /\[data-site-phone-call\]/);
  assert.match(css, /\[data-home-project\]/);
  assert.match(css, /\[data-service-card\]/);
  assert.match(css, /\[data-about-hero-title\]/);
  assert.match(css, /\[data-project-card\]/);
  assert.match(base, /setAttribute\('data-live-content', 'pending'\)/);

  for (const watcherName of watcherNames) {
    const watcher = await readFile(path.join(root, 'src', 'lib', watcherName), 'utf8');
    assert.match(watcher, /includeMetadataChanges:\s*true/, watcherName);
    assert.match(watcher, /snapshot\.metadata\.fromCache/, watcherName);
  }
});

test('public footer uses admin-managed email and Facebook values', async () => {
  const footer = await readFile(path.join(root, 'src', 'components', 'Footer.astro'), 'utf8');
  const watcher = await readFile(path.join(root, 'src', 'lib', 'watchSiteSettings.ts'), 'utf8');
  const hydration = await readFile(path.join(root, 'src', 'lib', 'contentHydration.ts'), 'utf8');

  assert.match(footer, /data-site-email/);
  assert.match(footer, /data-site-facebook-url/);
  assert.doesNotMatch(footer, /Email and Facebook details are being confirmed/);
  assert.match(watcher, /facebookUrl: 'facebook-url'/);
  assert.match(watcher, /FIELD_ATTRIBUTES\[field\]/);
  assert.match(hydration, /\[data-site-facebook-url\]/);
  assert.match(watcher, /const data = snapshot\.data\(\) \?\? \{\}/);
});

test('all primary contact actions and direct WhatsApp links follow Site Settings', async () => {
  const primaryActionFiles = [
    'Header.astro',
    path.join('home', 'Hero.astro'),
    path.join('home', 'ClosingCta.astro'),
    path.join('about', 'AboutHero.astro'),
    path.join('about', 'AboutCta.astro'),
    path.join('projects', 'ProjectsCta.astro'),
    path.join('services', 'ServicesCta.astro'),
  ];

  for (const filename of primaryActionFiles) {
    const component = await readFile(
      path.join(root, 'src', 'components', filename),
      'utf8',
    );
    assert.match(component, /data-site-primary-contact/, filename);
  }

  const serviceCard = await readFile(
    path.join(root, 'src', 'components', 'services', 'ServiceCard.astro'),
    'utf8',
  );
  assert.doesNotMatch(serviceCard, /data-site-primary-contact/);
  assert.match(serviceCard, /data-service-toggle/);

  const button = await readFile(path.join(root, 'src', 'components', 'ui', 'Button.astro'), 'utf8');
  assert.match(button, /data-site-primary-contact=\{primaryContact/);

  for (const filename of [
    'Header.astro',
    path.join('Footer.astro'),
    path.join('about', 'AboutCta.astro'),
    path.join('contact', 'OperationalDesks.astro'),
  ]) {
    const component = await readFile(
      path.join(root, 'src', 'components', filename),
      'utf8',
    );
    assert.match(component, /data-site-whatsapp/, filename);
  }

  const watcher = await readFile(path.join(root, 'src', 'lib', 'watchSiteSettings.ts'), 'utf8');
  assert.match(watcher, /parseWhatsAppNumber\(value\)/);
  assert.match(watcher, /el\.href = whatsapp\.href/);
  assert.match(watcher, /whatsapp\.displayNumber/);
  assert.match(watcher, /querySelectorAll<HTMLAnchorElement>\([\s\S]*?\[data-site-primary-contact\]/);
  assert.match(watcher, /primaryActions\.forEach\(\(primary\) =>/);
});

test('footer uses the admin logo without rendering the obsolete fallback mark', async () => {
  const footer = await readFile(path.join(root, 'src', 'components', 'Footer.astro'), 'utf8');
  const base = await readFile(path.join(root, 'src', 'layouts', 'Base.astro'), 'utf8');
  const watcher = await readFile(path.join(root, 'src', 'lib', 'watchSiteSettings.ts'), 'utf8');

  assert.match(footer, /data-site-logo-image[\s\S]*?data-live-media/);
  assert.doesNotMatch(footer, /<Logo\b/);
  assert.match(base, /rel="icon"[^>]*data-site-favicon[^>]*data-default-href="\/favicon\.svg"/);
  assert.match(watcher, /querySelector<HTMLLinkElement>\('link\[data-site-favicon\]'\)/);
  assert.match(watcher, /favicon\.href = url \|\| favicon\.dataset\.defaultHref/);
  await assert.rejects(readFile(path.join(root, 'src', 'components', 'Logo.astro')));
});

test('scroll reveal uses short transitions and respects reduced motion', async () => {
  const css = await readFile(path.join(root, 'src', 'styles', 'global.css'), 'utf8');

  assert.match(css, /transition: transform 500ms cubic-bezier\(0\.2, 0, 0, 1\)/);
  assert.match(css, /transition: opacity 250ms cubic-bezier\(0\.2, 0, 0, 1\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(css, /transition: transform 1000ms/);
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
  assert.match(options, /Business address to be confirmed/);
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
