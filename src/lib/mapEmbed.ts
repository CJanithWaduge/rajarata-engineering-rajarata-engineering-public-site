/**
 * Validation and link building for the Google Maps embed stored by the admin
 * panel in `site/settings`.
 *
 * Only an https URL on google.com's `/maps/embed` path with a `pb` query is
 * accepted. That is what keeps a mistyped or hand-edited value from becoming an
 * arbitrary iframe source: anything else is reported as missing and the
 * build-time OpenStreetMap frame stays in place.
 *
 * The admin field normally stores a bare URL, but a hand-edited document might
 * hold the whole paste, so the `src` is extracted when present.
 */

export interface MapEmbedResult {
  status: 'ready' | 'missing';
  value: string;
}

const ALLOWED_HOSTS = new Set(['www.google.com', 'google.com', 'maps.google.com']);

export function parseMapEmbedUrl(value: string | undefined | null): MapEmbedResult {
  if (value === undefined || value === null || value.trim() === '') {
    return { status: 'missing', value: '' };
  }

  const iframe = value.match(
    /<iframe\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
  );
  const candidate = (iframe?.[1] ?? iframe?.[2] ?? iframe?.[3] ?? value.trim())
    .replace(/&amp;/gi, '&')
    .trim();

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/\/+$/, '');

    if (
      url.protocol === 'https:' &&
      ALLOWED_HOSTS.has(host) &&
      path === '/maps/embed' &&
      url.searchParams.has('pb')
    ) {
      return { status: 'ready', value: url.toString() };
    }
  } catch {
    // Fall through to the build-time map.
  }

  return { status: 'missing', value: '' };
}

/**
 * Builds an "Open in Google Maps" link from the coordinates inside the embed's
 * `pb` parameter (`!3d` is latitude, `!2d` is longitude). Returns null when the
 * coordinates are absent, so the caller can hide the link instead of pointing
 * somewhere unrelated.
 */
export function googleMapsLinkForEmbed(value: string): string | null {
  try {
    const pb = new URL(value).searchParams.get('pb');
    if (!pb) return null;

    const latitude = /!3d(-?\d+(?:\.\d+)?)/.exec(pb)?.[1];
    const longitude = /!2d(-?\d+(?:\.\d+)?)/.exec(pb)?.[1];
    if (!latitude || !longitude) return null;

    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  } catch {
    return null;
  }
}
