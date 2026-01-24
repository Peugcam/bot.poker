import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sistema de auditoria e logs de segurança
 */

const LOG_DIR = path.join(__dirname, '../../../logs');
const AUDIT_LOG_FILE = path.join(LOG_DIR, 'audit.log');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'errors.log');
const SECURITY_LOG_FILE = path.join(LOG_DIR, 'security.log');

// Garante que diretório de logs existe
await fs.mkdir(LOG_DIR, { recursive: true });

/**
 * Níveis de log
 */
const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  SECURITY: 'SECURITY',
  AUDIT: 'AUDIT',
};

/**
 * Registra evento de auditoria
 */
export async function logAudit(action, userId, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: LOG_LEVELS.AUDIT,
    action,
    userId,
    details,
  };

  await writeLog(AUDIT_LOG_FILE, logEntry);
  console.log(`[AUDIT] ${action} by ${userId}`);
}

/**
 * Registra evento de segurança
 */
export async function logSecurity(event, severity, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: LOG_LEVELS.SECURITY,
    event,
    severity, // LOW, MEDIUM, HIGH, CRITICAL
    details,
  };

  await writeLog(SECURITY_LOG_FILE, logEntry);
  console.warn(`[SECURITY-${severity}] ${event}`);

  // Alertas críticos também vão para erro
  if (severity === 'CRITICAL') {
    await logError(new Error(event), details);
  }
}

/**
 * Registra erro
 */
export async function logError(error, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: LOG_LEVELS.ERROR,
    message: error.message,
    stack: error.stack,
    context,
  };

  await writeLog(ERROR_LOG_FILE, logEntry);
  console.error(`[ERROR] ${error.message}`);
}

/**
 * Registra info geral
 */
export async function logInfo(message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: LOG_LEVELS.INFO,
    message,
    data,
  };

  console.log(`[INFO] ${message}`);
}

/**
 * Escreve log no arquivo
 */
async function writeLog(filePath, logEntry) {
  try {
    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(filePath, logLine, 'utf-8');
  } catch (error) {
    console.error('Erro ao escrever log:', error);
  }
}

/**
 * Eventos de auditoria específicos
 */

export async function logFileUpload(userId, fileName, fileSize) {
  await logAudit('FILE_UPLOAD', userId, {
    fileName,
    fileSize,
    timestamp: Date.now(),
  });
}

export async function logFileProcessed(userId, fileName, processingResult) {
  await logAudit('FILE_PROCESSED', userId, {
    fileName,
    result: processingResult,
    timestamp: Date.now(),
  });
}

export async function logPlayerRegistered(adminId, playerId, playerName) {
  await logAudit('PLAYER_REGISTERED', adminId, {
    playerId,
    playerName,
    timestamp: Date.now(),
  });
}

export async function logRequestSent(adminId, requestDetails) {
  await logAudit('REQUEST_SENT', adminId, {
    ...requestDetails,
    timestamp: Date.now(),
  });
}

export async function logFileVerified(adminId, fileId) {
  await logAudit('FILE_VERIFIED', adminId, {
    fileId,
    timestamp: Date.now(),
  });
}

/**
 * Eventos de segurança específicos
 */

export async function logInvalidFileAttempt(userId, reason, details) {
  await logSecurity('INVALID_FILE_UPLOAD_ATTEMPT', 'MEDIUM', {
    userId,
    reason,
    ...details,
  });
}

export async function logSuspiciousActivity(userId, activity, details) {
  await logSecurity('SUSPICIOUS_ACTIVITY', 'HIGH', {
    userId,
    activity,
    ...details,
  });
}

export async function logUnauthorizedAccess(userId, resource) {
  await logSecurity('UNAUTHORIZED_ACCESS_ATTEMPT', 'HIGH', {
    userId,
    resource,
    timestamp: Date.now(),
  });
}

export async function logRateLimitExceeded(identifier, endpoint) {
  await logSecurity('RATE_LIMIT_EXCEEDED', 'MEDIUM', {
    identifier,
    endpoint,
    timestamp: Date.now(),
  });
}
