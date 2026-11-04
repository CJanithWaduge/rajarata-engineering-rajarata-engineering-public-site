/**
 * Services page content written by the admin panel at `site/services`.
 *
 * The Astro page is prerendered, so this module only describes the runtime
 * patch. A missing document leaves the build-time HTML untouched. Individual
 * malformed fields are represented as `null` in the patch so the watcher can
 * skip just that field; `parseServicesContent` is the strict form used by
 * one-shot callers and returns `null` unless the whole document is valid.
 */
export const SERVICE_COUNT = 8;
export const QUICK_LINK_COUNT = 4;
export const METRIC_COUNT = 4;
export const PROCESS_STEP_COUNT = 6;
export const CTA_POINT_COUNT = 2;
export const SUITABLE_FOR_COUNT = 4;

const SERVICE_ICONS = new Set([
  'apartment',
  'precision_manufacturing',
  'developer_board',
  'linear_scale',
  'fact_check',
  'build',
  'router',
  'bolt',
  'factory',
  'settings_ethernet',
]);

const SERVICE_ANCHORS = new Set([
  'service-01',
  'service-02',
  'service-03',
  'service-04',
  'service-05',
  'service-06',
  'service-07',
  'service-08',
]);

export interface ServicesQuickLink {
  label: string;
  icon: string;
  target: string;
}

export interface ServicesMetric {
  kicker: string;
  title: string;
  description: string;
}

export interface ServicesServiceCard {
  icon: string;
  category: string;
  title: string;
  description: string;
  scope: string;
  suitableFor: string[];
}

export interface ServicesProcessStep {
  title: string;
  description: string;
  mobileDescription: string;
}

/** Blank mobile overrides reuse the desktop copy. */
export function stepDescriptionForMobile(step: ServicesProcessStep): string {
  return step.mobileDescription || step.description;
}

export interface ServicesContent {
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
    quickLinks: ServicesQuickLink[];
    metrics: ServicesMetric[];
  };
  directory: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  services: ServicesServiceCard[];
  process: {
    eyebrow: string;
    title: string;
    intro: string;
    steps: ServicesProcessStep[];
  };
  cta: {
    eyebrow: string;
    title: string;
    body: string;
    points: string[];
  };
}

export interface ServicesPatch {
  hero: {
    eyebrow: string | null;
    title: string | null;
    intro: string | null;
    quickLinks: Array<ServicesQuickLinkPatch | null> | null;
    metrics: Array<ServicesMetricPatch | null> | null;
  } | null;
  directory: {
    eyebrow: string | null;
    title: string | null;
    intro: string | null;
  } | null;
  services: Array<ServicesServiceCard | null> | null;
  process: {
    eyebrow: string | null;
    title: string | null;
    intro: string | null;
    steps: Array<ServicesProcessStepPatch | null> | null;
  } | null;
  cta: {
    eyebrow: string | null;
    title: string | null;
    body: string | null;
    points: Array<string | null> | null;
  } | null;
}

/**
 * A quick link can be partially valid. `null` means "leave the build-time value
 * for this field"; a malformed sibling does not force the whole chip to fall
 * back.
 */
export interface ServicesQuickLinkPatch {
  label: string | null;
  icon: string | null;
  target: string | null;
}

export interface ServicesMetricPatch {
  kicker: string | null;
  title: string | null;
  description: string | null;
}

export interface ServicesProcessStepPatch {
  title: string | null;
  description: string | null;
  /** Valid non-empty mobile override, or null to reuse `description`. */
  mobileDescription: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text || text.length > max) return null;
  return text;
}

function readIcon(value: unknown): string | null {
  return typeof value === 'string' && SERVICE_ICONS.has(value) ? value : null;
}

function readTarget(value: unknown): string | null {
  return typeof value === 'string' && SERVICE_ANCHORS.has(value) ? value : null;
}

function readQuickLink(value: unknown): ServicesQuickLinkPatch | null {
  if (!isRecord(value)) return null;
  return {
    label: readText(value.label, 40),
    icon: readIcon(value.icon),
    target: readTarget(value.target),
  };
}

function readMetric(value: unknown): ServicesMetricPatch | null {
  if (!isRecord(value)) return null;
  return {
    kicker: readText(value.kicker, 24),
    title: readText(value.title, 32),
    description: readText(value.description, 100),
  };
}

function readService(value: unknown): ServicesServiceCard | null {
  if (!isRecord(value)) return null;
  const icon = readIcon(value.icon);
  const category = readText(value.category, 40);
  const title = readText(value.title, 80);
  const description = readText(value.description, 320);
  const scope = readText(value.scope, 500);

  if (!icon || !category || !title || !description || !scope) return null;
  if (!Array.isArray(value.suitableFor) || value.suitableFor.length !== SUITABLE_FOR_COUNT) {
    return null;
  }

  const suitableFor = value.suitableFor.map((item) => readText(item, 40));
  if (suitableFor.some((item) => item === null)) return null;

  return {
    icon,
    category,
    title,
    description,
    scope,
    suitableFor: suitableFor as string[],
  };
}

