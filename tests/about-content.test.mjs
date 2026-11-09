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
    imageWidth: 1920,
    imageHeight: 1080,
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
      eyebrow: 'engineering',
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

test('optional labels keep build-time copy when missing and patch when set', () => {
  const data = validAboutDocument();

  // Documents written before the labels became editable have no such fields.
  const older = parseAboutContent(data);
  assert.ok(older);
  assert.equal(older.hero.approachLabel, '');
  assert.equal(older.hero.snapshotLabel, '');
  assert.equal(older.hero.overlay.stageLabel, '');
  assert.equal(older.heritage.basedInLabel, '');
  assert.equal(older.heritage.basedInValue, '');
  assert.equal(older.heritage.approachLabel, '');
  assert.equal(older.methodology.protocolLabel, '');
  assert.equal(older.methodology.stagesLabel, '');
  assert.equal(older.cta.projectsLabel, '');
  assert.equal(older.cta.phoneLabel, '');
  assert.equal(older.cta.whatsappLabel, '');

  const olderPatch = parseAboutContentPatch(data);
  assert.equal(olderPatch?.hero?.approachLabel, null);
  assert.equal(olderPatch?.hero?.snapshotLabel, null);
  assert.equal(olderPatch?.hero?.overlay?.stageLabel, null);
  assert.equal(olderPatch?.heritage?.basedInLabel, null);
  assert.equal(olderPatch?.heritage?.basedInValue, null);
  assert.equal(olderPatch?.heritage?.approachLabel, null);
  assert.equal(olderPatch?.methodology?.protocolLabel, null);
  assert.equal(olderPatch?.methodology?.stagesLabel, null);
  assert.equal(olderPatch?.cta?.projectsLabel, null);
  assert.equal(olderPatch?.cta?.phoneLabel, null);
  assert.equal(olderPatch?.cta?.whatsappLabel, null);

  data.hero.approachLabel = 'Our Approach & Methodology';
  data.hero.snapshotLabel = 'Scope';
  data.hero.overlay.stageLabel = 'Work Stage';
  data.heritage.basedInLabel = 'Based In';
  data.heritage.basedInValue = 'Anuradhapura, Sri Lanka';
  data.heritage.approachLabel = 'Our Approach';
  data.methodology.protocolLabel = 'Lifecycle Protocol';
  data.methodology.stagesLabel = 'Project Stages';
  data.cta.projectsLabel = 'View Past Projects';
  data.cta.phoneLabel = 'Phone';
  data.cta.whatsappLabel = 'WhatsApp';

  const content = parseAboutContent(data);
  assert.ok(content);
  assert.equal(content.hero.approachLabel, 'Our Approach & Methodology');
  assert.equal(content.hero.snapshotLabel, 'Scope');
  assert.equal(content.hero.overlay.stageLabel, 'Work Stage');
  assert.equal(content.heritage.basedInLabel, 'Based In');
  assert.equal(content.heritage.basedInValue, 'Anuradhapura, Sri Lanka');
  assert.equal(content.heritage.approachLabel, 'Our Approach');
  assert.equal(content.methodology.protocolLabel, 'Lifecycle Protocol');
  assert.equal(content.methodology.stagesLabel, 'Project Stages');
  assert.equal(content.cta.projectsLabel, 'View Past Projects');
  assert.equal(content.cta.phoneLabel, 'Phone');
  assert.equal(content.cta.whatsappLabel, 'WhatsApp');

  const patch = parseAboutContentPatch(data);
  assert.equal(patch?.hero?.approachLabel, 'Our Approach & Methodology');
  assert.equal(patch?.hero?.snapshotLabel, 'Scope');
  assert.equal(patch?.hero?.overlay?.stageLabel, 'Work Stage');
  assert.equal(patch?.heritage?.basedInLabel, 'Based In');
  assert.equal(patch?.heritage?.basedInValue, 'Anuradhapura, Sri Lanka');
  assert.equal(patch?.heritage?.approachLabel, 'Our Approach');
  assert.equal(patch?.methodology?.protocolLabel, 'Lifecycle Protocol');
  assert.equal(patch?.methodology?.stagesLabel, 'Project Stages');
  assert.equal(patch?.cta?.projectsLabel, 'View Past Projects');
  assert.equal(patch?.cta?.phoneLabel, 'Phone');
  assert.equal(patch?.cta?.whatsappLabel, 'WhatsApp');
});

