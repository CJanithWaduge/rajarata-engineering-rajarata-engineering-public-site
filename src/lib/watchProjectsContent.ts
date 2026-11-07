import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebase } from './firebase';
import {
  parseProjectsContentPatch,
  type ProjectContentPatch,
  type ProjectImage,
  type ProjectsPatch,
  type TrackRecordColumnPatch,
} from './projectsContentParser';

/**
 * Live hydration for the Projects page.
 *
 * The page is prerendered with its current copy, so this only patches elements
 * that opted in with a `data-project-*` or `data-projects-*` hook. Every text
 * field is optional in the admin form: a blank value is `null` in the patch and
 * is skipped, leaving the build-time content for that slot in place. A missing
 * document changes nothing at all.
 */
function setText(root: ParentNode, selector: string, value: string | null) {
  if (value === null) return;
  const element = root.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
}

function applyImage(image: HTMLImageElement | null, source: ProjectImage) {
  if (!image) return;
  image.src = source.url;
  // An admin-supplied image may carry its own alt; a blank alt means the
  // build-time alt stays in place instead of being emptied.
  if (source.alt) image.alt = source.alt;
  if (source.width > 0) image.width = source.width;
  if (source.height > 0) image.height = source.height;
}

function setTextAll(selector: string, value: string | null) {
  if (value === null) return;
  document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    element.textContent = value;
  });
}

function applyHero(hero: NonNullable<ProjectsPatch['hero']>) {
  setTextAll('[data-projects-hero-eyebrow]', hero.eyebrow);
  setTextAll('[data-projects-hero-title]', hero.title);
  setTextAll('[data-projects-hero-intro]', hero.intro);
}

function applyProjects(projects: Array<ProjectContentPatch | null>) {
  projects.forEach((project, index) => {
    if (!project) return;
    const card = document.querySelector<HTMLElement>(
      `[data-project-card="${index}"]`,
    );
    if (!card) return;

    if (project.image) {
      applyImage(
        card.querySelector<HTMLImageElement>('[data-project-image]'),
        project.image,
      );
    }
    setText(card, '[data-project-category]', project.category);
    setText(card, '[data-project-subtag]', project.subTag);
    setText(card, '[data-project-location]', project.location);
    setText(card, '[data-project-year]', project.year);
    setText(card, '[data-project-type]', project.typePlaceholder);
    setText(card, '[data-project-title]', project.title);
    setText(card, '[data-project-summary]', project.summary);
    setText(card, '[data-project-ref]', project.ref);
    setText(card, '[data-project-spec-label]', project.specLabel);
    setText(card, '[data-project-spec-value]', project.specValue);
    setText(card, '[data-project-spec-detail]', project.specDetail);
  });
}

function applyTrackRecord(columns: Array<TrackRecordColumnPatch | null>) {
  columns.forEach((column, index) => {
    if (!column) return;
    const root = document.querySelector<HTMLElement>(
      `[data-projects-track-record-column="${index}"]`,
    );
    if (!root) return;

    setText(root, '[data-projects-track-record-kicker]', column.kicker);
    setText(root, '[data-projects-track-record-value]', column.value);
    setText(
      root,
      '[data-projects-track-record-description]',
      column.description,
    );
  });
}

function applyCta(cta: NonNullable<ProjectsPatch['cta']>) {
  setTextAll('[data-projects-cta-eyebrow]', cta.eyebrow);
  setTextAll('[data-projects-cta-title]', cta.title);
  setTextAll('[data-projects-cta-body]', cta.body);
}

/**
 * Returns an unsubscribe function, or a no-op when Firebase is unavailable.
 *
 * `onFirstResult` fires once the first server snapshot has been applied (or
 * the read failed), which lets `contentHydration.ts` reveal the media gate.
 */
export function watchProjectsContent(onFirstResult?: () => void): () => void {
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    onFirstResult?.();
  };

  try {
    const { db } = getFirebase();
    return onSnapshot(
      doc(db, 'site', 'projects'),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (snapshot.metadata.fromCache) return;

        try {
          const data = snapshot.data();
          if (!data) return;

          const patch = parseProjectsContentPatch(data);
          if (!patch) return;

          if (patch.hero) applyHero(patch.hero);
          if (patch.portfolio) applyProjects(patch.portfolio.projects);
          if (patch.trackRecord) applyTrackRecord(patch.trackRecord.columns);
          if (patch.cta) applyCta(patch.cta);
        } finally {
          settle();
        }
      },
      (error) => {
        // Never fall back to placeholder content; leave the build-time HTML.
        console.warn(
          'Projects content subscription failed; showing build-time content.',
          error,
        );
        settle();
      },
    );
  } catch (error) {
    console.warn('Projects content unavailable; showing build-time content.', error);
    settle();
    return () => {};
  }
}
