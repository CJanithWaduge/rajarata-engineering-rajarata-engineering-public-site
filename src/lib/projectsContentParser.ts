/**
 * Projects page content written by the admin panel at `site/projects`.
 *
 * The Astro page is prerendered, so this module only describes the runtime
 * patch. Every text field is optional in the admin form: a blank string means
 * "keep the build-time copy for that slot". A project category outside the
 * allowlist means the whole project slot is invalid (`null`).
 *
 * A malformed or over-limit field is also `null`, so one bad value cannot take
 * the rest of the page down. Fixed array counts are still required; a wrong
 * count leaves that whole group at its build-time values.
 */
export const PROJECT_COUNT = 6;
export const TRACK_RECORD_COUNT = 3;

/** Mirrors the admin panel's project category allowlist. */
const PROJECT_CATEGORIES = new Set([
  'residential',
  'commercial',
  'industrial',
  'elv',
  'maintenance',
]);

/** Mirrors the text ceilings the admin panel enforces. */
const LIMITS = {
  heroEyebrow: 48,
  heroTitle: 100,
  heroIntro: 600,
  projectSubTag: 60,
  projectLocation: 60,
  projectYear: 20,
  projectType: 60,
  projectTitle: 100,
  projectSummary: 320,
  projectRef: 80,
  projectSpecLabel: 60,
  projectSpecValue: 80,
  projectSpecDetail: 600,
  trackKicker: 60,
  trackValue: 20,
  trackDescription: 300,
  ctaEyebrow: 48,
  ctaTitle: 100,
  ctaBody: 600,
} as const;

export interface ProjectImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProjectContent {
  category: string;
  subTag: string;
  location: string;
  year: string;
  typePlaceholder: string;
  title: string;
  summary: string;
  ref: string;
  specLabel: string;
  specValue: string;
  specDetail: string;
  image: ProjectImage;
}

export interface TrackRecordColumn {
  kicker: string;
  value: string;
  description: string;
}

export interface ProjectsContent {
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  portfolio: {
    projects: ProjectContent[];
  };
  trackRecord: {
    columns: TrackRecordColumn[];
  };
  cta: {
    eyebrow: string;
    title: string;
    body: string;
  };
}

export interface ProjectContentPatch {
  category: string | null;
  subTag: string | null;
  location: string | null;
  year: string | null;
  typePlaceholder: string | null;
  title: string | null;
  summary: string | null;
  ref: string | null;
  specLabel: string | null;
  specValue: string | null;
  specDetail: string | null;
  image: ProjectImage | null;
}

export interface TrackRecordColumnPatch {
  kicker: string | null;
  value: string | null;
  description: string | null;
}

export interface ProjectsPatch {
  hero: {
    eyebrow: string | null;
    title: string | null;
    intro: string | null;
  } | null;
  portfolio: {
    projects: Array<ProjectContentPatch | null>;
  } | null;
  trackRecord: {
    columns: Array<TrackRecordColumnPatch | null>;
  } | null;
  cta: {
    eyebrow: string | null;
    title: string | null;
    body: string | null;
  } | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * A blank string is a valid "keep the build-time value" marker and returns
 * `null`, as does anything malformed or over the admin limit.
 */
function readText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text || text.length > max) return null;
  return text;
}

function readCategory(value: unknown): string | null {
  return typeof value === 'string' && PROJECT_CATEGORIES.has(value)
    ? value
    : null;
}

function readDimension(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : 0;
}

/**
 * Accepts hosted images and the admin's inline-media fallback. Only raster
 * data URLs are allowed; an empty URL means "keep the public image".
 */
function isSafeImageUrl(url: string): boolean {
  return (
    /^https:\/\//i.test(url) ||
    /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/]+={0,2}$/i.test(url)
  );
}

/** Partial read: a missing or invalid image means "keep the public image". */
function readImage(value: unknown): ProjectImage | null {
  if (!isRecord(value)) return null;

  const url = typeof value.imageUrl === 'string' ? value.imageUrl.trim() : '';
  if (!isSafeImageUrl(url)) return null;

  return {
    url,
    alt: typeof value.imageAlt === 'string' ? value.imageAlt.trim() : '',
    width: readDimension(value.imageWidth),
    height: readDimension(value.imageHeight),
  };
}

