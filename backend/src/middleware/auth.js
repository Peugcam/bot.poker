import { logUnauthorizedAccess } from '../services/auditLogger.js';

/**
 * Middleware de autenticação simplificado
 * Para produção com dashboard web, implemente JWT
 */

// API Key para o bot (deve estar no .env)
const BOT_API_KEY = process.env.BOT_API_KEY || 'change-this-in-production';

// API Key para admins do dashboard (deve estar no .env)
const ADMIN_API_KEYS = (process.env.ADMIN_API_KEYS || '').split(',').filter(Boolean);

/**
 * Middleware: Autentica requisições do bot
 */
export function authenticateBot(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== BOT_API_KEY) {
    logUnauthorizedAccess('bot_unknown', req.path);

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key inválida ou ausente',
    });
  }

  req.user = { type: 'bot', id: 'discord-bot' };
  next();
}

/**
 * Middleware: Autentica requisições de admin
 */
export function authenticateAdmin(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || !ADMIN_API_KEYS.includes(apiKey)) {
    logUnauthorizedAccess('admin_unknown', req.path);

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Acesso não autorizado',
    });
  }

  req.user = { type: 'admin', id: apiKey };
  next();
}

/**
 * Middleware: Aceita bot OU admin
 */
export function authenticateBotOrAdmin(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    logUnauthorizedAccess('unknown', req.path);

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key inválida ou ausente',
    });
  }

  // Tenta bot primeiro
  if (apiKey === BOT_API_KEY) {
    req.user = { type: 'bot', id: 'discord-bot' };
    return next();
  }

  // Tenta admin
  if (ADMIN_API_KEYS.includes(apiKey)) {
    req.user = { type: 'admin', id: apiKey };
    return next();
  }

  // Falhou ambos
  logUnauthorizedAccess('unknown', req.path);

  return res.status(401).json({
    error: 'Unauthorized',
    message: 'API key inválida',
  });
}

/**
 * Middleware: Apenas admin
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.type !== 'admin') {
    logUnauthorizedAccess(req.user?.id || 'unknown', req.path);

    return res.status(403).json({
      error: 'Forbidden',
      message: 'Acesso restrito a administradores',
    });
  }

  next();
}

/**
 * Gera nova API key (útil para criar keys de admin)
 */
export function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `pk_${key}`;
}

// Log de aviso se usando chaves padrão
if (BOT_API_KEY === 'change-this-in-production') {
  console.warn('⚠️  ATENÇÃO: Usando BOT_API_KEY padrão. Altere no .env para produção!');
}

if (ADMIN_API_KEYS.length === 0) {
  console.warn('⚠️  ATENÇÃO: Nenhuma ADMIN_API_KEY configurada. Configure no .env!');
  console.log('💡 Para gerar uma nova chave, execute: node -e "console.log(require(\'./src/middleware/auth.js\').generateApiKey())"');
}