function readStep(value: unknown): ServicesProcessStepPatch | null {
  if (!isRecord(value)) return null;

  // A missing, malformed, or blank mobile override falls back to the desktop
  // copy; represent that as null so the watcher can decide per field.
  const mobile =
    typeof value.mobileDescription === 'string' ? value.mobileDescription.trim() : '';
  const mobileDescription = mobile && mobile.length <= 300 ? mobile : null;

  return {
    title: readText(value.title, 60),
    description: readText(value.description, 300),
    mobileDescription,
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

export function parseServicesContentPatch(
  data: Record<string, unknown> | undefined,
): ServicesPatch | null {
  if (!data) return null;

  const hero = isRecord(data.hero)
    ? {
        eyebrow: readText(data.hero.eyebrow, 48),
        title: readText(data.hero.title, 100),
        intro: readText(data.hero.intro, 600),
        quickLinks: readList(data.hero.quickLinks, QUICK_LINK_COUNT, readQuickLink),
        metrics: readList(data.hero.metrics, METRIC_COUNT, readMetric),
      }
    : null;

  const directory = isRecord(data.directory)
    ? {
        eyebrow: readText(data.directory.eyebrow, 48),
        title: readText(data.directory.title, 100),
        intro: readText(data.directory.intro, 600),
      }
    : null;

  const services = readList(data.services, SERVICE_COUNT, readService);

  const process = isRecord(data.process)
    ? {
        eyebrow: readText(data.process.eyebrow, 48),
        title: readText(data.process.title, 100),
        intro: readText(data.process.intro, 600),
        steps: readList(data.process.steps, PROCESS_STEP_COUNT, readStep),
      }
    : null;

  const cta = isRecord(data.cta)
    ? {
        eyebrow: readText(data.cta.eyebrow, 48),
        title: readText(data.cta.title, 100),
        body: readText(data.cta.body, 600),
        points: readList(data.cta.points, CTA_POINT_COUNT, (item) =>
          readText(item, 80),
        ),
      }
    : null;

  return { hero, directory, services, process, cta };
}

function complete<T>(items: Array<T | null> | null): T[] | null {
  if (!items || items.some((item) => item === null)) return null;
  return items as T[];
}

function completeQuickLinks(
  items: Array<ServicesQuickLinkPatch | null> | null,
): ServicesQuickLink[] | null {
  if (!items) return null;
  const result: ServicesQuickLink[] = [];
  for (const item of items) {
    if (!item || !item.label || !item.icon || !item.target) return null;
    result.push({ label: item.label, icon: item.icon, target: item.target });
  }
  return result;
}

function completeMetrics(
  items: Array<ServicesMetricPatch | null> | null,
): ServicesMetric[] | null {
  if (!items) return null;
  const result: ServicesMetric[] = [];
  for (const item of items) {
    if (!item || !item.kicker || !item.title || !item.description) return null;
    result.push({
      kicker: item.kicker,
      title: item.title,
      description: item.description,
    });
  }
  return result;
}

function completeSteps(
  items: Array<ServicesProcessStepPatch | null> | null,
): ServicesProcessStep[] | null {
  if (!items) return null;
  const result: ServicesProcessStep[] = [];
  for (const item of items) {
    if (!item || !item.title || !item.description) return null;
    result.push({
      title: item.title,
      description: item.description,
      mobileDescription: item.mobileDescription ?? item.description,
    });
  }
  return result;
}

/** Strict parse: any missing or malformed field makes the whole document null. */
export function parseServicesContent(
  data: Record<string, unknown> | undefined,
): ServicesContent | null {
  const patch = parseServicesContentPatch(data);
  if (!patch || !patch.hero || !patch.directory || !patch.process || !patch.cta) {
    return null;
  }

  const quickLinks = completeQuickLinks(patch.hero.quickLinks);
  const metrics = completeMetrics(patch.hero.metrics);
  const services = complete(patch.services);
  const steps = completeSteps(patch.process.steps);
  const points = complete(patch.cta.points);

  if (
    !patch.hero.eyebrow ||
    !patch.hero.title ||
    !patch.hero.intro ||
    !quickLinks ||
    !metrics ||
    !patch.directory.eyebrow ||
    !patch.directory.title ||
    !patch.directory.intro ||
    !services ||
    !patch.process.eyebrow ||
    !patch.process.title ||
    !patch.process.intro ||
    !steps ||
    !patch.cta.eyebrow ||
    !patch.cta.title ||
    !patch.cta.body ||
    !points
  ) {
    return null;
  }

  return {
    hero: {
      eyebrow: patch.hero.eyebrow,
      title: patch.hero.title,
      intro: patch.hero.intro,
      quickLinks,
      metrics,
    },
    directory: {
      eyebrow: patch.directory.eyebrow,
      title: patch.directory.title,
      intro: patch.directory.intro,
    },
    services,
    process: {
      eyebrow: patch.process.eyebrow,
      title: patch.process.title,
      intro: patch.process.intro,
      steps,
    },
    cta: {
      eyebrow: patch.cta.eyebrow,
      title: patch.cta.title,
      body: patch.cta.body,
      points,
    },
  };
}
