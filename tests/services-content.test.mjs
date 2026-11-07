import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import {
  parseServicesContent,
  parseServicesContentPatch,
  stepDescriptionForMobile,
} from '../src/lib/servicesContentParser.ts';

const ICONS = [
  'apartment',
  'precision_manufacturing',
  'developer_board',
  'linear_scale',
  'fact_check',
  'build',
  'router',
  'bolt',
];

const ANCHORS = [
  'service-01',
  'service-02',
  'service-03',
  'service-04',
  'service-05',
  'service-06',
  'service-07',
  'service-08',
];

function validDocument() {
  return {
    hero: {
      eyebrow: 'Engineering services',
      title: 'Electrical engineering services',
      intro: 'A complete electrical scope.',
      quickLinks: ANCHORS.slice(0, 4).map((target, index) => ({
        label: `Quick link ${index + 1}`,
        icon: ICONS[index],
        target,
      })),
      metrics: Array.from({ length: 4 }, (_, index) => ({
        kicker: `Metric ${index + 1}`,
        title: `Metric title ${index + 1}`,
        description: `Metric description ${index + 1}`,
      })),
    },
    directory: {
      eyebrow: 'Directory',
      title: 'Complete capabilities',
      intro: 'Every service we deliver.',
    },
    services: ANCHORS.map((_, index) => ({
      icon: ICONS[index],
      category: `Category ${index + 1}`,
      title: `Service ${index + 1}`,
      description: `Service description ${index + 1}`,
      scope: `Service scope ${index + 1}`,
      suitableFor: Array.from({ length: 4 }, (_, chip) => `Chip ${index + 1}.${chip + 1}`),
    })),
    process: {
      eyebrow: 'Process',
      title: 'How we deliver',
      intro: 'Six delivery phases.',
      steps: Array.from({ length: 6 }, (_, index) => ({
        title: `Step ${index + 1}`,
        description: `Desktop step description ${index + 1}`,
        mobileDescription: '',
      })),
    },
    cta: {
      eyebrow: 'Talk to us',
      title: 'Need a custom solution?',
      body: 'Tell us about the project.',
      points: ['CTA point 1', 'CTA point 2'],
    },
  };
}

test('accepts a complete document and trims every string', () => {
  const data = validDocument();
  data.hero.title = '  Electrical engineering services  ';
  data.services[0].scope = '  Service scope  ';

  const content = parseServicesContent(data);

  assert.equal(content?.hero.title, 'Electrical engineering services');
  assert.equal(content?.services[0].scope, 'Service scope');
  assert.equal(content?.hero.quickLinks.length, 4);
  assert.equal(content?.hero.metrics.length, 4);
  assert.equal(content?.services.length, 8);
  assert.equal(content?.process.steps.length, 6);
  assert.equal(content?.cta.points.length, 2);
});

test('returns null for an absent document', () => {
  assert.equal(parseServicesContent(undefined), null);
  assert.equal(parseServicesContentPatch(undefined), null);
});

test('keeps valid fields but marks a malformed field as null', () => {
  const data = validDocument();
  data.hero.title = '   ';

  const patch = parseServicesContentPatch(data);

  assert.equal(patch?.hero?.eyebrow, 'Engineering services');
  assert.equal(patch?.hero?.title, null);
  assert.equal(parseServicesContent(data), null);
});

test('keeps other cards but marks one malformed service card as null', () => {
  const data = validDocument();
  data.services[2].title = '';

  const patch = parseServicesContentPatch(data);

  assert.notEqual(patch?.services?.[0], null);
  assert.equal(patch?.services?.[2], null);
  assert.equal(parseServicesContent(data), null);
});

test('rejects wrong fixed counts without inventing slots', () => {
  const data = validDocument();
  data.hero.quickLinks = data.hero.quickLinks.slice(0, 3);
  data.hero.metrics = data.hero.metrics.slice(0, 3);
  data.services = data.services.slice(0, 7);
  data.process.steps = data.process.steps.slice(0, 5);
  data.cta.points = data.cta.points.slice(0, 1);

  const patch = parseServicesContentPatch(data);

  assert.equal(patch?.hero?.quickLinks, null);
  assert.equal(patch?.hero?.metrics, null);
  assert.equal(patch?.services, null);
  assert.equal(patch?.process?.steps, null);
  assert.equal(patch?.cta?.points, null);
  assert.equal(parseServicesContent(data), null);
});

