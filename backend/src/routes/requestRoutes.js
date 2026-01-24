import express from 'express';
import Request from '../models/Request.js';
import { authenticateBotOrAdmin } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { logRequestSent } from '../services/auditLogger.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateBotOrAdmin);
router.use(rateLimiter('api'));

// POST /api/requests - Registra nova solicitação
router.post('/', async (req, res) => {
  try {
    const { discordMessageId, requestedBy, message } = req.body;

    const request = await Request.create({
      discordMessageId,
      requestedBy,
      message,
    });

    await logRequestSent(req.user.id, {
      discordMessageId,
      message: message?.substring(0, 100),
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao registrar solicitação',
      message: error.message,
    });
  }
});

// GET /api/requests - Lista solicitações
router.get('/', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const requests = await Request.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao listar solicitações',
      message: error.message,
    });
  }
});

export default router;
