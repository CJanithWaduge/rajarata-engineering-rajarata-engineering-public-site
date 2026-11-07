/**
 * Home page "Our Electrical Services" cards written by the admin panel at
 * `site/home`.
 *
 * Every field is optional. A blank or malformed field is returned as an empty
 * string so the watcher can skip it and leave the build-time card in place.
 * Icons and links are restricted to the same allowlists as the admin form, and
 * the link target is an internal Services anchor, never arbitrary markup.
 */
export const HOME_SERVICE_COUNT = 6;

const ICONS = new Set([
  'home_repair_service',
  'precision_manufacturing',
  'assignment_turned_in',
  'build_circle',
  'lan',
  'bolt',
  'apartment',
  'developer_board',
  'linear_scale',
  'fact_check',
  'build',
  'router',
  'factory',
  'settings_ethernet',
]);

const LINKS = new Set([
  '/services#service-01',
  '/services#service-02',
  '/services#service-03',
  '/services#service-04',
  '/services#service-05',
  '/services#service-06',
  '/services#service-07',
  '/services#service-08',
]);

const TITLE_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 320;

export interface HomeService {
  icon: string;
  title: string;
  description: string;
  href: string;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readText(value: unknown, maxLength: number): string {
  const text = readString(value).trim();
  return text.length > maxLength ? '' : text;
}

export function readHomeService(value: unknown): HomeService {
  if (!value || typeof value !== 'object') {
    return { icon: '', title: '', description: '', href: '' };
  }

  const record = value as Record<string, unknown>;
  const icon = readString(record.icon).trim();
  const href = readString(record.href).trim();

  return {
    icon: ICONS.has(icon) ? icon : '',
    title: readText(record.title, TITLE_MAX_LENGTH),
    description: readText(record.description, DESCRIPTION_MAX_LENGTH),
    href: LINKS.has(href) ? href : '',
  };
}

/** Pads the stored array to exactly six slots without inventing content. */
export function readHomeServices(value: unknown): HomeService[] {
  const items = Array.isArray(value) ? value.slice(0, HOME_SERVICE_COUNT) : [];

  return Array.from({ length: HOME_SERVICE_COUNT }, (_, index) =>
    readHomeService(items[index]),
  );
}
