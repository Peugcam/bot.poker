import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  validateFile,
  sanitizePath,
  sanitizeFileName,
  validateTextContent,
  validateNickname,
  validateZipLimits,
  validateZipEntryExtension,
  generateFileHash,
} from './securityValidator.js';
import {
  logFileProcessed,
  logInvalidFileAttempt,
  logError,
} from './auditLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Processa arquivo de mãos (txt ou zip) com validações de segurança
 * - Valida arquivo antes de processar
 * - Descompacta se for ZIP
 * - Identifica se é GGPoker
 * - Substitui "Hero" pelo nickname do jogador
 * - Salva na pasta correta (gg ou outros)
 * - Registra auditoria
 */
export async function processHandsFile(filePath, playerNickname, userId = 'system') {
  const fileExt = path.extname(filePath).toLowerCase().slice(1);
  let processedFiles = [];

  try {
    // SEGURANÇA: Valida nickname
    validateNickname(playerNickname);

    // SEGURANÇA: Valida path
    const safePath = sanitizePath(filePath);

    // SEGURANÇA: Valida arquivo
    await validateFile(safePath, fileExt);

    // Gera hash para integridade
    const fileHash = await generateFileHash(safePath);

    if (fileExt === 'zip') {
      // Descompacta e processa cada arquivo
      processedFiles = await processZipFile(safePath, playerNickname, userId);
    } else if (fileExt === 'txt') {
      // Processa arquivo txt diretamente
      const processed = await processTxtFile(safePath, playerNickname, userId);
      processedFiles.push(processed);
    } else {
      throw new Error(`Formato de arquivo não suportado: ${fileExt}`);
    }

    // Log de sucesso
    await logFileProcessed(userId, path.basename(filePath), {
      filesProcessed: processedFiles.length,
      fileHash,
    });

    return processedFiles;
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);

    // Log de falha
    await logInvalidFileAttempt(userId, error.message, {
      filePath: path.basename(filePath),
    });

    await logError(error, {
      filePath: path.basename(filePath),
      playerNickname,
      userId,
    });

    throw error;
  }
}

/**
 * Descompacta ZIP e processa todos os arquivos .txt dentro
 * Com validações de segurança contra zip bombs e path traversal
 */
async function processZipFile(zipPath, playerNickname, userId) {
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();
  const processedFiles = [];

  // SEGURANÇA: Valida limites do ZIP (proteção contra zip bombs)
  validateZipLimits(zipEntries);

  // Cria diretório temporário único e seguro
  const tempDirName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const tempDir = path.join(__dirname, '../../../uploads/temp', tempDirName);
  await fs.mkdir(tempDir, { recursive: true });

  try {
    // Processa cada entrada do ZIP com validações
    for (const entry of zipEntries) {
      // Pula diretórios
      if (entry.isDirectory) continue;

      // SEGURANÇA: Valida nome do arquivo
      const entryName = entry.entryName;

      // SEGURANÇA: Previne path traversal
      if (entryName.includes('..') || path.isAbsolute(entryName)) {
        throw new Error(`Path traversal detectado: ${entryName}`);
      }

      // SEGURANÇA: Valida extensão
      validateZipEntryExtension(entryName);

      // Extrai apenas arquivos .txt
      if (path.extname(entryName).toLowerCase() === '.txt') {
        // Sanitiza nome do arquivo
        const safeFileName = sanitizeFileName(path.basename(entryName));
        const extractPath = path.join(tempDir, safeFileName);

        // Extrai arquivo individual
        await fs.writeFile(extractPath, entry.getData());

        // Processa arquivo
        const processed = await processTxtFile(extractPath, playerNickname, userId);
        processedFiles.push(processed);
      }
    }

    // Remove diretório temporário
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    // Tenta limpar temp dir mesmo com erro
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Erro ao limpar diretório temporário:', cleanupError);
    }
    throw error;
  }

  if (processedFiles.length === 0) {
    throw new Error('Nenhum arquivo .txt válido encontrado no ZIP');
  }

  return processedFiles;
}

/**
 * Processa arquivo .txt individual com validações de segurança
 * - Valida conteúdo
 * - Detecta se é GGPoker
 * - Substitui "Hero" por nickname
 * - Salva na pasta correta
 */
async function processTxtFile(filePath, playerNickname, userId) {
  // Lê conteúdo do arquivo
  let content = await fs.readFile(filePath, 'utf-8');

  // SEGURANÇA: Valida conteúdo do texto
  validateTextContent(content);

  // Valida se é um hand history válido
  validateHandHistoryFile(content);

  // Detecta se é GGPoker
  const isGG = detectGGPoker(content);

  // Substitui "Hero" por nickname do jogador (com validação)
  content = replaceHeroWithNickname(content, playerNickname);

  // Define pasta de destino
  const destinationDir = isGG
    ? path.join(__dirname, '../../../uploads/gg')
    : path.join(__dirname, '../../../uploads/outros');

  await fs.mkdir(destinationDir, { recursive: true });

  // Nome do arquivo de saída (sanitizado)
  const originalFileName = sanitizeFileName(path.basename(filePath));
  const timestamp = Date.now();
  const outputFileName = `${timestamp}_${originalFileName}`;
  const outputPath = path.join(destinationDir, outputFileName);

  // SEGURANÇA: Valida path de destino
  const safeOutputPath = sanitizePath(outputPath);

  // Salva arquivo processado
  await fs.writeFile(safeOutputPath, content, 'utf-8');

  return {
    originalFileName,
    processedFileName: outputFileName,
    filePath: safeOutputPath,
    isGG,
    site: isGG ? 'gg' : 'outros',
  };
}

/**
 * Detecta se o arquivo é do GGPoker
 * GGPoker tem formato específico com "Poker Hand #TM" e "Table"
 */
function detectGGPoker(content) {
  const ggMarkers = [
    'Poker Hand #TM',
    'GG20', // Data no formato GG
    'Bounty Hunters',
  ];

  return ggMarkers.some(marker => content.includes(marker));
}

/**
 * Substitui todas as ocorrências de "Hero" pelo nickname do jogador
 * Preserva a formatação original
 */
function replaceHeroWithNickname(content, nickname) {
  // Substitui "Hero" em diferentes contextos:
  // - "Seat X: Hero" -> "Seat X: nickname"
  // - "Hero: posts" -> "nickname: posts"
  // - "Dealt to Hero" -> "Dealt to nickname"
  // - "Hero: shows" -> "nickname: shows"
  // etc.

  // Regex para capturar "Hero" com word boundary para não pegar "Heroi" etc
  const heroRegex = /\bHero\b/g;

  return content.replace(heroRegex, nickname);
}

/**
 * Valida se o arquivo parece ser um histórico de mãos válido
 */
export function validateHandHistoryFile(content) {
  // Verifica se tem marcadores básicos de um hand history
  const markers = [
    'Poker Hand',
    'Table',
    'Seat',
    'HOLE CARDS',
  ];

  const hasMarkers = markers.some(marker => content.includes(marker));

  if (!hasMarkers) {
    throw new Error('Arquivo não parece ser um histórico de mãos válido');
  }

  return true;
}
