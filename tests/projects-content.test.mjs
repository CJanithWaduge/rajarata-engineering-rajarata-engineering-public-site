import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import {
  parseProjectsContent,
  parseProjectsContentPatch,
} from '../src/lib/projectsContentParser.ts';

const CATEGORIES = ['residential', 'commercial', 'industrial', 'elv', 'maintenance'];

function validDocument() {
  return {
    hero: {
      eyebrow: 'Work we take on',
      title: 'Electrical work & capabilities',
      intro: 'A portfolio of installed electrical work.',
    },
    portfolio: {
      projects: Array.from({ length: 6 }, (_, index) => ({
        category: CATEGORIES[index % CATEGORIES.length],
        subTag: `Sub tag ${index + 1}`,
        location: `Location ${index + 1}`,
        year: `Year ${index + 1}`,
        typePlaceholder: `Type ${index + 1}`,
        title: `Project ${index + 1}`,
        summary: `Project summary ${index + 1}`,
        ref: `Ref ${index + 1}`,
        specLabel: `Spec label ${index + 1}`,
        specValue: `Spec value ${index + 1}`,
        specDetail: `Spec detail ${index + 1}`,
        image: {
          imageUrl: `https://cdn.example.com/projects/card-${index + 1}.webp`,
          imagePath: `projects/cards/${index + 1}/card.webp`,
          imageAlt: `Card image ${index + 1}`,
          imageWidth: 1600,
          imageHeight: 1000,
          imageSize: 120_000,
          imageContentType: 'image/webp',
        },
      })),
    },
    trackRecord: {
      columns: Array.from({ length: 3 }, (_, index) => ({
        kicker: `Track kicker ${index + 1}`,
        value: `Track value ${index + 1}`,
        description: `Track description ${index + 1}`,
      })),
    },
    cta: {
      eyebrow: 'Talk to us',
      title: 'Have a project like this?',
      body: 'Tell us about your site.',
    },
  };
}

test('accepts a complete document and trims every string', () => {
  const data = validDocument();
  data.hero.title = '  Electrical work & capabilities  ';
  data.portfolio.projects[0].title = '  Project 1  ';

  const content = parseProjectsContent(data);

  assert.equal(content?.hero.title, 'Electrical work & capabilities');
  assert.equal(content?.portfolio.projects[0].title, 'Project 1');
  assert.equal(content?.portfolio.projects.length, 6);
  assert.equal(content?.trackRecord.columns.length, 3);
});

test('returns null for an absent document', () => {
  assert.equal(parseProjectsContent(undefined), null);
  assert.equal(parseProjectsContentPatch(undefined), null);
});

test('keeps valid fields but marks a malformed field as null', () => {
  const data = validDocument();
  data.trackRecord.columns[0].value = 'x'.repeat(21);

  const patch = parseProjectsContentPatch(data);

  assert.equal(patch?.trackRecord?.columns?.[0]?.value, null);
  assert.equal(patch?.trackRecord?.columns?.[0]?.kicker, 'Track kicker 1');
  assert.equal(parseProjectsContent(data), null);
});

test('blank text is accepted as a keep-the-build-time value', () => {
  const data = validDocument();
  data.cta.title = '   ';

  const patch = parseProjectsContentPatch(data);

  assert.equal(patch?.cta?.title, null);
  assert.equal(patch?.cta?.body, data.cta.body);
  assert.equal(parseProjectsContent(data)?.cta.title, '');
});

test('an empty image slot keeps the public image', () => {
  const data = validDocument();
  data.portfolio.projects[0].image.imageUrl = '';

  const patch = parseProjectsContentPatch(data);
  assert.equal(patch?.portfolio?.projects?.[0]?.image, null);
  assert.equal(parseProjectsContent(data)?.portfolio.projects[0].image.url, '');
});

test('rejects unsafe image URLs', () => {
  const data = validDocument();
  data.portfolio.projects[0].image.imageUrl = 'javascript:alert(1)';

  const patch = parseProjectsContentPatch(data);
  assert.equal(patch?.portfolio?.projects?.[0]?.image, null);
  assert.equal(parseProjectsContent(data), null);

  // Inline mode stores raster data URLs only; SVG is always rejected.
  const svgDataUrl = validDocument();
  svgDataUrl.portfolio.projects[1].image.imageUrl =
    'data:image/svg+xml;base64,PHN2Zy8+';
  const patch2 = parseProjectsContentPatch(svgDataUrl);
  assert.equal(patch2?.portfolio?.projects?.[1]?.image, null);
  assert.equal(parseProjectsContent(svgDataUrl), null);
});

test('rejects wrong fixed counts without inventing slots', () => {
  const data = validDocument();
  data.portfolio.projects = data.portfolio.projects.slice(0, 5);
  data.trackRecord.columns = data.trackRecord.columns.slice(0, 2);

  const patch = parseProjectsContentPatch(data);

  assert.equal(patch?.portfolio, null);
  assert.equal(patch?.trackRecord, null);
  assert.equal(patch?.hero?.title, 'Electrical work & capabilities');
  assert.equal(parseProjectsContent(data), null);
});

test('rejects a project category outside the allowlist', () => {
  const data = validDocument();
  data.portfolio.projects[0].category = 'not_a_real_category';

  const patch = parseProjectsContentPatch(data);

  assert.equal(patch?.portfolio?.projects?.[0], null);
  assert.equal(parseProjectsContent(data), null);
});

test('builds the expected Projects hydration hooks', async () => {
  const html = await readFile(
    new URL('../dist/client/projects/index.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /data-projects-hero-eyebrow/);
  assert.match(html, /data-projects-hero-title/);
  assert.match(html, /data-projects-hero-intro/);
  assert.match(html, /data-projects-cta-eyebrow/);
  assert.match(html, /data-projects-cta-title/);
  assert.match(html, /data-projects-cta-body/);
  assert.match(html, /data-projects-track-record-column="0"/);
  assert.match(html, /data-projects-track-record-column="2"/);

  for (let index = 0; index < 6; index += 1) {
    assert.match(html, new RegExp(`data-project-card="${index}"`));
    assert.match(html, new RegExp(`data-project-image`));
  }

  const footerStart = html.indexOf('<footer');
  assert.notEqual(footerStart, -1, 'the page should render a footer');
  assert.ok(
    !html.slice(footerStart).includes('data-project'),
    'footer must stay static',
  );

  const headerEnd = html.indexOf('</header>');
  assert.notEqual(headerEnd, -1, 'the page should render a header');
  assert.ok(
    !html.slice(0, headerEnd).includes('data-project'),
    'header must stay static',
  );
});
