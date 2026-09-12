// backend/src/middleware/security.js

// Sliding window rate limiter store
const requestStore = new Map();

// Periodic cleanup of stale rate limiter buckets to prevent memory accumulation
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requestStore.entries()) {
      const active = timestamps.filter(t => now - t < 5 * 60 * 1000);
      if (active.length === 0) {
        requestStore.delete(key);
      } else {
        requestStore.set(key, active);
      }
    }
  }, 5 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

/**
 * Calculates genuine real-time requests handled within the last 60-second sliding window
 */
export const getActiveThroughput = () => {
  const windowStart = Date.now() - 60 * 1000;
  let count = 0;
  for (const timestamps of requestStore.values()) {
    count += timestamps.filter(t => t > windowStart).length;
  }
  return count;
};


/**
 * Production Security Headers Middleware
 * Implements OWASP recommended security headers.
 */
export const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking by forbidding embedding in iframes
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Cross-Site Scripting protection for legacy browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // HTTP Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cross-Origin Isolation & Resource Isolation
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // Permissions Policy: restrict browser sensor & hardware access
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');

  // Restrictive Content-Security-Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https:;"
  );

  // Prevent caching of sensitive authenticated API responses
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

/**
 * Sliding-window Rate Limiting Middleware
 * @param {Object} options - Rate limit config options
 */
export const createRateLimiter = (options = { windowMs: 60 * 1000, max: 120, message: 'Too many requests, please try again later.' }) => {
  return (req, res, next) => {
    // 1. NEVER throttle CORS preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      return next();
    }

    // 2. Extract true client IP (considering reverse proxies and Vercel edge)
    const xForwardedFor = req.headers['x-forwarded-for'];
    const clientIp = typeof xForwardedFor === 'string'
      ? xForwardedFor.split(',')[0].trim()
      : (req.ip || req.socket?.remoteAddress || '127.0.0.1');

    // 3. Optional key generator (e.g. per-account for auth routes)
    const key = options.keyGenerator
      ? options.keyGenerator(req, clientIp)
      : clientIp;

    const now = Date.now();

    if (!requestStore.has(key)) {
      requestStore.set(key, []);
    }

    const timestamps = requestStore.get(key);
    // Remove timestamps outside window
    const windowStart = now - options.windowMs;
    const recentTimestamps = timestamps.filter(t => t > windowStart);
    requestStore.set(key, recentTimestamps);

    if (recentTimestamps.length >= options.max) {
      return res.status(429).json({
        success: false,
        message: options.message,
        retryAfterSeconds: Math.ceil((recentTimestamps[0] + options.windowMs - now) / 1000)
      });
    }

    recentTimestamps.push(now);
    next();
  };
};

/**
 * General Rate Limiter (240 req / minute)
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 240,
  message: 'API rate limit exceeded. Please slow down your requests.'
});

/**
 * Auth Rate Limiter (60 login/reset attempts / 5 minutes per client IP and email)
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 60,
  keyGenerator: (req, clientIp) => {
    const email = (req.body?.email || '').toLowerCase().trim();
    return `${clientIp}_${email}`;
  },
  message: 'Too many authentication attempts. Please wait a few minutes before trying again.'
});

/**
 * Request Input Sanitization Middleware
 */
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Strip potential script injection tags
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  next();
};
