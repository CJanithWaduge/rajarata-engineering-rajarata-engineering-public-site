import { doc, getDoc } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { parseAboutContent, type AboutContent } from './aboutContentParser';

export * from './aboutContentParser';

/**
 * One-shot read for tests or future tooling. Returns null on any failure so
 * callers keep their build-time content instead of showing placeholders.
 */
export async function fetchAboutContent(): Promise<AboutContent | null> {
  try {
    const { db } = getFirebase();
    const snapshot = await getDoc(doc(db, 'site', 'about'));
    return parseAboutContent(snapshot.data());
  } catch (error) {
    console.warn('About content unavailable; showing build-time content.', error);
    return null;
  }
}