function emptyImage(): ProjectImage {
  return { url: '', alt: '', width: 0, height: 0 };
}

/** Strict read: blank is valid; a malformed or unsafe image rejects the doc. */
function strictImage(value: unknown): ProjectImage | null {
  if (value === undefined) return emptyImage();
  if (!isRecord(value)) return emptyImage();

  const url = typeof value.imageUrl === 'string' ? value.imageUrl.trim() : '';
  if (url === '') return emptyImage();
  if (!isSafeImageUrl(url)) return null;

  const width = readDimension(value.imageWidth);
  const height = readDimension(value.imageHeight);
  if (width > 0 && height > 0 && Math.abs(width / height - 3 / 2) > 0.01) {
    return null;
  }

  return {
    url,
    alt: typeof value.imageAlt === 'string' ? value.imageAlt.trim() : '',
    width,
    height,
  };
}

function readList<T>(
  value: unknown,
  count: number,
  read: (item: unknown) => T | null,
): Array<T | null> | null {
  if (!Array.isArray(value) || value.length !== count) return null;
  return value.map(read);
}

function readProject(value: unknown): ProjectContentPatch | null {
  if (!isRecord(value)) return null;
  const category = readCategory(value.category);
  if (!category) return null;

  return {
    category,
    subTag: readText(value.subTag, LIMITS.projectSubTag),
    location: readText(value.location, LIMITS.projectLocation),
    year: readText(value.year, LIMITS.projectYear),
    typePlaceholder: readText(value.typePlaceholder, LIMITS.projectType),
    title: readText(value.title, LIMITS.projectTitle),
    summary: readText(value.summary, LIMITS.projectSummary),
    ref: readText(value.ref, LIMITS.projectRef),
    specLabel: readText(value.specLabel, LIMITS.projectSpecLabel),
    specValue: readText(value.specValue, LIMITS.projectSpecValue),
    specDetail: readText(value.specDetail, LIMITS.projectSpecDetail),
    image: readImage(value.image),
  };
}

function readColumn(value: unknown): TrackRecordColumnPatch | null {
  if (!isRecord(value)) return null;
  return {
    kicker: readText(value.kicker, LIMITS.trackKicker),
    value: readText(value.value, LIMITS.trackValue),
    description: readText(value.description, LIMITS.trackDescription),
  };
}

/** Partial parse used by the watcher: `null` fields keep their build-time value. */
export function parseProjectsContentPatch(
  data: Record<string, unknown> | undefined,
): ProjectsPatch | null {
  if (!data) return null;

  const hero = isRecord(data.hero)
    ? {
        eyebrow: readText(data.hero.eyebrow, LIMITS.heroEyebrow),
        title: readText(data.hero.title, LIMITS.heroTitle),
        intro: readText(data.hero.intro, LIMITS.heroIntro),
      }
    : null;

  const portfolioProjects = isRecord(data.portfolio)
    ? readList(data.portfolio.projects, PROJECT_COUNT, readProject)
    : null;
  const portfolio = portfolioProjects ? { projects: portfolioProjects } : null;

  const trackColumns = isRecord(data.trackRecord)
    ? readList(data.trackRecord.columns, TRACK_RECORD_COUNT, readColumn)
    : null;
  const trackRecord = trackColumns ? { columns: trackColumns } : null;

  const cta = isRecord(data.cta)
    ? {
        eyebrow: readText(data.cta.eyebrow, LIMITS.ctaEyebrow),
        title: readText(data.cta.title, LIMITS.ctaTitle),
        body: readText(data.cta.body, LIMITS.ctaBody),
      }
    : null;

  return { hero, portfolio, trackRecord, cta };
}

/** Strict text: blank is valid (it means "keep the build-time copy"). */
function strictText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > max ? null : text;
}

function strictCategory(value: unknown): string | null {
  return typeof value === 'string' && PROJECT_CATEGORIES.has(value)
    ? value
    : null;
}

