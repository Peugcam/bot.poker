import { logRateLimitExceeded } from '../services/auditLogger.js';

/**
 * Rate Limiter simples baseado em memória
 * Para produção, considere usar Redis
 */

const requestCounts = new Map(); // identifier -> { count, resetTime }

const RATE_LIMITS = {
  upload: { windowMs: 60000, maxRequests: 10 }, // 10 uploads por minuto
  api: { windowMs: 60000, maxRequests: 60 }, // 60 requests por minuto
  auth: { windowMs: 300000, maxRequests: 5 }, // 5 tentativas de auth em 5 min
};

/**
 * Middleware de rate limiting
 */
export function rateLimiter(type = 'api') {
  return async (req, res, next) => {
    const identifier = getIdentifier(req);
    const limit = RATE_LIMITS[type];

    if (!limit) {
      return next();
    }

    const now = Date.now();
    const record = requestCounts.get(identifier) || {
      count: 0,
      resetTime: now + limit.windowMs,
    };

    // Reset se passou o tempo
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + limit.windowMs;
    }

    // Incrementa contador
    record.count++;
    requestCounts.set(identifier, record);

    // Verifica se excedeu limite
    if (record.count > limit.maxRequests) {
      await logRateLimitExceeded(identifier, req.path);

      return res.status(429).json({
        error: 'Too many requests',
        message: 'Você excedeu o limite de requisições. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    // Headers informativos
    res.setHeader('X-RateLimit-Limit', limit.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit.maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', record.resetTime);

    next();
  };
}

/**
 * Obtém identificador único do cliente
 */
function getIdentifier(req) {
  // Tenta obter do token/auth primeiro
  if (req.user && req.user.id) {
    return `user_${req.user.id}`;
  }

  // Fallback para IP
  return req.ip || req.connection.remoteAddress || 'unknown';
}

/**
 * Limpa registros antigos periodicamente (evita memory leak)
 */
setInterval(() => {
  const now = Date.now();
  for (const [identifier, record] of requestCounts.entries()) {
    if (now > record.resetTime + 3600000) { // 1 hora após reset
      requestCounts.delete(identifier);
    }
  }
}, 3600000); // Limpa a cada hora
