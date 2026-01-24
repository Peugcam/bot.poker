import Player from '../models/Player.js';
import { validateDiscordId, validateNickname } from '../services/securityValidator.js';
import { logPlayerRegistered } from '../services/auditLogger.js';

/**
 * Cria novo jogador
 */
export async function createPlayer(req, res) {
  try {
    const { discordId, discordTag, nickname } = req.body;

    // Validações
    validateDiscordId(discordId);
    validateNickname(nickname);

    // Cria jogador
    const player = await Player.create({
      discordId,
      discordTag,
      nickname,
    });

    // Log de auditoria
    await logPlayerRegistered(req.user.id, player.id, nickname);

    res.status(201).json(player);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Jogador já existe',
        message: 'Este Discord ID já está registrado',
      });
    }

    res.status(400).json({
      error: 'Erro ao criar jogador',
      message: error.message,
    });
  }
}

/**
 * Lista todos os jogadores
 */
export async function listPlayers(req, res) {
  try {
    const players = await Player.findAll({
      where: { active: true },
      order: [['nickname', 'ASC']],
    });

    res.json(players);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao listar jogadores',
      message: error.message,
    });
  }
}

/**
 * Busca jogador por Discord ID
 */
export async function getPlayerByDiscordId(req, res) {
  try {
    const { discordId } = req.params;

    validateDiscordId(discordId);

    const player = await Player.findOne({
      where: { discordId, active: true },
    });

    if (!player) {
      return res.status(404).json({
        error: 'Jogador não encontrado',
        message: 'Este jogador não está registrado',
      });
    }

    res.json(player);
  } catch (error) {
    res.status(400).json({
      error: 'Erro ao buscar jogador',
      message: error.message,
    });
  }
}

/**
 * Atualiza jogador
 */
export async function updatePlayer(req, res) {
  try {
    const { id } = req.params;
    const { nickname, active } = req.body;

    if (nickname) {
      validateNickname(nickname);
    }

    const player = await Player.findByPk(id);

    if (!player) {
      return res.status(404).json({
        error: 'Jogador não encontrado',
      });
    }

    await player.update({
      nickname: nickname || player.nickname,
      active: active !== undefined ? active : player.active,
    });

    res.json(player);
  } catch (error) {
    res.status(400).json({
      error: 'Erro ao atualizar jogador',
      message: error.message,
    });
  }
}

/**
 * Remove (desativa) jogador
 */
export async function deletePlayer(req, res) {
  try {
    const { id } = req.params;

    const player = await Player.findByPk(id);

    if (!player) {
      return res.status(404).json({
        error: 'Jogador não encontrado',
      });
    }

    // Soft delete
    await player.update({ active: false });

    res.json({
      message: 'Jogador removido com sucesso',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao remover jogador',
      message: error.message,
    });
  }
}
