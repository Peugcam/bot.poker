import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import playerRoutes from './routes/playerRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import { logInfo, logError } from './services/auditLogger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globais
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Headers de segurança
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Log de requisições
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} [${duration}ms]`);
  });

  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rotas da API
app.use('/api/players', playerRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/requests', requestRoutes);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Endpoint não encontrado',
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);

  logError(err, {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Não expor detalhes do erro em produção
  const isDev = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isDev ? err.message : 'Ocorreu um erro interno',
    ...(isDev && { stack: err.stack }),
  });
});

// Inicializa banco de dados e servidor
async function startServer() {
  try {
    // Testa conexão com banco
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida');

    // Sincroniza modelos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados com banco de dados');
    }

    // Inicia servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API Base: http://localhost:${PORT}/api`);
      console.log(`🔒 Modo: ${process.env.NODE_ENV || 'development'}\n`);

      logInfo('Servidor iniciado', { port: PORT });
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    logError(error, { context: 'server_startup' });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⏳ SIGTERM recebido, encerrando servidor...');

  try {
    await sequelize.close();
    console.log('✅ Conexão com banco fechada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fechar conexões:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('\n⏳ SIGINT recebido, encerrando servidor...');

  try {
    await sequelize.close();
    console.log('✅ Conexão com banco fechada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fechar conexões:', error);
    process.exit(1);
  }
});

// Inicia servidor
startServer();
