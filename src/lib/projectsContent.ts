import { doc, getDoc } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { parseProjectsContent, type ProjectsContent } from './projectsContentParser';

export * from './projectsContentParser';

/**
 * One-shot read for tests or future tooling. Returns null on any failure so
 * callers keep their build-time content instead of showing placeholders.
 */
export async function fetchProjectsContent(): Promise<ProjectsContent | null> {
  try {
    const { db } = getFirebase();
    const snapshot = await getDoc(doc(db, 'site', 'projects'));
    return parseProjectsContent(snapshot.data());
  } catch (error) {
    console.warn('Projects content unavailable; showing build-time content.', error);
    return null;
  }
}
