import { doc, getDoc } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { parseServicesContent, type ServicesContent } from './servicesContentParser';

export * from './servicesContentParser';

/**
 * One-shot read for tests or future tooling. Returns null on any failure so
 * callers keep their build-time content instead of showing placeholders.
 */
export async function fetchServicesContent(): Promise<ServicesContent | null> {
  try {
    const { db } = getFirebase();
    const snapshot = await getDoc(doc(db, 'site', 'services'));
    return parseServicesContent(snapshot.data());
  } catch (error) {
    console.warn('Services content unavailable; showing build-time content.', error);
    return null;
  }
}
