/**
 * Boots the Firestore-backed content hydration, off the critical path.
 *
 * Every page is prerendered with its final copy, so reading Firestore only
 * changes something when the admin panel has newer values. That makes the
 * Firestore SDK (~140 KB gzipped, mostly the WebChannel transport) pure
 * overhead for the first paint, so it is imported lazily:
 *
 * 1. wait for the `load` event, so the hero image and fonts have the
 *    connection to themselves;
 * 2. wait for an idle slot (capped at 2 s so it never stalls indefinitely);
 * 3. only import a feed when the document actually contains its hooks.
 *
 * A page whose markup has no `data-*` hook for a feed never downloads that
 * feed's code. Failures are logged and swallowed: the build-time markup is
 * always correct, so a missing document or a blocked network changes nothing.
 */

type Hydrator = {
  /** Presence of any of these elements proves the page needs this feed. */
  selector: string;
  /** Resolves to the feed's unsubscribe function. */
  load: () => Promise<() => void>;
};

const HYDRATORS: Hydrator[] = [
  {
    // Contact details live in the shared header and footer.
    selector:
      '[data-site-phone], [data-site-whatsapp], [data-site-email], [data-site-address], [data-site-facebook], [data-site-primary-contact]',
    load: () => import('./watchSiteSettings').then((module) => module.watchSiteSettings()),
  },
  {
    // Home page only.
    selector: '[data-home-hero-image], [data-home-project]',
    load: () => import('./watchHomeContent').then((module) => module.watchHomeContent()),
  },
  {
    // Services page only.
    selector: '[data-service-card], [data-services-hero-title]',
    load: () => import('./watchServicesContent').then((module) => module.watchServicesContent()),
  },
  {
    // About page only.
    selector:
      '[data-about-hero-title], [data-about-hero-image], [data-about-heritage-title], [data-about-card], [data-about-pillar], [data-about-method-step], [data-about-sector], [data-about-cta-title]',
    load: () => import('./watchAboutContent').then((module) => module.watchAboutContent()),
  },
  {
    // Projects page only.
    selector: '[data-project-card]',
    load: () => import('./watchProjectsContent').then((module) => module.watchProjectsContent()),
  },
];

/** Upper bound on how long an idle slot may be postponed by a busy page. */
const IDLE_TIMEOUT_MS = 2000;

function runWhenIdle(callback: () => void): void {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
    return;
  }
  window.setTimeout(callback, 200);
}

/**
 * Schedules hydration and returns a function that tears the subscriptions
 * down again. The return value is unused today; it exists so a client-side
 * navigation or a future framework island can clean up without leaking
 * listeners.
 */
export function startContentHydration(): () => void {
  const subscriptions: Array<() => void> = [];
  let scheduled = false;
  let cancelled = false;

  const start = () => {
    if (scheduled) return;
    scheduled = true;

    runWhenIdle(() => {
      if (cancelled) return;

      HYDRATORS.forEach((hydrator) => {
        if (!document.querySelector(hydrator.selector)) return;

        hydrator
          .load()
          .then((unsubscribe) => {
            if (cancelled) {
              unsubscribe();
              return;
            }
            subscriptions.push(unsubscribe);
          })
          .catch((error: unknown) => {
            console.warn('Live content unavailable; showing build-time content.', error);
          });
      });
    });
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });

  return () => {
    cancelled = true;
    subscriptions.forEach((unsubscribe) => unsubscribe());
    subscriptions.length = 0;
  };
}
