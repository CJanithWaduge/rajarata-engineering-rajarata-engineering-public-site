import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebase } from './firebase';
import {
  parseAboutContentPatch,
  type AboutImage,
  type AboutPatch,
} from './aboutContentParser';

/**
 * Live hydration for the About page.
 *
 * The page is prerendered with its current copy, so this only patches elements
 * that opted in with a `data-about-*` hook. Every About field is optional in
 * the admin form: a blank value is `null` in the patch and is skipped, leaving
 * the build-time content for that slot in place. A missing document changes
 * nothing at all.
 */
function setText(root: ParentNode, selector: string, value: string | null) {
  if (value === null) return;
  const element = root.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
}

function setTextAll(selector: string, value: string | null) {
  if (value === null) return;
  document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    element.textContent = value;
  });
}

function applyImage(image: HTMLImageElement | null, source: AboutImage) {
  if (!image) return;
  image.src = source.url;
  // An admin-supplied image must carry alt text, but a blank value here means
  // the document is malformed: keep the build-time alt instead of emitting an
  // empty one.
  if (source.alt) image.alt = source.alt;
  if (source.width > 0) image.width = source.width;
  if (source.height > 0) image.height = source.height;
}

function applyHero(hero: NonNullable<AboutPatch['hero']>) {
  setTextAll('[data-about-hero-eyebrow]', hero.eyebrow);
  setTextAll('[data-about-hero-title]', hero.title);
  setTextAll('[data-about-hero-intro]', hero.intro);
  setTextAll('[data-about-hero-approach-label]', hero.approachLabel);
  setTextAll('[data-about-hero-snapshot-label]', hero.snapshotLabel);

  if (hero.image) {
    applyImage(
      document.querySelector<HTMLImageElement>('[data-about-hero-image]'),
      hero.image,
    );
  }

  hero.snapshots?.forEach((snapshot, index) => {
    if (!snapshot) return;
    const card = document.querySelector<HTMLElement>(
      `[data-about-snapshot="${index}"]`,
    );
    if (!card) return;

    setText(card, '[data-about-snapshot-title]', snapshot.title);
    setText(
      card,
      '[data-about-snapshot-description]',
      snapshot.description,
    );
  });

  if (hero.overlay) {
    setTextAll('[data-about-overlay-title]', hero.overlay.title);
    setTextAll(
      '[data-about-overlay-description]',
      hero.overlay.description,
    );
    setTextAll('[data-about-overlay-stage]', hero.overlay.stage);
    setTextAll('[data-about-overlay-stage-label]', hero.overlay.stageLabel);
  }
}

function applyHeritage(heritage: NonNullable<AboutPatch['heritage']>) {
  setTextAll('[data-about-heritage-eyebrow]', heritage.eyebrow);
  setTextAll('[data-about-heritage-title]', heritage.title);
  setTextAll('[data-about-heritage-narrative]', heritage.narrative);
  setTextAll('[data-about-heritage-approach]', heritage.approach);
  setTextAll('[data-about-heritage-based-in-label]', heritage.basedInLabel);
  setTextAll('[data-about-heritage-based-in-value]', heritage.basedInValue);
  setTextAll('[data-about-heritage-approach-label]', heritage.approachLabel);

  heritage.milestones?.forEach((milestone, index) => {
    if (!milestone) return;
    const card = document.querySelector<HTMLElement>(
      `[data-about-milestone="${index}"]`,
    );
    if (!card) return;

    setText(card, '[data-about-milestone-kicker]', milestone.kicker);
    setText(card, '[data-about-milestone-badge]', milestone.badge);
    setText(card, '[data-about-milestone-title]', milestone.title);
    setText(
      card,
      '[data-about-milestone-description]',
      milestone.description,
    );
  });
}

function applyVisionMission(
  visionMission: NonNullable<AboutPatch['visionMission']>,
) {
  (['vision', 'mission'] as const).forEach((key) => {
    const card = visionMission[key];
    if (!card) return;

    const root = document.querySelector<HTMLElement>(
      `[data-about-card="${key}"]`,
    );
    if (!root) return;

    setText(root, '[data-about-card-eyebrow]', card.eyebrow);
    setText(root, '[data-about-card-title]', card.title);
    setText(root, '[data-about-card-body]', card.body);
    setText(root, '[data-about-card-footer]', card.footer);
  });
}

