// Single-user admin auth: one password (ADMIN_PASSWORD) exchanged for a signed,
// HttpOnly session cookie (HMAC with SESSION_SECRET). Files under api/_lib are
// helpers, not Vercel routes.

const crypto = require('crypto');

const COOKIE = 'admin_session';
const MAX_AGE = 7 * 24 * 60 * 60; // seconds

const hmac = (value) => crypto.createHmac('sha256', process.env.SESSION_SECRET).update(value).digest('base64url');
const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest();

function configError() {
  if (!process.env.ADMIN_PASSWORD) return 'ADMIN_PASSWORD is not set';
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    return 'SESSION_SECRET must be set to at least 32 random characters';
  }
  return null;
}

function checkPassword(password) {
  return crypto.timingSafeEqual(sha256(password), sha256(process.env.ADMIN_PASSWORD));
}

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function isHttps(req) {
  const host = req.headers.host || '';
  return req.headers['x-forwarded-proto'] === 'https' || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}

function cookie(req, value, maxAge) {
  return [
    `${COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
    ...(isHttps(req) ? ['Secure'] : []),
  ].join('; ');
}

function startSession(req, res) {
  const expires = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  res.setHeader('Set-Cookie', cookie(req, `${expires}.${hmac(`session:${expires}`)}`, MAX_AGE));
}

function endSession(req, res) {
  res.setHeader('Set-Cookie', cookie(req, '', 0));
}

function isAuthenticated(req) {
  if (configError()) return false;
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (!token) return false;
  const [expires, sig] = token.split('.');
  if (!expires || !sig || Number(expires) < Date.now() / 1000) return false;
  const expected = Buffer.from(hmac(`session:${expires}`));
  const given = Buffer.from(sig);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

// Blocks cross-site requests: the cookie is SameSite=Strict, and any Origin
// header present must match the host serving the API.
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

// For state-changing requests: require a JSON body, a same-origin request and
// a valid session. Sends the error response itself and returns false on failure.
function guard(req, res, { mutation = false } = {}) {
  res.setHeader('Cache-Control', 'no-store');
  if (!sameOrigin(req)) {
    res.status(403).json({ error: 'Cross-origin request blocked' });
    return false;
  }
  if (mutation && !String(req.headers['content-type'] || '').startsWith('application/json')) {
    res.status(415).json({ error: 'Expected application/json' });
    return false;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Not logged in' });
    return false;
  }
  return true;
}

module.exports = { configError, checkPassword, startSession, endSession, isAuthenticated, sameOrigin, guard };
