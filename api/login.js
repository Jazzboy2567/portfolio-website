const auth = require('./_lib/auth');

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// GET    /api/login  → { authenticated }
// POST   /api/login  { password } → sets the session cookie
// DELETE /api/login  → logs out
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!auth.sameOrigin(req)) return res.status(403).json({ error: 'Cross-origin request blocked' });

  if (req.method === 'GET') {
    return res.status(200).json({ authenticated: auth.isAuthenticated(req), configError: auth.configError() });
  }

  if (req.method === 'DELETE') {
    auth.endSession(req, res);
    return res.status(200).json({ authenticated: false });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const configError = auth.configError();
  if (configError) return res.status(500).json({ error: `Admin is not configured: ${configError}` });

  const { password } = req.body || {};
  if (typeof password !== 'string' || !auth.checkPassword(password)) {
    // No shared state between serverless invocations for a real rate limit,
    // so slow down every failure instead. Use a long password.
    await delay(1000);
    return res.status(401).json({ error: 'Wrong password' });
  }

  auth.startSession(req, res);
  return res.status(200).json({ authenticated: true });
};
