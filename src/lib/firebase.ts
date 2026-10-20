import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase client used by the public site to read CMS content from Firestore.
 *
 * This site has no server (`output: 'static'`), so content is read directly
 * from the browser. The web config below is public by design — access is
 * enforced by Firestore Security Rules, not by hiding these values.
 *
 * Astro only exposes variables prefixed with `PUBLIC_` to client code, so the
 * keys here are `PUBLIC_FIREBASE_*`, not Vite's `VITE_FIREBASE_*`.
 *
 * Reads only. The public site has no business writing content.
 */
const config = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

const databaseId = import.meta.env.PUBLIC_FIREBASE_DATABASE_ID || '(default)';

let cached: { app: FirebaseApp; db: Firestore } | null = null;

/**
 * Lazily initialise so a page that never reads content pays nothing, and so a
 * missing config surfaces as an error state instead of breaking the build.
 */
export function getFirebase() {
  if (!config.apiKey || !config.projectId) {
    throw new Error(
      'Missing PUBLIC_FIREBASE_* values. Copy .env.example to .env and fill them in.',
    );
  }
  if (!cached) {
    const app = initializeApp(config);
    // Named database: this project uses `default`, not `(default)`.
    cached = { app, db: getFirestore(app, databaseId) };
  }
  return cached;
}