test('keeps valid quick-link fields and nulls only the invalid ones', () => {
  const data = validDocument();
  data.hero.quickLinks[0].icon = 'not_a_real_icon';
  data.hero.quickLinks[1].target = 'service-09';

  const patch = parseServicesContentPatch(data);

  assert.equal(patch?.hero?.quickLinks?.[0]?.label, 'Quick link 1');
  assert.equal(patch?.hero?.quickLinks?.[0]?.icon, null);
  assert.equal(patch?.hero?.quickLinks?.[0]?.target, 'service-01');
  assert.equal(patch?.hero?.quickLinks?.[1]?.label, 'Quick link 2');
  assert.equal(patch?.hero?.quickLinks?.[1]?.icon, ICONS[1]);
  assert.equal(patch?.hero?.quickLinks?.[1]?.target, null);
  assert.equal(parseServicesContent(data), null);
});

test('keeps valid metric fields and nulls only the invalid one', () => {
  const data = validDocument();
  data.hero.metrics[0].kicker = '';

  const patch = parseServicesContentPatch(data);

  assert.equal(patch?.hero?.metrics?.[0]?.kicker, null);
  assert.equal(patch?.hero?.metrics?.[0]?.title, 'Metric title 1');
  assert.equal(
    patch?.hero?.metrics?.[0]?.description,
    'Metric description 1',
  );
  assert.equal(parseServicesContent(data), null);
});

test('keeps valid step fields and nulls only the invalid one', () => {
  const data = validDocument();
  data.process.steps[0].description = '';

  const patch = parseServicesContentPatch(data);

  assert.equal(patch?.process?.steps?.[0]?.title, 'Step 1');
  assert.equal(patch?.process?.steps?.[0]?.description, null);
  assert.equal(patch?.process?.steps?.[0]?.mobileDescription, null);
  assert.equal(parseServicesContent(data), null);
});

test('marks blank mobile step copy as null so the watcher reuses the desktop copy', () => {
  const data = validDocument();
  data.process.steps[0].mobileDescription = '   ';

  const patch = parseServicesContentPatch(data);

  assert.equal(patch?.process?.steps?.[0]?.mobileDescription, null);
  assert.equal(
    data.process.steps[0].description,
    'Desktop step description 1',
  );
  assert.equal(parseServicesContent(data)?.process.steps[0].mobileDescription, 'Desktop step description 1');
});

test('falls back to the desktop description when mobile copy is blank', () => {
  const step = {
    title: 'Step',
    description: 'Desktop copy',
    mobileDescription: '',
  };

  assert.equal(stepDescriptionForMobile(step), 'Desktop copy');
  assert.equal(
    stepDescriptionForMobile({ ...step, mobileDescription: 'Mobile copy' }),
    'Mobile copy',
  );
});

test('Services metrics use mobile-safe columns and wrap long admin titles', async () => {
  const hero = await readFile(
    new URL('../src/components/services/ServicesHero.astro', import.meta.url),
    'utf8',
  );

  assert.match(hero, /grid-cols-1 sm:grid-cols-2 lg:grid-cols-4/);
  assert.equal((hero.match(/min-w-0 break-words font-headline-md/g) ?? []).length, 4);
});

test('builds the expected Services hydration hooks', async () => {
  const html = await readFile(
    new URL('../dist/client/services/index.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /data-services-hero-title/);
  assert.match(html, /data-services-hero-intro/);
  assert.match(html, /data-services-directory-title/);
  assert.match(html, /data-services-process-title/);
  assert.match(html, /data-services-cta-title/);
  assert.match(html, /data-site-primary-contact/);
  assert.match(html, /data-site-primary-label/);

  for (let index = 0; index < 8; index += 1) {
    assert.match(html, new RegExp(`data-service-card="${index}"`));
    assert.match(html, new RegExp(`data-service-suitable="${index % 4}"`));
  }

  for (let index = 0; index < 4; index += 1) {
    assert.match(html, new RegExp(`data-services-quick-link="${index}"`));
    assert.match(html, new RegExp(`data-services-metric="${index}"`));
  }

  for (let index = 0; index < 6; index += 1) {
    assert.equal(
      (html.match(new RegExp(`data-services-step="${index}"`, 'g')) ?? []).length,
      2,
      `step ${index} should have desktop and mobile hooks`,
    );
  }

  assert.match(html, /data-services-cta-point="1"/);
  assert.equal((html.match(/data-service-suitable="/g) ?? []).length, 32);

  const footerStart = html.indexOf('<footer');
  assert.notEqual(footerStart, -1, 'the page should render a footer');
  assert.ok(
    !html.slice(footerStart).includes('data-services'),
    'footer must stay static',
  );

  const headerEnd = html.indexOf('</header>');
  assert.notEqual(headerEnd, -1, 'the page should render a header');
  assert.ok(
    !html.slice(0, headerEnd).includes('data-services'),
    'header must stay static',
  );
});
