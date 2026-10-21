import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { formatFacebookUrl } from './siteSettings';

/**
 * Live hydration for contact details.
 *
 * The static HTML is built with the values available at build time. This
 * subscribes to `site/settings` and patches any element that opted in with a
 * `data-site-*` attribute, so an edit in the admin panel reaches open tabs
 * without a rebuild or a refresh.
 *
 * Elements are addressed by attribute, not by id, so several pages can expose
 * the same field. Anything without a matching element is simply skipped, and a
 * field whose stored value is blank hides its element rather than printing a
 * placeholder.
 */
type Field = 'phone' | 'whatsapp' | 'email' | 'address' | 'facebookUrl' | 'location';

const FIELDS: Field[] = ['phone', 'whatsapp', 'email', 'address', 'facebookUrl', 'location'];

function applyField(field: Field, value: string, facebookLabel = '') {
  const targets = document.querySelectorAll<HTMLElement>(`[data-site-${field}]`);
  const unset = value.trim() === '';

  targets.forEach((el) => {
    if (unset) {
      // Hide the whole row, not just the text, so icons and labels go with it.
      const row = el.closest<HTMLElement>('[data-site-row]');
      (row ?? el).hidden = true;
      return;
    }

    const row = el.closest<HTMLElement>('[data-site-row]');
    if (row) row.hidden = false;

    // Links need href/aria-label updated; plain fields only need text.
    if (el instanceof HTMLAnchorElement) {
      if (field === 'phone') {
        el.href = `tel:${value.replace(/[\s().-]/g, '')}`;
      } else if (field === 'whatsapp') {
        const digits = value.replace(/[^\d]/g, '');
        el.href = `https://wa.me/${digits}`;
      } else if (field === 'facebookUrl') {
        el.href = value;
        el.setAttribute('aria-label', 'Visit Rajarata Engineering on Facebook');
        // The owner can override the visible text; otherwise show the address
        // they entered rather than the generic word "Facebook".
        const label = facebookLabel.trim();
        const valueTarget = el.querySelector<HTMLElement>('[data-site-value]') ?? el;
        valueTarget.textContent = label || formatFacebookUrl(value);
        return;
      } else if (field === 'email') {
        el.href = `mailto:${value}`;
      }
      el.setAttribute('aria-label', value);
    }

    // `data-site-format` keeps the displayed form separate from the raw value.
    const format = el.dataset.siteFormat;
    const text =
      format === 'whatsapp'
        ? `+${value.replace(/[^\d]/g, '')}`
        : value;
    const valueTarget = el.querySelector<HTMLElement>('[data-site-value]') ?? el;
    valueTarget.textContent = text;
  });
}

/** Returns an unsubscribe function, or a no-op when Firebase is unavailable. */
export function watchSiteSettings(): () => void {
  try {
    const { db } = getFirebase();
    return onSnapshot(
      doc(db, 'site', 'settings'),
      (snapshot) => {
        const data = snapshot.data();
        if (!data) return;
        const facebookLabel =
          typeof data.facebookLabel === 'string' ? data.facebookLabel : '';
        FIELDS.forEach((field) => {
          const value = data[field];
          applyField(field, typeof value === 'string' ? value : '', facebookLabel);
        });
      },
      (error) => {
        // Never fall back to placeholder content; leave the build-time HTML.
        console.warn('Site settings subscription failed; showing build-time values.', error);
      },
    );
  } catch (error) {
    console.warn('Site settings unavailable; showing build-time values.', error);
    return () => {};
  }
}
