/**
 * About page content written by the admin panel at `site/about`.
 *
 * The Astro page is prerendered, so this module only describes the runtime
 * patch. Every text field is optional in the admin form: a blank string means
 * "keep the build-time copy for that slot". A blank icon means "keep the
 * build-time icon", and an empty hero image URL means "keep the build-time
 * hero". Those cases become `null` in the patch, and the watcher skips them.
 *
 * A malformed or over-limit field is also `null`, so one bad value cannot take
 * the rest of the page down. Fixed array counts are still required; a wrong
 * count leaves that whole group at its build-time values.
 */
export const SNAPSHOT_COUNT = 3;
export const MILESTONE_COUNT = 4;
export const PILLAR_COUNT = 5;
export const METHOD_STEP_COUNT = 5;
export const SECTOR_COUNT = 6;

/** Mirrors `ABOUT_ICONS` in the admin panel; empty means "keep the default". */
const ABOUT_ICONS = new Set([
  'health_and_safety',
  'precision_manufacturing',
  'balance',
  'schedule',
  'trending_up',
  'manage_search',
  'architecture',
  'handyman',
  'fact_check',
  'contact_support',
  'storefront',
  'apartment',
  'hotel',
  'warehouse',
  'local_hospital',
  'domain_verification',
]);

/** Mirrors `ABOUT_TEXT_LIMITS` in the admin panel. */
const LIMITS = {
  heroEyebrow: 48,
  heroTitle: 100,
  heroIntro: 600,
  heroAlt: 160,
  heroApproachLabel: 48,
  snapshotLabel: 32,
  snapshotTitle: 32,
  snapshotDescription: 100,
  overlayTitle: 60,
  overlayDescription: 120,
  overlayStage: 40,
  overlayStageLabel: 40,
  heritageEyebrow: 48,
  heritageTitle: 100,
  heritageNarrative: 900,
  heritageApproach: 300,
  heritageBasedInLabel: 40,
  heritageBasedInValue: 80,
  heritageApproachLabel: 40,
  milestoneKicker: 40,
  milestoneBadge: 24,
  milestoneTitle: 80,
  milestoneDescription: 300,
  visionEyebrow: 40,
  visionTitle: 60,
  visionBody: 600,
  visionFooter: 80,
  pillarsEyebrow: 48,
  pillarsTitle: 100,
  pillarsIntro: 400,
  pillarTitle: 40,
  pillarDescription: 240,
  pillarFooter: 60,
  methodologyEyebrow: 48,
  methodologyTitle: 100,
  methodologyIntro: 400,
  methodologyProtocolLabel: 40,
  methodologyStagesLabel: 40,
  methodStepTitle: 40,
  methodStepDescription: 300,
  methodStepFooter: 40,
  industriesEyebrow: 48,
  industriesTitle: 100,
  industriesIntro: 400,
  sectorTitle: 60,
  sectorDescription: 240,
  ctaEyebrow: 48,
  ctaTitle: 100,
  ctaBody: 600,
  ctaProjectsLabel: 40,
  ctaPhoneLabel: 24,
  ctaWhatsappLabel: 24,
} as const;

export interface AboutImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface AboutSnapshot {
  title: string;
  description: string;
}

export interface AboutOverlay {
  title: string;
  description: string;
  stage: string;
  stageLabel: string;
}

export interface AboutMilestone {
  kicker: string;
  badge: string;
  title: string;
  description: string;
}

export interface AboutVisionCard {
  eyebrow: string;
  title: string;
  body: string;
  footer: string;
}

export interface AboutPillar {
  icon: string;
  title: string;
  description: string;
  footer: string;
}

export interface AboutMethodStep {
  icon: string;
  title: string;
  description: string;
  footer: string;
}

export interface AboutSector {
  icon: string;
  title: string;
  description: string;
}

