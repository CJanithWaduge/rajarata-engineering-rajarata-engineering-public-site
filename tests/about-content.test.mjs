import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import {
  parseAboutContent,
  parseAboutContentPatch,
} from '../src/lib/aboutContentParser.ts';

function image(overrides = {}) {
  return {
    imageUrl: 'https://cdn.example.com/about/hero.png',
    imagePath: 'about/hero/abc.png',
    imageAlt: 'Electrical engineer inspecting a control panel',
    imageWidth: 1600,
    imageHeight: 1200,
    imageSize: 12400,
    imageContentType: 'image/webp',
    ...overrides,
  };
}

function visionCard(overrides = {}) {
  return {
    eyebrow: 'Strategic Horizon',
    title: 'Our Vision',
    body: 'To be an electrical contractor known for careful work.',
    footer: 'Engineering Future-Ready Infrastructure',
    ...overrides,
  };
}

function validAboutDocument() {
  return {
    hero: {
      eyebrow: 'Engineering with purpose',
      title: 'About Rajarata Engineering',
      intro:
        'The practice plans, installs, tests, and commissions MV/LV distribution, industrial installations, MDB/SMDB panels, cable tray and cable laying, lightning protection systems, ELV and automation, and residential and commercial wiring.',
      image: image(),
      snapshots: [
        { title: 'MV/LV Distribution', description: 'Panels, cable tray and laying' },
        { title: 'Testing & Commissioning', description: 'Checks before handover' },
        { title: 'ELV & Automation', description: 'Structured cabling and controls' },
      ],
      overlay: {
        title: 'Commissioning Panel Checks',
        description: 'Insulation, earthing, and functional testing before handover',
        stage: 'Test & Handover',
      },
    },
    heritage: {
      eyebrow: 'Inside the Practice',
      title: 'How We Work & What We Do',
      narrative:
        'Rajarata Engineering is an electrical engineering and contracting company based in Anuradhapura. Each job follows the same route: review the site and its load requirements.',
      approach:
        'Design, installation, and testing are treated as one continuous job, so responsibility stays clear from the first drawing to the final handover.',
      milestones: [
        {
          kicker: 'Distribution Networks',
          badge: 'MV / LV',
          title: 'Medium- and low-voltage distribution',
          description: 'Design and installation of MV/LV distribution through the final circuits.',
        },
        {
          kicker: 'Industrial Installations',
          badge: 'Panels & Cable',
          title: 'Panels, cable tray, and cable laying',
          description: 'MDB/SMDB panel installation, cable tray routing, and cable laying.',
        },
        {
          kicker: 'Protection & ELV',
          badge: 'ELV & Automation',
          title: 'Lightning protection, ELV, and automation',
          description: 'Lightning protection systems, ELV networks, and automation controls.',
        },
        {
          kicker: 'Wiring & Commissioning',
          badge: 'Handover',
          title: 'Wiring, testing, and commissioning',
          description: 'Residential and commercial wiring is completed, then commissioned.',
        },
      ],
    },
    visionMission: {
      vision: visionCard(),
      mission: visionCard({
        eyebrow: 'Tactical Purpose',
        title: 'Our Mission',
        body: 'To carry out MV/LV distribution with careful planning, clean installation, and testing before every handover.',
        footer: 'Uncompromising Safety & Quality Governance',
      }),
    },
    pillars: {
      eyebrow: 'Guiding Code',
      title: 'Core Pillars of Engineering Conduct',
      intro: 'The standards Rajarata Engineering commits to on every job.',
      items: [
        {
          icon: 'health_and_safety',
          title: 'Safety',
          description: 'Planning for safe working on every site.',
          footer: 'Safety planned into every job',
        },
        {
          icon: 'precision_manufacturing',
          title: 'Quality',
          description: 'Materials chosen for the job and installed with care.',
          footer: 'Right materials for the job',
        },
        {
          icon: 'balance',
          title: 'Integrity',
          description: 'A clear scope and honest communication through handover.',
          footer: 'Honest Contracts',
        },
        {
          icon: 'schedule',
          title: 'Reliability',
          description: 'Coordinating with the client so the work follows an agreed sequence.',
          footer: 'Kept to the agreed plan',
        },
        {
          icon: 'trending_up',
          title: 'Improvement',
          description: 'Reviewing each finished job and carrying lessons forward.',
          footer: 'Lessons carried forward',
        },
      ],
    },
    methodology: {
      eyebrow: 'Execution Architecture',
      title: 'Our 5-Stage Project Methodology',
      intro: 'Every project moves through the same five stages.',
      steps: [
        {
          icon: 'manage_search',
          title: 'Understand',
          description: 'In-depth requirement analysis, site constraints, load surveys.',
          footer: 'Audit & Assessment',
        },
        {
          icon: 'architecture',
          title: 'Plan',
          description: 'Detailed schematics, CAD layouts, load calculations, cable sizing.',
          footer: 'Engineering Design',
        },
        {
          icon: 'handyman',
          title: 'Execute',
          description: 'MDB/SMDB panels are installed, cable tray is routed, cables laid.',
          footer: 'Rigorous Deployment',
        },
        {
          icon: 'fact_check',
          title: 'Test',
          description: 'Rigorous electrical diagnostic testing before sign-off.',
          footer: 'Verification & Sign-off',
        },
        {
          icon: 'contact_support',
          title: 'Support',
          description: 'A single point of contact for follow-on requirements.',
          footer: 'Continuous Lifecycle',
        },
      ],
    },
    industries: {
      eyebrow: 'Where We Work',
      title: 'Sectors Our Services Cover',
      intro: 'Distribution, panels, cable installation, testing, and ELV systems apply across these settings.',
      sectors: [
        {
          icon: 'precision_manufacturing',
          title: 'Factories & Manufacturing',
          description: 'MV/LV distribution to plant and machinery.',
        },
        {
          icon: 'storefront',
          title: 'Commercial & Retail',
          description: 'Commercial wiring, distribution boards, and lighting circuits.',
        },
        {
          icon: 'apartment',
          title: 'Residential Developers',
          description: 'Residential wiring from board to final circuit.',
        },
        {
          icon: 'hotel',
          title: 'Hospitality & Hotels',
          description: 'Power distribution, commercial wiring, and ELV systems.',
        },
        {
          icon: 'warehouse',
          title: 'Warehouses & Logistics',
          description: 'Cable tray and cable laying across large floor areas.',
        },
        {
          icon: 'local_hospital',
          title: 'Educational & Healthcare',
          description: 'Distribution, wiring, and ELV systems for wards and admin areas.',
        },
      ],
    },
    cta: {
      eyebrow: 'Engineering Consultation',
      title: 'Plan Your Next Electrical Installation',
      body: 'Reach the team directly by WhatsApp or phone to discuss your project.',
    },
  };
}

