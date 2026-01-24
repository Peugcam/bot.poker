import sequelize from './database.js';
import Player from '../models/Player.js';
import Submission from '../models/Submission.js';
import Request from '../models/Request.js';

/**
 * Script de migração do banco de dados
 * Cria todas as tabelas necessárias
 */

async function migrate() {
  try {
    console.log('🔄 Iniciando migração do banco de dados...');

    // Testa conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');

    // Sincroniza modelos (cria tabelas)
    await sequelize.sync({ alter: true });
    console.log('✅ Tabelas criadas/atualizadas com sucesso');

    // Exibe tabelas criadas
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('\n📊 Tabelas no banco:', tables.join(', '));

    console.log('\n✅ Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

migrate();