export interface AboutContent {
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
    approachLabel: string;
    snapshotLabel: string;
    image: AboutImage;
    snapshots: AboutSnapshot[];
    overlay: AboutOverlay;
  };
  heritage: {
    eyebrow: string;
    title: string;
    narrative: string;
    approach: string;
    basedInLabel: string;
    basedInValue: string;
    approachLabel: string;
    milestones: AboutMilestone[];
  };
  visionMission: {
    vision: AboutVisionCard;
    mission: AboutVisionCard;
  };
  pillars: {
    eyebrow: string;
    title: string;
    intro: string;
    items: AboutPillar[];
  };
  methodology: {
    eyebrow: string;
    title: string;
    intro: string;
    protocolLabel: string;
    stagesLabel: string;
    steps: AboutMethodStep[];
  };
  industries: {
    eyebrow: string;
    title: string;
    intro: string;
    sectors: AboutSector[];
  };
  cta: {
    eyebrow: string;
    title: string;
    body: string;
    projectsLabel: string;
    phoneLabel: string;
    whatsappLabel: string;
  };
}

export interface AboutSnapshotPatch {
  title: string | null;
  description: string | null;
}

export interface AboutOverlayPatch {
  title: string | null;
  description: string | null;
  stage: string | null;
  stageLabel: string | null;
}

export interface AboutMilestonePatch {
  kicker: string | null;
  badge: string | null;
  title: string | null;
  description: string | null;
}

export interface AboutVisionCardPatch {
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  footer: string | null;
}

export interface AboutPillarPatch {
  icon: string | null;
  title: string | null;
  description: string | null;
  footer: string | null;
}

export interface AboutMethodStepPatch {
  icon: string | null;
  title: string | null;
  description: string | null;
  footer: string | null;
}

export interface AboutSectorPatch {
  icon: string | null;
  title: string | null;
  description: string | null;
}