test('accepts a complete document and trims every string', () => {
  const data = validAboutDocument();
  data.hero.title = '  About Rajarata Engineering  ';

  const content = parseAboutContent(data);

  assert.ok(content);
  assert.equal(content.hero.title, 'About Rajarata Engineering');
  assert.equal(content.hero.intro.length > 0, true);
  assert.equal(content.hero.image.url, 'https://cdn.example.com/about/hero.png');
  assert.equal(content.heritage.milestones.length, 4);
  assert.equal(content.visionMission.vision.title, 'Our Vision');
  assert.equal(content.pillars.items.length, 5);
  assert.equal(content.methodology.steps.length, 5);
  assert.equal(content.industries.sectors.length, 6);
  assert.equal(content.cta.body.length > 0, true);
});

test('returns null for an absent document', () => {
  assert.equal(parseAboutContent(undefined), null);
  assert.equal(parseAboutContentPatch(undefined), null);
});

test('blank text is accepted as a keep-the-build-time value', () => {
  const data = validAboutDocument();
  data.hero.title = '   ';

  const content = parseAboutContent(data);

  assert.ok(content);
  assert.equal(content.hero.title, '');

  const patch = parseAboutContentPatch(data);
  assert.equal(patch?.hero?.title, null);
  assert.equal(patch?.hero?.intro, data.hero.intro);
});

