import Submission from '../models/Submission.js';
import Player from '../models/Player.js';
import { processHandsFile } from '../services/fileProcessor.js';
import { logFileUpload, logFileVerified } from '../services/auditLogger.js';
import path from 'path';
import fs from 'fs/promises';
import { Op } from 'sequelize';

/**
 * Upload e processamento de arquivo
 */
export async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Nenhum arquivo enviado',
      });
    }

    const { playerId, discordMessageId } = req.body;

    // Busca jogador
    const player = await Player.findByPk(playerId);

    if (!player) {
      // Remove arquivo se jogador não existe
      await fs.unlink(req.file.path);

      return res.status(404).json({
        error: 'Jogador não encontrado',
      });
    }

    // Log de upload
    await logFileUpload(req.user.id, req.file.originalname, req.file.size);

    // Processa arquivo
    const processedFiles = await processHandsFile(
      req.file.path,
      player.nickname,
      req.user.id
    );

    // Salva registros no banco
    const submissions = [];

    for (const processed of processedFiles) {
      const submission = await Submission.create({
        playerId: player.id,
        originalFileName: req.file.originalname,
        processedFileName: processed.processedFileName,
        fileType: path.extname(req.file.originalname).slice(1),
        site: processed.site,
        isGG: processed.isGG,
        discordMessageId,
        filePath: processed.filePath,
      });

      submissions.push(submission);
    }

    // Remove arquivo original
    try {
      await fs.unlink(req.file.path);
    } catch {}

    res.status(201).json({
      message: 'Arquivo processado com sucesso',
      filesProcessed: processedFiles.length,
      submissions,
    });
  } catch (error) {
    // Remove arquivo em caso de erro
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }

    res.status(500).json({
      error: 'Erro ao processar arquivo',
      message: error.message,
    });
  }
}

/**
 * Lista submissões
 */
export async function listSubmissions(req, res) {
  try {
    const { playerId, isGG, verified, limit = 100 } = req.query;

    const where = {};

    if (playerId) where.playerId = playerId;
    if (isGG !== undefined) where.isGG = isGG === 'true';
    if (verified !== undefined) where.verified = verified === 'true';

    const submissions = await Submission.findAll({
      where,
      include: [
        {
          model: Player,
          attributes: ['id', 'nickname', 'discordTag'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
    });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao listar submissões',
      message: error.message,
    });
  }
}

/**
 * Status de envios (quem enviou, quem falta)
 */
export async function getSubmissionsStatus(req, res) {
  try {
    // Busca todos os jogadores ativos
    const allPlayers = await Player.findAll({
      where: { active: true },
      attributes: ['id', 'nickname', 'discordId'],
    });

    // Busca últimas submissões (últimas 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentSubmissions = await Submission.findAll({
      where: {
        createdAt: {
          [Op.gte]: oneDayAgo,
        },
      },
      include: [
        {
          model: Player,
          attributes: ['id', 'nickname', 'discordId'],
        },
      ],
    });

    // Agrupa por jogador
    const submittedPlayerIds = new Set(
      recentSubmissions.map(s => s.playerId)
    );

    const submitted = allPlayers
      .filter(p => submittedPlayerIds.has(p.id))
      .map(p => ({
        ...p.toJSON(),
        filesCount: recentSubmissions.filter(s => s.playerId === p.id).length,
      }));

    const pending = allPlayers
      .filter(p => !submittedPlayerIds.has(p.id))
      .map(p => p.toJSON());

    res.json({
      submitted,
      pending,
      total: allPlayers.length,
      submittedCount: submitted.length,
      pendingCount: pending.length,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao buscar status',
      message: error.message,
    });
  }
}

/**
 * Marca submissão como verificada
 */
export async function verifySubmission(req, res) {
  try {
    const { id } = req.params;

    const submission = await Submission.findByPk(id);

    if (!submission) {
      return res.status(404).json({
        error: 'Submissão não encontrada',
      });
    }

    await submission.update({ verified: true });

    // Log de auditoria
    await logFileVerified(req.user.id, submission.id);

    res.json({
      message: 'Submissão verificada',
      submission,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao verificar submissão',
      message: error.message,
    });
  }
}

/**
 * Download de arquivo processado
 */
export async function downloadFile(req, res) {
  try {
    const { id } = req.params;

    const submission = await Submission.findByPk(id);

    if (!submission) {
      return res.status(404).json({
        error: 'Arquivo não encontrado',
      });
    }

    // Verifica se arquivo existe
    try {
      await fs.access(submission.filePath);
    } catch {
      return res.status(404).json({
        error: 'Arquivo não encontrado no sistema',
      });
    }

    res.download(submission.filePath, submission.processedFileName);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao baixar arquivo',
      message: error.message,
    });
  }
}

/**
 * Download em lote (por categoria)
 */
export async function downloadBatch(req, res) {
  try {
    const { category } = req.params; // 'gg' ou 'outros'

    if (!['gg', 'outros'].includes(category)) {
      return res.status(400).json({
        error: 'Categoria inválida',
        message: 'Use "gg" ou "outros"',
      });
    }

    const submissions = await Submission.findAll({
      where: {
        site: category,
        verified: true,
      },
    });

    if (submissions.length === 0) {
      return res.status(404).json({
        error: 'Nenhum arquivo encontrado',
      });
    }

    // Retorna lista de arquivos para download
    // Cliente deve fazer múltiplos downloads ou implementar ZIP
    res.json({
      category,
      count: submissions.length,
      files: submissions.map(s => ({
        id: s.id,
        fileName: s.processedFileName,
        downloadUrl: `/api/submissions/${s.id}/download`,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao preparar download',
      message: error.message,
    });
  }
}
