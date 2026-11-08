import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { getPrimaryContactAction } from './publicContact';
import { parsePhoneNumber } from './phone';
import { googleMapsLinkForEmbed, parseMapEmbedUrl } from './mapEmbed';
import { formatFacebookUrl } from './siteSettings';
import { parseWhatsAppNumber } from './whatsapp';

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
const FIELD_ATTRIBUTES: Record<Field, string> = {
  phone: 'phone',
  whatsapp: 'whatsapp',
  email: 'email',
  address: 'address',
  facebookUrl: 'facebook-url',
  location: 'location',
};

function applyField(field: Field, value: string, facebookLabel = '') {
  const targets = document.querySelectorAll<HTMLElement>(
    `[data-site-${FIELD_ATTRIBUTES[field]}]`,
  );
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

/** Patches every shared-site logo image when the admin supplies one. */
function applyLogo(data: Record<string, unknown>) {
  const url =
    typeof data.logoUrl === 'string' ? data.logoUrl.trim() : '';
  const alt =
    typeof data.logoAlt === 'string' ? data.logoAlt.trim() : '';
  const favicon = document.querySelector<HTMLLinkElement>('link[data-site-favicon]');
  if (favicon) {
    favicon.href = url || favicon.dataset.defaultHref || '/favicon.svg';
  }

  const imgs = document.querySelectorAll<HTMLImageElement>('[data-site-logo-image]');
  if (imgs.length === 0) return;

  imgs.forEach((img) => {
    if (url) {
      img.src = url;
      img.alt = alt || '';
      img.hidden = false;
    } else {
      img.hidden = true;
    }
  });

  imgs.forEach((img) => {
    const svg = img.parentElement?.querySelector<HTMLElement>('svg[data-site-logo-svg]');
    if (svg) {
      svg.hidden = !!url;
    }
  });
}

/**
 * Replaces the Contact page's fallback OpenStreetMap frame with the Google
 * Maps embed saved in the admin panel. A missing or malformed value is skipped,
 * so the build-time map and its link stay exactly as they were.
 */
function applyMap(data: Record<string, unknown>) {
  const raw = typeof data.mapEmbedUrl === 'string' ? data.mapEmbedUrl : '';
  const embed = parseMapEmbedUrl(raw);
  if (embed.status !== 'ready') return;

  const frame = document.querySelector<HTMLIFrameElement>('[data-site-map-embed]');
  if (!frame) return;

  frame.src = embed.value;
  frame.title = 'Head office location on Google Maps';
  frame.setAttribute('aria-label', 'Head office location on Google Maps');

  const link = document.querySelector<HTMLAnchorElement>('[data-site-map-link]');
  if (!link) return;

  const mapsLink = googleMapsLinkForEmbed(embed.value);
  if (!mapsLink) {
    // No coordinates to open: hide the link rather than send visitors to an
    // unrelated place. The frame itself still shows the admin's map.
    link.hidden = true;
    return;
  }

  link.hidden = false;
  link.href = mapsLink;
  link.textContent = 'Open in Google Maps';
  link.setAttribute(
    'aria-label',
    'Open the head office location in Google Maps (opens in a new tab)',
  );
}

/** Updates the Services CTA buttons from the same settings document. */
function applyServicesCta(data: Record<string, unknown>) {
  const phone = parsePhoneNumber(data.phone);
  const whatsapp = parseWhatsAppNumber(data.whatsapp);

  const primary = document.querySelector<HTMLAnchorElement>(
    '[data-site-primary-contact]',
  );
  if (primary && (phone.status === 'ready' || whatsapp.status === 'ready')) {
    const action = getPrimaryContactAction(whatsapp, phone);
    primary.href = action.href;
    primary.setAttribute('aria-label', action.label);
    const label =
      primary.querySelector<HTMLElement>('[data-site-primary-label]') ?? primary;
    label.textContent = action.label;
  }

  const call = document.querySelector<HTMLAnchorElement>('[data-site-phone-call]');
  if (call && phone.status === 'ready') {
    call.href = phone.href;
    call.setAttribute(
      'aria-label',
      `Call Rajarata Engineering at ${phone.displayNumber}`,
    );
    const value =
      call.querySelector<HTMLElement>('[data-site-phone-call-value]') ?? call;
    value.textContent = `Call ${phone.displayNumber}`;
  }
}

/**
 * Returns an unsubscribe function, or a no-op when Firebase is unavailable.
 *
 * `onFirstResult` fires once the first server snapshot has been applied (or
 * the read failed), which lets `contentHydration.ts` reveal the media gate.
 */
export function watchSiteSettings(onFirstResult?: () => void): () => void {
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    onFirstResult?.();
  };

  try {
    const { db } = getFirebase();
    return onSnapshot(
      doc(db, 'site', 'settings'),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (snapshot.metadata.fromCache) return;

        try {
          const data = snapshot.data() ?? {};
          const facebookLabel =
            typeof data.facebookLabel === 'string' ? data.facebookLabel : '';
          FIELDS.forEach((field) => {
            const value = data[field];
            applyField(field, typeof value === 'string' ? value : '', facebookLabel);
          });
          applyLogo(data);
          applyMap(data);
          applyServicesCta(data);
        } finally {
          settle();
        }
      },
      (error) => {
        // Never fall back to placeholder content; leave the build-time HTML.
        console.warn('Site settings subscription failed; showing build-time values.', error);
        settle();
      },
    );
  } catch (error) {
    console.warn('Site settings unavailable; showing build-time values.', error);
    settle();
    return () => {};
  }
}
