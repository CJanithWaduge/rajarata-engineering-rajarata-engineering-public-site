/**
 * Iconify fallback for icons the self-hosted Material Symbols subset cannot
 * render.
 *
 * The admin panel's Home service picker searches Iconify and stores a chosen
 * glyph as `material-symbols:<slug>`. The subset font holds only the icons the
 * build-time pages use, so anything else is rendered as an on-demand SVG mask
 * by `watchHomeContent.ts`. The slug is interpolated into that SVG URL, so it
 * is limited to lowercase kebab-case; never widen this without also tightening
 * the admin validation.
 */
export const ICONIFY_MATERIAL_PREFIX = 'material-symbols:';

const ICONIFY_ICON_NAME_PATTERN = /^material-symbols:[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isIconifyIconName(value: string): boolean {
  return ICONIFY_ICON_NAME_PATTERN.test(value);
}

/** Remote SVG for a safe Iconify name; `null` for a curated font icon. */
export function iconifyIconUrl(value: string): string | null {
  if (!isIconifyIconName(value)) return null;
  const slug = value.slice(ICONIFY_MATERIAL_PREFIX.length);
  return `https://api.iconify.design/material-symbols/${slug}.svg`;
}
