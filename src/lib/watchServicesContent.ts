import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebase } from './firebase';
import {
  parseServicesContentPatch,
  type ServicesPatch,
} from './servicesContent';

/**
 * Live hydration for the Services page.
 *
 * The page is prerendered with its current copy, so this only patches elements
 * that opted in with a `data-services-*` or `data-service-*` hook. A missing
 * document changes nothing. A malformed field is `null` in the patch and is
 * skipped, leaving just that field's build-time value in place.
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

function applyHero(hero: NonNullable<ServicesPatch['hero']>) {
  setTextAll('[data-services-hero-eyebrow]', hero.eyebrow);
  setTextAll('[data-services-hero-title]', hero.title);
  setTextAll('[data-services-hero-intro]', hero.intro);

  hero.quickLinks?.forEach((link, index) => {
    if (!link) return;
    const anchor = document.querySelector<HTMLAnchorElement>(
      `[data-services-quick-link="${index}"]`,
    );
    if (!anchor) return;

    if (link.target !== null) anchor.href = `#${link.target}`;
    setText(anchor, '[data-services-quick-label]', link.label);
    setText(anchor, '[data-services-quick-icon]', link.icon);
  });

  hero.metrics?.forEach((metric, index) => {
    if (!metric) return;
    const card = document.querySelector<HTMLElement>(
      `[data-services-metric="${index}"]`,
    );
    if (!card) return;

    setText(card, '[data-services-metric-kicker]', metric.kicker);
    setText(card, '[data-services-metric-title]', metric.title);
    setText(card, '[data-services-metric-description]', metric.description);
  });
}

function applyDirectory(directory: NonNullable<ServicesPatch['directory']>) {
  setTextAll('[data-services-directory-eyebrow]', directory.eyebrow);
  setTextAll('[data-services-directory-title]', directory.title);
  setTextAll('[data-services-directory-intro]', directory.intro);
}

function applyServices(services: NonNullable<ServicesPatch['services']>) {
  services.forEach((service, index) => {
    if (!service) return;
    const card = document.querySelector<HTMLElement>(
      `[data-service-card="${index}"]`,
    );
    if (!card) return;

    setText(card, '[data-service-icon]', service.icon);
    setText(card, '[data-service-category]', service.category);
    setText(card, '[data-service-title]', service.title);
    setText(card, '[data-service-description]', service.description);
    setText(card, '[data-service-scope]', service.scope);
    service.suitableFor.forEach((item, chipIndex) => {
      setText(card, `[data-service-suitable="${chipIndex}"]`, item);
    });
  });
}

function applyProcess(process: NonNullable<ServicesPatch['process']>) {
  setTextAll('[data-services-process-eyebrow]', process.eyebrow);
  setTextAll('[data-services-process-title]', process.title);
  setTextAll('[data-services-process-intro]', process.intro);

  process.steps?.forEach((step, index) => {
    if (!step) return;
    document
      .querySelectorAll<HTMLElement>(`[data-services-step="${index}"]`)
      .forEach((element) => {
        setText(element, '[data-services-step-title]', step.title);
        setText(element, '[data-services-step-description]', step.description);
        setText(
          element,
          '[data-services-step-description-mobile]',
          step.mobileDescription ?? step.description,
        );
      });
  });
}

function applyCta(cta: NonNullable<ServicesPatch['cta']>) {
  setTextAll('[data-services-cta-eyebrow]', cta.eyebrow);
  setTextAll('[data-services-cta-title]', cta.title);
  setTextAll('[data-services-cta-body]', cta.body);

  cta.points?.forEach((point, index) => {
    if (point === null) return;
    const wrapper = document.querySelector<HTMLElement>(
      `[data-services-cta-point="${index}"]`,
    );
    if (!wrapper) return;
    const target =
      wrapper.querySelector<HTMLElement>('[data-services-cta-point-text]') ?? wrapper;
    target.textContent = point;
  });
}

/** Returns an unsubscribe function, or a no-op when Firebase is unavailable. */
export function watchServicesContent(): () => void {
  try {
    const { db } = getFirebase();
    return onSnapshot(
      doc(db, 'site', 'services'),
      (snapshot) => {
        const data = snapshot.data();
        if (!data) return;

        const patch = parseServicesContentPatch(data);
        if (!patch) return;

        if (patch.hero) applyHero(patch.hero);
        if (patch.directory) applyDirectory(patch.directory);
        if (patch.services) applyServices(patch.services);
        if (patch.process) applyProcess(patch.process);
        if (patch.cta) applyCta(patch.cta);
      },
      (error) => {
        // Never fall back to placeholder content; leave the build-time HTML.
        console.warn(
          'Services content subscription failed; showing build-time content.',
          error,
        );
      },
    );
  } catch (error) {
    console.warn('Services content unavailable; showing build-time content.', error);
    return () => {};
  }
}
