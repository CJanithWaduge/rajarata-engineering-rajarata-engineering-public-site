import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebase } from './firebase';
import {
  readHomeImage,
  readHomeProject,
  type HomeImage,
  type HomeProject,
} from './homeContent';

/**
 * Live hydration for the Home page.
 *
 * The three cards and the hero image are built with local fallback artwork.
 * This subscribes to `site/home` and patches any element that opted in with a
 * `data-home-*` attribute. A field that is missing or fails validation is
 * skipped, so the build-time markup remains instead of being replaced with an
 * empty value or placeholder copy.
 *
 * The tag is the exception: it is optional in the admin form, so an empty tag
 * is written through and hides the label.
 */
function setText(root: ParentNode, selector: string, value: string) {
  const element = root.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
}

function applyImage(image: HTMLImageElement | null, source: HomeImage) {
  if (!image) return;
  image.src = source.url;
  if (source.alt) image.alt = source.alt;
  if (source.width > 0) image.width = source.width;
  if (source.height > 0) image.height = source.height;
}

function applyHero(hero: HomeImage) {
  applyImage(document.querySelector<HTMLImageElement>('[data-home-hero-image]'), hero);
}

function applyProject(index: number, project: HomeProject) {
  const card = document.querySelector<HTMLElement>(`[data-home-project="${index}"]`);
  if (!card) return;

  applyImage(card.querySelector<HTMLImageElement>('[data-home-project-image]'), project.image);
  setText(card, '[data-home-project-category]', project.category);
  setText(card, '[data-home-project-venue]', project.venue);
  setText(card, '[data-home-project-topic]', project.topic);
  setText(card, '[data-home-project-tag]', project.tag);
}

/**
 * Returns an unsubscribe function, or a no-op when Firebase is unavailable.
 *
 * `onFirstResult` fires once the first server snapshot has been applied (or
 * the read failed), which lets `contentHydration.ts` reveal the media gate.
 */
export function watchHomeContent(onFirstResult?: () => void): () => void {
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    onFirstResult?.();
  };

  try {
    const { db } = getFirebase();
    return onSnapshot(
      doc(db, 'site', 'home'),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (snapshot.metadata.fromCache) return;

        try {
          const data = snapshot.data();
          if (!data) return;

          const hero = readHomeImage(data.hero);
          if (hero) applyHero(hero);

          if (Array.isArray(data.featuredProjects)) {
            data.featuredProjects.slice(0, 3).forEach((value, index) => {
              const project = readHomeProject(value);
              if (project) applyProject(index + 1, project);
            });
          }
        } finally {
          settle();
        }
      },
      (error) => {
        // Never fall back to placeholder content; leave the build-time HTML.
        console.warn('Home content subscription failed; showing build-time content.', error);
        settle();
      },
    );
  } catch (error) {
    console.warn('Home content unavailable; showing build-time content.', error);
    settle();
    return () => {};
  }
}