function strictList<T>(
  value: unknown,
  count: number,
  read: (item: unknown) => T | null,
): T[] | null {
  if (!Array.isArray(value) || value.length !== count) return null;
  const items = value.map(read);
  if (items.some((item) => item === null)) return null;
  return items as T[];
}

function strictProject(value: unknown): ProjectContent | null {
  if (!isRecord(value)) return null;
  const category = strictCategory(value.category);
  const subTag = strictText(value.subTag, LIMITS.projectSubTag);
  const location = strictText(value.location, LIMITS.projectLocation);
  const year = strictText(value.year, LIMITS.projectYear);
  const typePlaceholder = strictText(value.typePlaceholder, LIMITS.projectType);
  const title = strictText(value.title, LIMITS.projectTitle);
  const summary = strictText(value.summary, LIMITS.projectSummary);
  const ref = strictText(value.ref, LIMITS.projectRef);
  const specLabel = strictText(value.specLabel, LIMITS.projectSpecLabel);
  const specValue = strictText(value.specValue, LIMITS.projectSpecValue);
  const specDetail = strictText(value.specDetail, LIMITS.projectSpecDetail);
  const image = strictImage(value.image);

  if (!category) return null;
  if (!image) return null;
  if (
    subTag === null ||
    location === null ||
    year === null ||
    typePlaceholder === null ||
    title === null ||
    summary === null ||
    ref === null ||
    specLabel === null ||
    specValue === null ||
    specDetail === null
  ) {
    return null;
  }

  return {
    category,
    subTag,
    location,
    year,
    typePlaceholder,
    title,
    summary,
    ref,
    specLabel,
    specValue,
    specDetail,
    image,
  };
}

function strictColumn(value: unknown): TrackRecordColumn | null {
  if (!isRecord(value)) return null;
  const kicker = strictText(value.kicker, LIMITS.trackKicker);
  const valueText = strictText(value.value, LIMITS.trackValue);
  const description = strictText(value.description, LIMITS.trackDescription);
  if (kicker === null || valueText === null || description === null) return null;
  return { kicker, value: valueText, description };
}

/**
 * Strict parse: the whole document must have the expected sections and fixed
 * counts. Blank strings are accepted and preserved because they mean "keep the
 * build-time value"; any malformed or over-limit field rejects the document.
 */
export function parseProjectsContent(
  data: Record<string, unknown> | undefined,
): ProjectsContent | null {
  if (!data) return null;

  const hero = isRecord(data.hero)
    ? {
        eyebrow: strictText(data.hero.eyebrow, LIMITS.heroEyebrow),
        title: strictText(data.hero.title, LIMITS.heroTitle),
        intro: strictText(data.hero.intro, LIMITS.heroIntro),
      }
    : null;
  if (!hero) return null;
  const { eyebrow: heroEyebrow, title: heroTitle, intro: heroIntro } = hero;
  if (heroEyebrow === null || heroTitle === null || heroIntro === null) {
    return null;
  }

  const portfolio = isRecord(data.portfolio)
    ? strictList(data.portfolio.projects, PROJECT_COUNT, strictProject)
    : null;
  if (!portfolio) return null;

  const trackRecord = isRecord(data.trackRecord)
    ? strictList(data.trackRecord.columns, TRACK_RECORD_COUNT, strictColumn)
    : null;
  if (!trackRecord) return null;

  const cta = isRecord(data.cta)
    ? {
        eyebrow: strictText(data.cta.eyebrow, LIMITS.ctaEyebrow),
        title: strictText(data.cta.title, LIMITS.ctaTitle),
        body: strictText(data.cta.body, LIMITS.ctaBody),
      }
    : null;
  if (!cta) return null;
  const { eyebrow: ctaEyebrow, title: ctaTitle, body: ctaBody } = cta;
  if (ctaEyebrow === null || ctaTitle === null || ctaBody === null) {
    return null;
  }

  return {
    hero: { eyebrow: heroEyebrow, title: heroTitle, intro: heroIntro },
    portfolio: { projects: portfolio },
    trackRecord: { columns: trackRecord },
    cta: { eyebrow: ctaEyebrow, title: ctaTitle, body: ctaBody },
  };
}
