import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * Validador de segurança para arquivos
 * Implementa múltiplas camadas de proteção
 */

// Magic numbers (assinaturas de arquivo) permitidos
const ALLOWED_FILE_SIGNATURES = {
  txt: [], // Arquivos texto não têm magic number fixo
  zip: [
    Buffer.from([0x50, 0x4B, 0x03, 0x04]), // ZIP
    Buffer.from([0x50, 0x4B, 0x05, 0x06]), // ZIP empty
    Buffer.from([0x50, 0x4B, 0x07, 0x08]), // ZIP spanned
  ],
};

// Limites de tamanho
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_ZIP_EXTRACTED_SIZE = 200 * 1024 * 1024; // 200MB total extraído
const MAX_FILES_IN_ZIP = 100; // Máximo de arquivos em um ZIP

/**
 * Valida arquivo antes do processamento
 */
export async function validateFile(filePath, expectedExtension) {
  try {
    // 1. Verifica se arquivo existe
    const stats = await fs.stat(filePath);

    // 2. Valida tamanho
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(`Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (stats.size === 0) {
      throw new Error('Arquivo vazio não é permitido');
    }

    // 3. Valida extensão
    const ext = path.extname(filePath).toLowerCase().slice(1);
    if (ext !== expectedExtension) {
      throw new Error(`Extensão inválida. Esperado: ${expectedExtension}, recebido: ${ext}`);
    }

    // 4. Valida magic number (assinatura do arquivo)
    if (ext === 'zip') {
      await validateFileSignature(filePath, 'zip');
    }

    // 5. Valida path traversal
    const sanitizedPath = sanitizePath(filePath);
    if (sanitizedPath !== filePath) {
      throw new Error('Path inválido detectado');
    }

    return true;
  } catch (error) {
    throw new Error(`Validação de segurança falhou: ${error.message}`);
  }
}

/**
 * Valida assinatura (magic number) do arquivo
 */
async function validateFileSignature(filePath, fileType) {
  const buffer = Buffer.alloc(4);
  const fileHandle = await fs.open(filePath, 'r');

  try {
    await fileHandle.read(buffer, 0, 4, 0);

    const signatures = ALLOWED_FILE_SIGNATURES[fileType];
    const isValid = signatures.some(sig => buffer.slice(0, sig.length).equals(sig));

    if (!isValid) {
      throw new Error(`Assinatura de arquivo inválida para tipo ${fileType}`);
    }
  } finally {
    await fileHandle.close();
  }
}

/**
 * Sanitiza path para prevenir path traversal
 */
export function sanitizePath(filePath) {
  // Remove caracteres perigosos
  const dangerous = ['..', '~', '$', '|', '&', ';', '`', '\n', '\r'];
  let sanitized = filePath;

  for (const char of dangerous) {
    if (sanitized.includes(char)) {
      throw new Error(`Caractere perigoso detectado no path: ${char}`);
    }
  }

  // Normaliza path
  sanitized = path.normalize(sanitized);

  return sanitized;
}

/**
 * Sanitiza nome de arquivo
 */
export function sanitizeFileName(fileName) {
  // Remove caracteres não permitidos
  let sanitized = fileName.replace(/[^a-zA-Z0-9._\-\s]/g, '_');

  // Remove múltiplos espaços/underscores
  sanitized = sanitized.replace(/[\s_]+/g, '_');

  // Limita tamanho
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);
    sanitized = name.substring(0, 255 - ext.length) + ext;
  }

  return sanitized;
}

/**
 * Valida conteúdo do arquivo de texto
 */
export function validateTextContent(content) {
  // 1. Verifica tamanho
  if (content.length > 10 * 1024 * 1024) { // 10MB de texto
    throw new Error('Conteúdo de texto muito grande');
  }

  // 2. Verifica se não tem código malicioso óbvio
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc
    /eval\s*\(/i,
    /exec\s*\(/i,
    /system\s*\(/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      throw new Error('Conteúdo suspeito detectado no arquivo');
    }
  }

  return true;
}

/**
 * Valida nickname do jogador
 */
export function validateNickname(nickname) {
  if (!nickname || typeof nickname !== 'string') {
    throw new Error('Nickname inválido');
  }

  // Apenas alfanuméricos, underscores, hífens e espaços
  if (!/^[a-zA-Z0-9_\-\s]{2,30}$/.test(nickname)) {
    throw new Error('Nickname deve ter 2-30 caracteres (apenas letras, números, _, - e espaços)');
  }

  return true;
}

/**
 * Valida Discord ID
 */
export function validateDiscordId(discordId) {
  if (!discordId || typeof discordId !== 'string') {
    throw new Error('Discord ID inválido');
  }

  // Discord IDs são números de 17-19 dígitos
  if (!/^\d{17,19}$/.test(discordId)) {
    throw new Error('Discord ID deve ser um número de 17-19 dígitos');
  }

  return true;
}

/**
 * Gera hash do arquivo para verificação de integridade
 */
export async function generateFileHash(filePath) {
  const hash = crypto.createHash('sha256');
  const fileBuffer = await fs.readFile(filePath);
  hash.update(fileBuffer);
  return hash.digest('hex');
}

/**
 * Valida limites de extração de ZIP
 */
export function validateZipLimits(zipEntries) {
  if (zipEntries.length > MAX_FILES_IN_ZIP) {
    throw new Error(`ZIP contém muitos arquivos. Máximo: ${MAX_FILES_IN_ZIP}`);
  }

  let totalSize = 0;
  for (const entry of zipEntries) {
    totalSize += entry.header.size;

    // Proteção contra zip bombs
    if (entry.header.size > MAX_ZIP_EXTRACTED_SIZE) {
      throw new Error('Arquivo ZIP suspeito detectado (possível zip bomb)');
    }
  }

  if (totalSize > MAX_ZIP_EXTRACTED_SIZE) {
    throw new Error(`Tamanho total extraído muito grande. Máximo: ${MAX_ZIP_EXTRACTED_SIZE / 1024 / 1024}MB`);
  }

  return true;
}

/**
 * Valida extensão de arquivo dentro do ZIP
 */
export function validateZipEntryExtension(entryName) {
  const allowedExtensions = ['.txt'];
  const ext = path.extname(entryName).toLowerCase();

  if (!allowedExtensions.includes(ext) && ext !== '') {
    throw new Error(`Extensão não permitida dentro do ZIP: ${ext}`);
  }

  return true;
}
