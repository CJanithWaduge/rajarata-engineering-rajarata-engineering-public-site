import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebase } from './firebase';
import {
  readHomeImage,
  readHomeProject,
  type HomeImage,
  type HomeProject,
} from './homeContent';
import { readHomeService, type HomeService } from './homeServices';
import { iconifyIconUrl } from './iconify';

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

  if (project.image) {
    applyImage(
      card.querySelector<HTMLImageElement>('[data-home-project-image]'),
      project.image,
    );
  }
  setText(card, '[data-home-project-category]', project.category);
  setText(card, '[data-home-project-venue]', project.venue);
  setText(card, '[data-home-project-topic]', project.topic);
  setText(card, '[data-home-project-tag]', project.tag);
}

/**
 * Icons inside the self-hosted subset keep using the Material Symbols ligature
 * font. A `material-symbols:<slug>` name is outside that subset, so it becomes
 * an on-demand Iconify SVG mask instead of the literal name being rendered as
 * text. The URL only reaches Iconify when an admin actually picks such an icon.
 */
function applyServiceIcon(element: HTMLElement | null, icon: string) {
  if (!element) return;

  const remoteUrl = iconifyIconUrl(icon);

  if (remoteUrl) {
    element.textContent = '';
    element.classList.remove('material-symbols-outlined');
    element.classList.add('iconify-symbol');
    element.style.setProperty('--iconify-icon', `url("${remoteUrl}")`);
    return;
  }

  element.classList.remove('iconify-symbol');
  element.style.removeProperty('--iconify-icon');
  element.classList.add('material-symbols-outlined');
  element.textContent = icon;
}

/**
 * Every service field is optional, so only non-empty values are written
 * through. A blank field leaves the build-time icon, copy, or link intact.
 */
function applyService(index: number, service: HomeService) {
  const card = document.querySelector<HTMLElement>(`[data-home-service="${index}"]`);
  if (!card) return;

  if (service.icon) {
    applyServiceIcon(
      card.querySelector<HTMLElement>('[data-home-service-icon]'),
      service.icon,
    );
  }
  if (service.title) setText(card, '[data-home-service-title]', service.title);
  if (service.description) {
    setText(card, '[data-home-service-description]', service.description);
  }

  if (service.href) {
    const link = card.querySelector<HTMLAnchorElement>('[data-home-service-link]');
    if (link) link.setAttribute('href', service.href);
  }
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

          if (Array.isArray(data.featuredServices)) {
            data.featuredServices.slice(0, 3).forEach((value, index) => {
              applyService(index + 1, readHomeService(value));
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
