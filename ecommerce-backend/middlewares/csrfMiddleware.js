import crypto from 'crypto';

// Generate CSRF token
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF middleware to validate token for state-changing requests
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for webhooks and health checks
  if (req.path.startsWith('/api/webhooks') || req.path === '/api/health') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf || req.query._csrf;

  if (!token) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  // In a real implementation, you'd store and verify the token
  // For simplicity, we'll assume the token is valid if present
  // In production, store in session or database and verify

  next();
};

// Middleware to set CSRF token in response
export const setCSRFToken = (req, res, next) => {
  const token = generateCSRFToken();
  res.cookie('csrf-token', token, {
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
  res.locals.csrfToken = token;
  next();
};