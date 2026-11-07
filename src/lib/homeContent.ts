import { doc, getDoc } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { readHomeServices, type HomeService } from './homeServices';

/**
 * Home page content written by the admin panel at `site/home`.
 *
 * The static HTML is the fallback. `watchHomeContent` subscribes to this
 * document and patches the opted-in elements, so an admin edit reaches open
 * tabs without a rebuild. Nothing here invents content: a missing or malformed
 * field is skipped and the build-time markup stays in place.
 *
 * Images are usually Firebase Storage URLs. When the admin project has no
 * Storage bucket, the panel stores compressed raster data URLs inline instead;
 * both forms are accepted below.
 */
export interface HomeImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface HomeProject {
  /** Null keeps the build-time fallback artwork in the featured project card. */
  image: HomeImage | null;
  category: string;
  venue: string;
  topic: string;
  /** Optional right-hand label. An empty string hides it. */
  tag: string;
}

export interface HomeContent {
  hero: HomeImage;
  featuredProjects: HomeProject[];
  featuredServices: HomeService[];
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readDimension(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Accepts hosted images and the inline-media fallback. Only raster data URLs
 * are allowed so an `img src` can never receive SVG or script-bearing content.
 */
function isSafeImageUrl(url: string): boolean {
  return (
    /^https:\/\//i.test(url) ||
    /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/]+={0,2}$/i.test(url)
  );
}

export function readHomeImage(value: unknown): HomeImage | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const url = readString(record.imageUrl).trim();
  if (!isSafeImageUrl(url)) return null;

  return {
    url,
    alt: readString(record.imageAlt).trim(),
    width: readDimension(record.imageWidth),
    height: readDimension(record.imageHeight),
  };
}

export function readHomeProject(value: unknown): HomeProject | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const imageUrl = readString(record.imageUrl).trim();
  const image = imageUrl ? readHomeImage(record) : null;
  const category = readString(record.category).trim();
  const venue = readString(record.venue).trim();
  const topic = readString(record.topic).trim();
  const tag = readString(record.tag).trim();

  // Keep the build-time illustration when a seeded card has no uploaded photo.
  // Reject malformed non-empty URLs rather than silently accepting unsafe data.
  if ((imageUrl && !image) || !category || !venue || !topic) return null;

  return { image, category, venue, topic, tag };
}

export function parseHomeContent(
  data: Record<string, unknown> | undefined,
): HomeContent | null {
  if (!data) return null;

  const hero = readHomeImage(data.hero);
  if (!hero) return null;

  const projects = Array.isArray(data.featuredProjects)
    ? data.featuredProjects
        .slice(0, 3)
        .map(readHomeProject)
        .filter((project): project is HomeProject => project !== null)
    : [];

  return {
    hero,
    featuredProjects: projects,
    featuredServices: readHomeServices(data.featuredServices),
  };
}

/**
 * One-shot read for callers that are not the browser runtime (tests, future
 * build-time tooling). Returns null on any failure; callers keep their
 * build-time content rather than showing placeholder values.
 */
export async function fetchHomeContent(): Promise<HomeContent | null> {
  try {
    const { db } = getFirebase();
    const snapshot = await getDoc(doc(db, 'site', 'home'));
    return parseHomeContent(snapshot.data());
  } catch (error) {
    console.warn('Home content unavailable; showing build-time content.', error);
    return null;
  }
}
