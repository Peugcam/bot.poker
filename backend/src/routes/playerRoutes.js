import express from 'express';
import {
  createPlayer,
  listPlayers,
  getPlayerByDiscordId,
  updatePlayer,
  deletePlayer,
} from '../controllers/playerController.js';
import { authenticateBotOrAdmin, requireAdmin } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateBotOrAdmin);
router.use(rateLimiter('api'));

// POST /api/players - Criar jogador (bot ou admin)
router.post('/', createPlayer);

// GET /api/players - Listar jogadores
router.get('/', listPlayers);

// GET /api/players/discord/:discordId - Buscar por Discord ID
router.get('/discord/:discordId', getPlayerByDiscordId);

// PUT /api/players/:id - Atualizar jogador (apenas admin)
router.put('/:id', requireAdmin, updatePlayer);

// DELETE /api/players/:id - Remover jogador (apenas admin)
router.delete('/:id', requireAdmin, deletePlayer);

export default router;
