// GET /api/config — the public settings the app needs to start (same idea as Veyra).
// The Firebase web config is public by design (every web app ships it); the data is
// protected by firebase/firestore.rules. Set FIREBASE_CONFIG in Vercel → Environment Variables.
const CONFIG_KEYS = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];

/** Accepts strict JSON or the `const firebaseConfig = { … };` snippet from the Firebase console. */
function parseFirebaseConfig(raw) {
  const out = {};
  if (!raw || typeof raw !== 'string') return out;
  try {
    const j = JSON.parse(raw);
    if (j && typeof j === 'object') {
      for (const k of CONFIG_KEYS) if (typeof j[k] === 'string' && j[k]) out[k] = j[k];
      return out;
    }
  } catch {
    /* not JSON: read the console snippet */
  }
  const re = /["']?(\w+)["']?\s*:\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(raw))) if (CONFIG_KEYS.includes(m[1])) out[m[1]] = m[2];
  return out;
}

module.exports = function handler(req, res) {
  const fb = parseFirebaseConfig(process.env.FIREBASE_CONFIG);
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify({ firebase: fb.apiKey && fb.projectId ? fb : null }));
};
module.exports.parseFirebaseConfig = parseFirebaseConfig;
