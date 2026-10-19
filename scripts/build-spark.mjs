import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const clientRoot = path.join(projectRoot, 'dist', 'client');
const requiredPages = [
  'index.html',
  'services/index.html',
  'about-us/index.html',
  'projects/index.html',
  'contact/index.html',
];

// Owner-approved output must contain no sample or placeholder wording anywhere
// in the rendered HTML.
const UNAPPROVED_COPY =
  /\[REPLACE:|\b(?:sample|illustrative|example|20XX|template|demonstration content|verify before use|replace with)\b/i;

function runNpm(script) {
  const env = {
    ...process.env,
    PUBLIC_DEMO_MODE: 'false',
  };
  const result = process.platform === 'win32'
    ? spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', `npm run ${script}`], {
      cwd: projectRoot,
      env,
      stdio: 'inherit',
    })
    : spawnSync('npm', ['run', script], { cwd: projectRoot, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`npm run ${script} failed with exit code ${result.status ?? 'unknown'}.`);
  }
}

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
  });
}

function auditBuild() {
  if (!fs.existsSync(clientRoot)) throw new Error('The static public build directory dist/client is missing.');
  for (const relativePath of requiredPages) {
    if (!fs.existsSync(path.join(clientRoot, relativePath))) {
      throw new Error(`Expected public route output is missing: ${relativePath}`);
    }
  }

  const files = collectFiles(clientRoot);
  const sourceMaps = files.filter((file) => file.endsWith('.map'));
  const publicText = files
    .filter((file) => /\.(?:html|js|css|json|svg|txt|xml)$/i.test(file))
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');
  const contactPage = fs.readFileSync(path.join(clientRoot, 'contact', 'index.html'), 'utf8');
  const htmlText = files
    .filter((file) => file.endsWith('.html'))
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');
  const placeholders = publicText.match(/\[REPLACE:/g) ?? [];
  const temporaryImageHosts = publicText.match(/lh3\.googleusercontent\.com/gi) ?? [];
  const privatePatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
    /"private_key"\s*:/i,
    /CONTACT_SMTP_PASSWORD/i,
    /CONTACT_RATE_LIMIT_SALT/i,
  ];
  const privateMatches = privatePatterns.filter((pattern) => pattern.test(publicText));
  const findings = [];
  if (sourceMaps.length) findings.push(`Source maps: ${sourceMaps.length}`);
  if (placeholders.length) findings.push(`${placeholders.length} [REPLACE: ...] placeholders; replace them only with owner-verified content`);
  if (temporaryImageHosts.length) findings.push(`${temporaryImageHosts.length} temporary Google-hosted image URL(s); use approved durable assets`);
  if (privateMatches.length) findings.push(`${privateMatches.length} private credential pattern(s)`);
  if (publicText.includes('contact-quotation-form')) findings.push('Retired public inquiry-form markup or script is present in the static output');
  if (publicText.includes('The online inquiry form is unavailable')) {
    findings.push('Retired inquiry-form unavailable notice is present on the public site');
  }
  if (!/https:\/\/wa\.me\/[1-9]\d{7,14}/i.test(contactPage)) {
    findings.push('Verified WhatsApp direct-contact link is missing from the static output');
  }
  if (!/href=["']tel:\+[1-9]\d{7,14}/i.test(contactPage)) {
    findings.push('Verified telephone direct-contact link is missing from the static output');
  }
  if (/Emergency Hotline|24\/7 Emergency/i.test(contactPage)) {
    findings.push('Unverified emergency-support messaging is present on the Contact page');
  }
  if (/DEMO TEMPLATE|Demonstration content|verify before use/i.test(htmlText)) {
    findings.push('The retired site-wide demo-content notice is still present in the static output');
  }
  if (UNAPPROVED_COPY.test(htmlText)) {
    findings.push('Owner-approved publishing is blocked by sample or placeholder copy in the static output');
  }
  if (findings.length) throw new Error(findings.join('; '));

  console.log(`Spark static build audit passed: ${requiredPages.length} routes, ${files.length} files, no placeholders, temporary image hosts, source maps, or credential patterns.`);
}

try {
  runNpm('check');
  runNpm('build');
  auditBuild();
} catch (error) {
  console.error(`Spark build is not ready: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