function applyPillars(pillars: NonNullable<AboutPatch['pillars']>) {
  setTextAll('[data-about-pillars-eyebrow]', pillars.eyebrow);
  setTextAll('[data-about-pillars-title]', pillars.title);
  setTextAll('[data-about-pillars-intro]', pillars.intro);

  pillars.items?.forEach((pillar, index) => {
    if (!pillar) return;
    const card = document.querySelector<HTMLElement>(
      `[data-about-pillar="${index}"]`,
    );
    if (!card) return;

    setText(card, '[data-about-pillar-icon]', pillar.icon);
    setText(card, '[data-about-pillar-title]', pillar.title);
    setText(card, '[data-about-pillar-description]', pillar.description);
    setText(card, '[data-about-pillar-footer]', pillar.footer);
  });
}

function applyMethodology(methodology: NonNullable<AboutPatch['methodology']>) {
  setTextAll('[data-about-methodology-eyebrow]', methodology.eyebrow);
  setTextAll('[data-about-methodology-title]', methodology.title);
  setTextAll('[data-about-methodology-intro]', methodology.intro);
  setTextAll(
    '[data-about-methodology-protocol-label]',
    methodology.protocolLabel,
  );
  setTextAll('[data-about-methodology-stages-label]', methodology.stagesLabel);

  methodology.steps?.forEach((step, index) => {
    if (!step) return;
    const card = document.querySelector<HTMLElement>(
      `[data-about-method-step="${index}"]`,
    );
    if (!card) return;

    setText(card, '[data-about-method-step-icon]', step.icon);
    setText(card, '[data-about-method-step-title]', step.title);
    setText(
      card,
      '[data-about-method-step-description]',
      step.description,
    );
    setText(card, '[data-about-method-step-footer]', step.footer);
  });
}

function applyIndustries(industries: NonNullable<AboutPatch['industries']>) {
  setTextAll('[data-about-industries-eyebrow]', industries.eyebrow);
  setTextAll('[data-about-industries-title]', industries.title);
  setTextAll('[data-about-industries-intro]', industries.intro);

  industries.sectors?.forEach((sector, index) => {
    if (!sector) return;
    const card = document.querySelector<HTMLElement>(
      `[data-about-sector="${index}"]`,
    );
    if (!card) return;

    setText(card, '[data-about-sector-icon]', sector.icon);
    setText(card, '[data-about-sector-title]', sector.title);
    setText(card, '[data-about-sector-description]', sector.description);
  });
}

function applyCta(cta: NonNullable<AboutPatch['cta']>) {
  setTextAll('[data-about-cta-eyebrow]', cta.eyebrow);
  setTextAll('[data-about-cta-title]', cta.title);
  setTextAll('[data-about-cta-body]', cta.body);
  setTextAll('[data-about-cta-projects-label]', cta.projectsLabel);
  setTextAll('[data-about-cta-phone-label]', cta.phoneLabel);
  setTextAll('[data-about-cta-whatsapp-label]', cta.whatsappLabel);
}

/**
 * Returns an unsubscribe function, or a no-op when Firebase is unavailable.
 *
 * `onFirstResult` fires once the first server snapshot has been applied (or
 * the read failed), which lets `contentHydration.ts` reveal the media gate.
 */
export function watchAboutContent(onFirstResult?: () => void): () => void {
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    onFirstResult?.();
  };

  try {
    const { db } = getFirebase();
    return onSnapshot(
      doc(db, 'site', 'about'),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (snapshot.metadata.fromCache) return;

        try {
          const data = snapshot.data();
          if (!data) return;

          const patch = parseAboutContentPatch(data);
          if (!patch) return;

          if (patch.hero) applyHero(patch.hero);
          if (patch.heritage) applyHeritage(patch.heritage);
          if (patch.visionMission) applyVisionMission(patch.visionMission);
          if (patch.pillars) applyPillars(patch.pillars);
          if (patch.methodology) applyMethodology(patch.methodology);
          if (patch.industries) applyIndustries(patch.industries);
          if (patch.cta) applyCta(patch.cta);
        } finally {
          settle();
        }
      },
      (error) => {
        // Never fall back to placeholder content; leave the build-time HTML.
        console.warn(
          'About content subscription failed; showing build-time content.',
          error,
        );
        settle();
      },
    );
  } catch (error) {
    console.warn('About content unavailable; showing build-time content.', error);
    settle();
    return () => {};
  }
}