export interface AboutPatch {
  hero: {
    eyebrow: string | null;
    title: string | null;
    intro: string | null;
    approachLabel: string | null;
    snapshotLabel: string | null;
    image: AboutImage | null;
    snapshots: Array<AboutSnapshotPatch | null> | null;
    overlay: AboutOverlayPatch | null;
  } | null;
  heritage: {
    eyebrow: string | null;
    title: string | null;
    narrative: string | null;
    approach: string | null;
    basedInLabel: string | null;
    basedInValue: string | null;
    approachLabel: string | null;
    milestones: Array<AboutMilestonePatch | null> | null;
  } | null;
  visionMission: {
    vision: AboutVisionCardPatch | null;
    mission: AboutVisionCardPatch | null;
  } | null;
  pillars: {
    eyebrow: string | null;
    title: string | null;
    intro: string | null;
    items: Array<AboutPillarPatch | null> | null;
  } | null;
  methodology: {
    eyebrow: string | null;
    title: string | null;
    intro: string | null;
    protocolLabel: string | null;
    stagesLabel: string | null;
    steps: Array<AboutMethodStepPatch | null> | null;
  } | null;
  industries: {
    eyebrow: string | null;
    title: string | null;
    intro: string | null;
    sectors: Array<AboutSectorPatch | null> | null;
  } | null;
  cta: {
    eyebrow: string | null;
    title: string | null;
    body: string | null;
    projectsLabel: string | null;
    phoneLabel: string | null;
    whatsappLabel: string | null;
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

function readIcon(value: unknown): string | null {
  return typeof value === 'string' && ABOUT_ICONS.has(value) ? value : null;
}

function readDimension(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : 0;
}

/**
 * Accepts hosted images and the admin's inline-media fallback. Only raster data
 * URLs are allowed so an `img src` can never receive SVG or script-bearing
 * content. An empty URL means "keep the build-time hero".
 */
function isSafeImageUrl(url: string): boolean {
  return (
    /^https:\/\//i.test(url) ||
    /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/]+={0,2}$/i.test(url)
  );
}

function readImage(value: unknown): AboutImage | null {
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

function readList<T>(
  value: unknown,
  count: number,
  read: (item: unknown) => T | null,
): Array<T | null> | null {
  if (!Array.isArray(value) || value.length !== count) return null;
  return value.map(read);
}

function readSnapshot(value: unknown): AboutSnapshotPatch | null {
  if (!isRecord(value)) return null;
  return {
    title: readText(value.title, LIMITS.snapshotTitle),
    description: readText(value.description, LIMITS.snapshotDescription),
  };
}

function readOverlay(value: unknown): AboutOverlayPatch | null {
  if (!isRecord(value)) return null;
  return {
    title: readText(value.title, LIMITS.overlayTitle),
    description: readText(value.description, LIMITS.overlayDescription),
    stage: readText(value.stage, LIMITS.overlayStage),
    stageLabel: readText(value.stageLabel, LIMITS.overlayStageLabel),
  };
}

function readMilestone(value: unknown): AboutMilestonePatch | null {
  if (!isRecord(value)) return null;
  return {
    kicker: readText(value.kicker, LIMITS.milestoneKicker),
    badge: readText(value.badge, LIMITS.milestoneBadge),
    title: readText(value.title, LIMITS.milestoneTitle),
    description: readText(value.description, LIMITS.milestoneDescription),
  };
}

function readVisionCard(value: unknown): AboutVisionCardPatch | null {
  if (!isRecord(value)) return null;
  return {
    eyebrow: readText(value.eyebrow, LIMITS.visionEyebrow),
    title: readText(value.title, LIMITS.visionTitle),
    body: readText(value.body, LIMITS.visionBody),
    footer: readText(value.footer, LIMITS.visionFooter),
  };
}

function readPillar(value: unknown): AboutPillarPatch | null {
  if (!isRecord(value)) return null;
  return {
    icon: readIcon(value.icon),
    title: readText(value.title, LIMITS.pillarTitle),
    description: readText(value.description, LIMITS.pillarDescription),
    footer: readText(value.footer, LIMITS.pillarFooter),
  };
}

function readMethodStep(value: unknown): AboutMethodStepPatch | null {
  if (!isRecord(value)) return null;
  return {
    icon: readIcon(value.icon),
    title: readText(value.title, LIMITS.methodStepTitle),
    description: readText(value.description, LIMITS.methodStepDescription),
    footer: readText(value.footer, LIMITS.methodStepFooter),
  };
}

function readSector(value: unknown): AboutSectorPatch | null {
  if (!isRecord(value)) return null;
  return {
    icon: readIcon(value.icon),
    title: readText(value.title, LIMITS.sectorTitle),
    description: readText(value.description, LIMITS.sectorDescription),
  };
}

/** Partial parse used by the watcher: `null` fields keep their build-time value. */
export function parseAboutContentPatch(
  data: Record<string, unknown> | undefined,
): AboutPatch | null {
  if (!data) return null;

  const hero = isRecord(data.hero)
    ? {
        eyebrow: readText(data.hero.eyebrow, LIMITS.heroEyebrow),
        title: readText(data.hero.title, LIMITS.heroTitle),
        intro: readText(data.hero.intro, LIMITS.heroIntro),
        approachLabel: readText(
          data.hero.approachLabel,
          LIMITS.heroApproachLabel,
        ),
        snapshotLabel: readText(data.hero.snapshotLabel, LIMITS.snapshotLabel),
        image: readImage(data.hero.image),
        snapshots: readList(data.hero.snapshots, SNAPSHOT_COUNT, readSnapshot),
        overlay: isRecord(data.hero.overlay)
          ? readOverlay(data.hero.overlay)
          : null,
      }
    : null;

  const heritage = isRecord(data.heritage)
    ? {
        eyebrow: readText(data.heritage.eyebrow, LIMITS.heritageEyebrow),
        title: readText(data.heritage.title, LIMITS.heritageTitle),
        narrative: readText(data.heritage.narrative, LIMITS.heritageNarrative),
        approach: readText(data.heritage.approach, LIMITS.heritageApproach),
        basedInLabel: readText(
          data.heritage.basedInLabel,
          LIMITS.heritageBasedInLabel,
        ),
        basedInValue: readText(
          data.heritage.basedInValue,
          LIMITS.heritageBasedInValue,
        ),
        approachLabel: readText(
          data.heritage.approachLabel,
          LIMITS.heritageApproachLabel,
        ),
        milestones: readList(
          data.heritage.milestones,
          MILESTONE_COUNT,
          readMilestone,
        ),
      }
    : null;

  const visionMission = isRecord(data.visionMission)
    ? {
        vision: isRecord(data.visionMission.vision)
          ? readVisionCard(data.visionMission.vision)
          : null,
        mission: isRecord(data.visionMission.mission)
          ? readVisionCard(data.visionMission.mission)
          : null,
      }
    : null;

  const pillars = isRecord(data.pillars)
    ? {
        eyebrow: readText(data.pillars.eyebrow, LIMITS.pillarsEyebrow),
        title: readText(data.pillars.title, LIMITS.pillarsTitle),
        intro: readText(data.pillars.intro, LIMITS.pillarsIntro),
        items: readList(data.pillars.items, PILLAR_COUNT, readPillar),
      }
    : null;

  const methodology = isRecord(data.methodology)
    ? {
        eyebrow: readText(data.methodology.eyebrow, LIMITS.methodologyEyebrow),
        title: readText(data.methodology.title, LIMITS.methodologyTitle),
        intro: readText(data.methodology.intro, LIMITS.methodologyIntro),
        protocolLabel: readText(
          data.methodology.protocolLabel,
          LIMITS.methodologyProtocolLabel,
        ),
        stagesLabel: readText(
          data.methodology.stagesLabel,
          LIMITS.methodologyStagesLabel,
        ),
        steps: readList(
          data.methodology.steps,
          METHOD_STEP_COUNT,
          readMethodStep,
        ),
      }
    : null;

  const industries = isRecord(data.industries)
    ? {
        eyebrow: readText(data.industries.eyebrow, LIMITS.industriesEyebrow),
        title: readText(data.industries.title, LIMITS.industriesTitle),
        intro: readText(data.industries.intro, LIMITS.industriesIntro),
        sectors: readList(data.industries.sectors, SECTOR_COUNT, readSector),
      }
    : null;

  const cta = isRecord(data.cta)
    ? {
        eyebrow: readText(data.cta.eyebrow, LIMITS.ctaEyebrow),
        title: readText(data.cta.title, LIMITS.ctaTitle),
        body: readText(data.cta.body, LIMITS.ctaBody),
        projectsLabel: readText(
          data.cta.projectsLabel,
          LIMITS.ctaProjectsLabel,
        ),
        phoneLabel: readText(data.cta.phoneLabel, LIMITS.ctaPhoneLabel),
        whatsappLabel: readText(
          data.cta.whatsappLabel,
          LIMITS.ctaWhatsappLabel,
        ),
      }
    : null;

  return { hero, heritage, visionMission, pillars, methodology, industries, cta };
}

/** Strict text: blank is valid (it means "keep the build-time copy"). */
function strictText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > max ? null : text;
}

/**
 * A label field added after the first release. A document written before the
 * field existed has no value, which means "keep the build-time label" — an
 * empty string here, not a rejected document. A present but malformed value is
 * still invalid.
 */
function strictOptionalText(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return '';
  return strictText(value, max);
}

function strictIcon(value: unknown): string | null {
  if (value === '') return '';
  return readIcon(value);
}

function emptyImage(): AboutImage {
  return { url: '', alt: '', width: 0, height: 0 };
}

function strictImage(value: unknown): AboutImage | null {
  if (!isRecord(value)) return emptyImage();

  const url = typeof value.imageUrl === 'string' ? value.imageUrl.trim() : '';
  if (url === '') return emptyImage();
  if (!isSafeImageUrl(url)) return null;

  const width = readDimension(value.imageWidth);
  const height = readDimension(value.imageHeight);
  if (width > 0 && height > 0 && Math.abs(width / height - 16 / 9) > 0.01) {
    return null;
  }

  return {
    url,
    alt: typeof value.imageAlt === 'string' ? value.imageAlt.trim() : '',
    width,
    height,
  };
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

function strictObject<T>(
  value: unknown,
  read: (record: Record<string, unknown>) => T | null,
): T | null {
  if (!isRecord(value)) return null;
  return read(value);
}

function strictSnapshot(value: unknown): AboutSnapshot | null {
  return strictObject(value, (record) => {
    const title = strictText(record.title, LIMITS.snapshotTitle);
    const description = strictText(
      record.description,
      LIMITS.snapshotDescription,
    );
    if (title === null || description === null) return null;
    return { title, description };
  });
}

function strictOverlay(value: unknown): AboutOverlay | null {
  return strictObject(value, (record) => {
    const title = strictText(record.title, LIMITS.overlayTitle);
    const description = strictText(
      record.description,
      LIMITS.overlayDescription,
    );
    const stage = strictText(record.stage, LIMITS.overlayStage);
    const stageLabel = strictOptionalText(
      record.stageLabel,
      LIMITS.overlayStageLabel,
    );
    if (
      title === null ||
      description === null ||
      stage === null ||
      stageLabel === null
    ) {
      return null;
    }
    return { title, description, stage, stageLabel };
  });
}

function strictMilestone(value: unknown): AboutMilestone | null {
  return strictObject(value, (record) => {
    const kicker = strictText(record.kicker, LIMITS.milestoneKicker);
    const badge = strictText(record.badge, LIMITS.milestoneBadge);
    const title = strictText(record.title, LIMITS.milestoneTitle);
    const description = strictText(
      record.description,
      LIMITS.milestoneDescription,
    );
    if (
      kicker === null ||
      badge === null ||
      title === null ||
      description === null
    ) {
      return null;
    }
    return { kicker, badge, title, description };
  });
}

function strictVisionCard(value: unknown): AboutVisionCard | null {
  return strictObject(value, (record) => {
    const eyebrow = strictText(record.eyebrow, LIMITS.visionEyebrow);
    const title = strictText(record.title, LIMITS.visionTitle);
    const body = strictText(record.body, LIMITS.visionBody);
    const footer = strictText(record.footer, LIMITS.visionFooter);
    if (eyebrow === null || title === null || body === null || footer === null) {
      return null;
    }
    return { eyebrow, title, body, footer };
  });
}

function strictPillar(value: unknown): AboutPillar | null {
  return strictObject(value, (record) => {
    const icon = strictIcon(record.icon);
    const title = strictText(record.title, LIMITS.pillarTitle);
    const description = strictText(
      record.description,
      LIMITS.pillarDescription,
    );
    const footer = strictText(record.footer, LIMITS.pillarFooter);
    if (
      icon === null ||
      title === null ||
      description === null ||
      footer === null
    ) {
      return null;
    }
    return { icon, title, description, footer };
  });
}

function strictMethodStep(value: unknown): AboutMethodStep | null {
  return strictObject(value, (record) => {
    const icon = strictIcon(record.icon);
    const title = strictText(record.title, LIMITS.methodStepTitle);
    const description = strictText(
      record.description,
      LIMITS.methodStepDescription,
    );
    const footer = strictText(record.footer, LIMITS.methodStepFooter);
    if (
      icon === null ||
      title === null ||
      description === null ||
      footer === null
    ) {
      return null;
    }
    return { icon, title, description, footer };
  });
}

function strictSector(value: unknown): AboutSector | null {
  return strictObject(value, (record) => {
    const icon = strictIcon(record.icon);
    const title = strictText(record.title, LIMITS.sectorTitle);
    const description = strictText(
      record.description,
      LIMITS.sectorDescription,
    );
    if (icon === null || title === null || description === null) return null;
    return { icon, title, description };
  });
}

/**
 * Strict parse: the whole document must have the expected sections and fixed
 * counts. Blank strings are accepted and preserved because they mean "keep the
 * build-time value"; any malformed or over-limit field rejects the document.
 */
export function parseAboutContent(
  data: Record<string, unknown> | undefined,
): AboutContent | null {
  if (!data) return null;

  const hero = strictObject(data.hero, (record) => {
    const eyebrow = strictText(record.eyebrow, LIMITS.heroEyebrow);
    const title = strictText(record.title, LIMITS.heroTitle);
    const intro = strictText(record.intro, LIMITS.heroIntro);
    const approachLabel = strictOptionalText(
      record.approachLabel,
      LIMITS.heroApproachLabel,
    );
    const snapshotLabel = strictOptionalText(
      record.snapshotLabel,
      LIMITS.snapshotLabel,
    );
    const image = strictImage(record.image);
    const snapshots = strictList(record.snapshots, SNAPSHOT_COUNT, strictSnapshot);
    const overlay = strictOverlay(record.overlay);

    if (
      eyebrow === null ||
      title === null ||
      intro === null ||
      approachLabel === null ||
      snapshotLabel === null ||
      !image ||
      !snapshots ||
      !overlay
    ) {
      return null;
    }

    return {
      eyebrow,
      title,
      intro,
      approachLabel,
      snapshotLabel,
      image,
      snapshots,
      overlay,
    };
  });
  if (!hero) return null;

  const heritage = strictObject(data.heritage, (record) => {
    const eyebrow = strictText(record.eyebrow, LIMITS.heritageEyebrow);
    const title = strictText(record.title, LIMITS.heritageTitle);
    const narrative = strictText(record.narrative, LIMITS.heritageNarrative);
    const approach = strictText(record.approach, LIMITS.heritageApproach);
    const basedInLabel = strictOptionalText(
      record.basedInLabel,
      LIMITS.heritageBasedInLabel,
    );
    const basedInValue = strictOptionalText(
      record.basedInValue,
      LIMITS.heritageBasedInValue,
    );
    const approachLabel = strictOptionalText(
      record.approachLabel,
      LIMITS.heritageApproachLabel,
    );
    const milestones = strictList(
      record.milestones,
      MILESTONE_COUNT,
      strictMilestone,
    );

    if (
      eyebrow === null ||
      title === null ||
      narrative === null ||
      approach === null ||
      basedInLabel === null ||
      basedInValue === null ||
      approachLabel === null ||
      !milestones
    ) {
      return null;
    }

    return {
      eyebrow,
      title,
      narrative,
      approach,
      basedInLabel,
      basedInValue,
      approachLabel,
      milestones,
    };
  });
  if (!heritage) return null;

  const visionMission = strictObject(data.visionMission, (record) => {
    const vision = strictVisionCard(record.vision);
    const mission = strictVisionCard(record.mission);
    if (!vision || !mission) return null;
    return { vision, mission };
  });
  if (!visionMission) return null;

  const pillars = strictObject(data.pillars, (record) => {
    const eyebrow = strictText(record.eyebrow, LIMITS.pillarsEyebrow);
    const title = strictText(record.title, LIMITS.pillarsTitle);
    const intro = strictText(record.intro, LIMITS.pillarsIntro);
    const items = strictList(record.items, PILLAR_COUNT, strictPillar);

    if (eyebrow === null || title === null || intro === null || !items) {
      return null;
    }

    return { eyebrow, title, intro, items };
  });
  if (!pillars) return null;

  const methodology = strictObject(data.methodology, (record) => {
    const eyebrow = strictText(record.eyebrow, LIMITS.methodologyEyebrow);
    const title = strictText(record.title, LIMITS.methodologyTitle);
    const intro = strictText(record.intro, LIMITS.methodologyIntro);
    const protocolLabel = strictOptionalText(
      record.protocolLabel,
      LIMITS.methodologyProtocolLabel,
    );
    const stagesLabel = strictOptionalText(
      record.stagesLabel,
      LIMITS.methodologyStagesLabel,
    );
    const steps = strictList(record.steps, METHOD_STEP_COUNT, strictMethodStep);

    if (
      eyebrow === null ||
      title === null ||
      intro === null ||
      protocolLabel === null ||
      stagesLabel === null ||
      !steps
    ) {
      return null;
    }

    return { eyebrow, title, intro, protocolLabel, stagesLabel, steps };
  });
  if (!methodology) return null;

  const industries = strictObject(data.industries, (record) => {
    const eyebrow = strictText(record.eyebrow, LIMITS.industriesEyebrow);
    const title = strictText(record.title, LIMITS.industriesTitle);
    const intro = strictText(record.intro, LIMITS.industriesIntro);
    const sectors = strictList(record.sectors, SECTOR_COUNT, strictSector);

    if (eyebrow === null || title === null || intro === null || !sectors) {
      return null;
    }

    return { eyebrow, title, intro, sectors };
  });
  if (!industries) return null;

  const cta = strictObject(data.cta, (record) => {
    const eyebrow = strictText(record.eyebrow, LIMITS.ctaEyebrow);
    const title = strictText(record.title, LIMITS.ctaTitle);
    const body = strictText(record.body, LIMITS.ctaBody);
    const projectsLabel = strictOptionalText(
      record.projectsLabel,
      LIMITS.ctaProjectsLabel,
    );
    const phoneLabel = strictOptionalText(
      record.phoneLabel,
      LIMITS.ctaPhoneLabel,
    );
    const whatsappLabel = strictOptionalText(
      record.whatsappLabel,
      LIMITS.ctaWhatsappLabel,
    );
    if (
      eyebrow === null ||
      title === null ||
      body === null ||
      projectsLabel === null ||
      phoneLabel === null ||
      whatsappLabel === null
    ) {
      return null;
    }
    return {
      eyebrow,
      title,
      body,
      projectsLabel,
      phoneLabel,
      whatsappLabel,
    };
  });
  if (!cta) return null;

  return { hero, heritage, visionMission, pillars, methodology, industries, cta };
}
