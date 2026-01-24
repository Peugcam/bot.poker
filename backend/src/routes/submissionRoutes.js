import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  uploadFile,
  listSubmissions,
  getSubmissionsStatus,
  verifySubmission,
  downloadFile,
  downloadBatch,
} from '../controllers/submissionController.js';
import { authenticateBotOrAdmin, requireAdmin } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { sanitizeFileName } from '../services/securityValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configuração do multer (upload)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../uploads/temp');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Nome único e seguro
    const safeName = sanitizeFileName(file.originalname);
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${safeName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.txt', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Apenas arquivos .txt e .zip são permitidos'));
    }

    cb(null, true);
  },
});

// Todas as rotas requerem autenticação
router.use(authenticateBotOrAdmin);

// POST /api/submissions/upload - Upload de arquivo
router.post('/upload', rateLimiter('upload'), upload.single('file'), uploadFile);

// GET /api/submissions - Listar submissões
router.get('/', rateLimiter('api'), listSubmissions);

// GET /api/submissions/status - Status (quem enviou/falta)
router.get('/status', rateLimiter('api'), getSubmissionsStatus);

// PUT /api/submissions/:id/verify - Verificar submissão (apenas admin)
router.put('/:id/verify', rateLimiter('api'), requireAdmin, verifySubmission);

// GET /api/submissions/:id/download - Download de arquivo
router.get('/:id/download', rateLimiter('api'), downloadFile);

// GET /api/submissions/batch/:category - Download em lote
router.get('/batch/:category', rateLimiter('api'), downloadBatch);

export default router;