test('About hero scope cards fit narrow screens and wrap long text', async () => {
  const hero = await readFile(
    new URL('../src/components/about/AboutHero.astro', import.meta.url),
    'utf8',
  );

  assert.match(hero, /grid-cols-1 gap-4[^"]*sm:grid-cols-3/);
  assert.equal((hero.match(/min-w-0 break-words font-title-md/g) ?? []).length, 3);
  assert.equal((hero.match(/min-w-0 break-words font-body-sm/g) ?? []).length, 3);
  assert.equal((hero.match(/card-interactive card-tilt flex h-full min-w-0 flex-col rounded-2xl bg-surface-container-lowest/g) ?? []).length, 3);
  assert.equal((hero.match(/data-card-tilt data-about-snapshot=/g) ?? []).length, 3);
});

test('About consultation CTA keeps its content hooks with the dark grid treatment', async () => {
  const cta = await readFile(
    new URL('../src/components/about/AboutCta.astro', import.meta.url),
    'utf8',
  );

  assert.match(cta, /bg-\[#1e1e1e\]/);
  assert.match(cta, /about-cta-grid/);
  assert.match(cta, /data-about-cta-eyebrow/);
  assert.match(cta, /data-about-cta-title>\s*Plan Your Next Electrical Installation/);
  assert.match(
    cta,
    /data-about-cta-body>\s*Reach the team directly by WhatsApp or phone to discuss MV\/LV distribution, panel installation, cable work, testing and commissioning, or ELV and automation for your site\./,
  );
  assert.match(cta, /data-about-cta-projects-label/);
  assert.match(cta, /data-site-primary-contact/);
  assert.doesNotMatch(cta, /data-about-cta-phone-label|data-about-cta-whatsapp-label/);
  assert.match(cta, /max-w-6xl/);
  assert.match(cta, /bg-\[#1e1e1e\]/);
  assert.match(cta, /data-path="projects" href="\/projects"/);
});

test('builds the expected About hydration hooks', async () => {
  const heroComponent = await readFile(
    new URL('../src/components/about/AboutHero.astro', import.meta.url),
    'utf8',
  );
  const html = await readFile(
    new URL('../dist/client/about-us/index.html', import.meta.url),
    'utf8',
  );

  assert.match(
    heroComponent,
    /data-about-hero-eyebrow>Electrical Engineering &amp; Contracting/,
  );
  assert.match(heroComponent, /data-about-hero-title>\s*About Rajarata Engineering/);
  assert.match(
    heroComponent,
    /data-about-hero-intro>\s*Rajarata Engineering is an electrical engineering and contracting company based in Anuradhapura\. The practice plans, installs, tests, and commissions MV\/LV distribution, industrial installations, MDB\/SMDB panels, cable tray and cable laying, lightning protection systems, ELV and automation, and residential and commercial wiring\./,
  );
  assert.match(heroComponent, /aspect-video[^"]*rounded-2xl/);
  assert.doesNotMatch(heroComponent, /lg:aspect-auto|lg:min-h-/);
  assert.match(heroComponent, /width="1920"/);
  assert.match(heroComponent, /height="1080"/);
  assert.match(html, /data-about-hero-eyebrow/);
  assert.match(html, /data-about-hero-title/);
  assert.match(html, /data-about-hero-intro/);
  assert.match(html, /data-about-hero-image/);
  assert.match(html, /data-about-overlay-title/);
  assert.match(html, /data-about-overlay-stage/);
  assert.match(html, /data-about-overlay-stage-label/);
  assert.match(html, /data-about-hero-approach-label/);
  assert.match(html, /data-about-hero-snapshot-label/);
  assert.match(html, /data-about-heritage-based-in-label/);
  assert.match(html, /data-about-heritage-based-in-value/);
  assert.match(html, /data-about-heritage-approach-label/);
  assert.match(html, /data-about-methodology-protocol-label/);
  assert.match(html, /data-about-methodology-stages-label/);
  assert.match(html, /data-about-cta-projects-label/);
  assert.doesNotMatch(html, /data-about-cta-phone-label|data-about-cta-whatsapp-label/);
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
