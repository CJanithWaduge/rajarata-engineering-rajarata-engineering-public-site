/**
 * Boots the Firestore-backed content hydration.
 *
 * Every page is prerendered with build-time copy and fallback artwork, which
 * can be older than the live document written by the admin panel. Reading
 * Firestore only changes something when the admin has newer values, so the
 * hydration must not paint the stale fallback first and then swap an image
 * under the visitor.
 *
 * Until this module has applied the first server-confirmed snapshot for every
 * feed the page renders, `Base.astro` puts `data-live-content="pending"` on
 * `<html>` and `global.css` hides `[data-live-media]`. The gate is released once:
 *
 * - every feed the page needs has delivered a server-confirmed snapshot (or
 *   failed), and the replacement images have loaded; or
 * - the hydration script itself fails to load, in which case Base.astro
 *   releases the gate to show the static fallback.
 *
 * No JavaScript (and therefore no gate) means the build-time artwork stays
 * visible, so the page is never blank without it.
 *
 * The Firestore SDK is still imported lazily and only for feeds whose `data-*`
 * hooks exist in the document, so a page never downloads code it cannot use.
 * Hydration starts as soon as this module runs (after the HTML is parsed)
 * rather than waiting for `load` plus an idle slot; hiding the fallback media
 * removed the reason to keep the read off the critical path, and getting the
 * live document sooner is what makes the gate short.
 */

type Hydrator = {
  /** Presence of any of these elements proves the page needs this feed. */
  selector: string;
  /** Resolves to the feed's unsubscribe function; calls back after its first result. */
  load: (onFirstResult: () => void) => Promise<() => void>;
};

const HYDRATORS: Hydrator[] = [
  {
    // Contact details live in the shared header and footer.
    selector:
      '[data-site-phone], [data-site-whatsapp], [data-site-email], [data-site-address], [data-site-facebook], [data-site-primary-contact], [data-site-logo-image]',
    load: (onFirstResult) =>
      import('./watchSiteSettings').then((module) => module.watchSiteSettings(onFirstResult)),
  },
  {
    // Home page only.
    selector: '[data-home-hero-image], [data-home-project]',
    load: (onFirstResult) =>
      import('./watchHomeContent').then((module) => module.watchHomeContent(onFirstResult)),
  },
  {
    // Services page only.
    selector: '[data-service-card], [data-services-hero-title]',
    load: (onFirstResult) =>
      import('./watchServicesContent').then((module) => module.watchServicesContent(onFirstResult)),
  },
  {
    // About page only.
    selector:
      '[data-about-hero-title], [data-about-hero-image], [data-about-heritage-title], [data-about-card], [data-about-pillar], [data-about-method-step], [data-about-sector], [data-about-cta-title]',
    load: (onFirstResult) =>
      import('./watchAboutContent').then((module) => module.watchAboutContent(onFirstResult)),
  },
  {
    // Projects page only.
    selector: '[data-project-card]',
    load: (onFirstResult) =>
      import('./watchProjectsContent').then((module) => module.watchProjectsContent(onFirstResult)),
  },
];

/** Attribute Base.astro puts on <html> before first paint. */
const GATE_ATTRIBUTE = 'data-live-content';

/** Extra wait for the replacement images, so the gate does not open on a blank box. */
const IMAGE_DECODE_TIMEOUT_MS = 1000;

/** Removes the gate, revealing whatever media is currently on the page. */
function releaseLiveContentGate(): void {
  document.documentElement.removeAttribute(GATE_ATTRIBUTE);
}

/**
 * Waits for any opted-in image that has not finished loading. The live values
 * are often inline data URLs, so `complete` flips almost immediately; the
 * timeout covers a slow or broken remote image.
 */
function waitForLiveMedia(): Promise<void> {
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>('img[data-live-media]'),
  ).filter((image) => !image.complete);

  if (images.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    let remaining = images.length;
    let finished = false;
    let timer = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      resolve();
    };

    timer = window.setTimeout(finish, IMAGE_DECODE_TIMEOUT_MS);

    images.forEach((image) => {
      const settle = () => {
        remaining -= 1;
        if (remaining === 0) finish();
      };
      image.addEventListener('load', settle, { once: true });
      image.addEventListener('error', settle, { once: true });
    });
  });
}

/**
 * Schedules hydration and returns a function that tears the subscriptions
 * down again. The return value is unused today; it exists so a client-side
 * navigation or a future framework island can clean up without leaking
 * listeners.
 */
export function startContentHydration(): () => void {
  const subscriptions: Array<() => void> = [];
  let cancelled = false;

  const needed = HYDRATORS.filter((hydrator) =>
    document.querySelector(hydrator.selector),
  );

  if (needed.length === 0) {
    releaseLiveContentGate();
    return () => {};
  }

  let pending = needed.length;
  let released = false;

  const release = () => {
    if (released) return;
    released = true;
    void waitForLiveMedia().then(() => {
      if (!cancelled) releaseLiveContentGate();
    });
  };

  needed.forEach((hydrator) => {
    let settled = false;
    const firstResult = () => {
      if (settled) return;
      settled = true;
      pending -= 1;
      if (pending === 0) release();
    };

    hydrator
      .load(firstResult)
      .then((unsubscribe) => {
        if (cancelled) {
          unsubscribe();
          return;
        }
        subscriptions.push(unsubscribe);
      })
      .catch((error: unknown) => {
        console.warn('Live content unavailable; showing build-time content.', error);
        firstResult();
      });
  });

  return () => {
    cancelled = true;
    subscriptions.forEach((unsubscribe) => unsubscribe());
    subscriptions.length = 0;
  };
}