test('blank icon means keep the build-time icon', () => {
  const data = validAboutDocument();
  data.pillars.items[0].icon = '';

  const patch = parseAboutContentPatch(data);
  assert.equal(patch?.pillars?.items?.[0]?.icon, null);

  const content = parseAboutContent(data);
  assert.ok(content);
  assert.equal(content.pillars.items[0].icon, '');
});

test('empty hero image URL means keep the build-time hero', () => {
  const data = validAboutDocument();
  data.hero.image.imageUrl = '';

  const patch = parseAboutContentPatch(data);
  assert.equal(patch?.hero?.image, null);

  const content = parseAboutContent(data);
  assert.ok(content);
  assert.equal(content.hero.image.url, '');
});

test('rejects unsafe or over-limit image URLs', () => {
  const data = validAboutDocument();
  data.hero.image.imageUrl = 'javascript:alert(1)';
  assert.equal(parseAboutContentPatch(data)?.hero?.image, null);
  assert.equal(parseAboutContent(data), null);

  const oversized = validAboutDocument();
  oversized.hero.intro = `${'x'.repeat(601)}`;
  assert.equal(parseAboutContentPatch(oversized)?.hero?.intro, null);
  assert.equal(parseAboutContent(oversized), null);
});

test('keeps valid fields but marks a blank field as null in the patch', () => {
  const data = validAboutDocument();
  data.cta.body = '   ';

  const patch = parseAboutContentPatch(data);

  assert.equal(patch?.cta?.body, null);
  assert.equal(patch?.cta?.title, data.cta.title);
  assert.equal(parseAboutContent(data)?.cta.body, '');
});

test('rejects wrong fixed counts without inventing slots', () => {
  const data = validAboutDocument();
  data.hero.snapshots = data.hero.snapshots.slice(0, 2);
  data.industries.sectors = data.industries.sectors.slice(0, 5);

  const patch = parseAboutContentPatch(data);

  assert.equal(patch?.hero?.snapshots, null);
  assert.equal(patch?.industries?.sectors, null);
  assert.equal(parseAboutContent(data), null);
});

test('builds the expected About hydration hooks', async () => {
  const html = await readFile(
    new URL('../dist/client/about-us/index.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /data-about-hero-eyebrow/);
  assert.match(html, /data-about-hero-title/);
  assert.match(html, /data-about-hero-intro/);
  assert.match(html, /data-about-hero-image/);
  assert.match(html, /data-about-overlay-title/);
  assert.match(html, /data-about-overlay-stage/);
  assert.match(html, /data-about-heritage-narrative/);
  assert.match(html, /data-about-cta-title/);
  assert.match(html, /data-about-pillars-title/);
  assert.match(html, /data-about-methodology-title/);
  assert.match(html, /data-about-industries-title/);

  for (let index = 0; index < 3; index += 1) {
    assert.match(html, new RegExp(`data-about-snapshot="${index}"`));
  }

  for (let index = 0; index < 4; index += 1) {
    assert.match(html, new RegExp(`data-about-milestone="${index}"`));
  }

  for (let index = 0; index < 5; index += 1) {
    assert.match(html, new RegExp(`data-about-pillar="${index}"`));
    assert.match(html, new RegExp(`data-about-method-step="${index}"`));
  }

  for (let index = 0; index < 6; index += 1) {
    assert.match(html, new RegExp(`data-about-sector="${index}"`));
  }

  const footerStart = html.indexOf('<footer');
  assert.notEqual(footerStart, -1, 'the page should render a footer');
  assert.ok(
    !html.slice(footerStart).includes('data-about'),
    'footer must stay static',
  );
});
