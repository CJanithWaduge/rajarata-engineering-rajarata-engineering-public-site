import { doc, getDoc } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { parsePhoneNumber, type PhoneContact } from './phone';
import { parseWhatsAppNumber, type WhatsAppContact } from './whatsapp';

/**
 * Site-wide settings written by the admin panel at `site/settings`.
 *
 * This module is the single read path for that document. It is deliberately
 * separate from `publicContact.ts`, which still resolves the build-time
 * environment values — see that file for how the two are reconciled.
 */
export interface SiteSettings {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  facebookUrl: string;
  facebookLabel: string;
  location: string;
}

export const EMPTY_SETTINGS: SiteSettings = {
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  facebookUrl: '',
  facebookLabel: '',
  location: '',
};

/** A field is "unset" when it is absent or blank; the UI hides unset rows. */
export function isUnset(value: string | undefined | null): boolean {
  return value === undefined || value === null || value.trim() === '';
}

function toSettings(data: Record<string, unknown> | undefined): SiteSettings {
  const read = (key: keyof SiteSettings) => {
    const value = data?.[key];
    return typeof value === 'string' ? value : '';
  };
  return {
    phone: read('phone'),
    whatsapp: read('whatsapp'),
    email: read('email'),
    address: read('address'),
    facebookUrl: read('facebookUrl'),
    facebookLabel: read('facebookLabel'),
    location: read('location'),
  };
}

/**
 * Resolves to the stored settings, or `null` when the document does not exist
 * or cannot be read. Callers decide what to hide; this never substitutes
 * fallback or placeholder content.
 */
export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  try {
    const { db } = getFirebase();
    const snapshot = await getDoc(doc(db, 'site', 'settings'));
    if (!snapshot.exists()) return null;
    return toSettings(snapshot.data());
  } catch (error) {
    console.warn('Could not read site settings; contact details stay hidden.', error);
    return null;
  }
}

/** Email and Facebook have no build-time fallback, only stored values. */
export function parseEmail(value: string): { status: 'ready' | 'missing'; value: string } {
  if (isUnset(value)) return { status: 'missing', value: '' };
  const email = value.trim();
  // Deliberately permissive: the admin panel is the validating surface.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? { status: 'ready', value: email }
    : { status: 'missing', value: '' };
}

export function parseHttpUrl(value: string): { status: 'ready' | 'missing'; value: string } {
  if (isUnset(value)) return { status: 'missing', value: '' };
  return /^https:\/\/\S+$/.test(value.trim())
    ? { status: 'ready', value: value.trim() }
    : { status: 'missing', value: '' };
}

/**
 * Link text for a Facebook page, derived from the URL:
 * `https://www.facebook.com/rajarata/` -> `facebook.com/rajarata`.
 * Used when the optional `facebookLabel` field is empty, so the footer shows
 * the address the owner actually entered instead of a generic word.
 */
export function formatFacebookUrl(value: string): string {
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./i, '');
    const path = url.pathname.replace(/\/+$/, '');
    return `${host}${path}${url.search}`;
  } catch {
    return trimmed;
  }
}

export type { PhoneContact, WhatsAppContact };

export { parsePhoneNumber, parseWhatsAppNumber };
