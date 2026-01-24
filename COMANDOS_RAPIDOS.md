# ⚡ Comandos Rápidos - Poker Hands Manager

Guia de referência rápida para comandos mais usados.

---

## 🚀 Início Rápido (First Time Setup)

### 1. Instalar Dependências

```bash
# Bot
cd bot && npm install

# Backend
cd ../backend && npm install

# Dashboard
cd ../dashboard && npm install
```

### 2. Configurar .env

```bash
# Copiar templates
cd bot && cp .env.example .env
cd ../backend && cp .env.example .env
cd ../dashboard && cp .env.example .env
```

### 3. Gerar API Keys

```bash
# Execute 2x para gerar 2 chaves diferentes
node -e "const crypto = require('crypto'); console.log('pk_' + crypto.randomBytes(24).toString('hex'));"
```

### 4. Criar Banco

```sql
-- No PostgreSQL
CREATE DATABASE poker_hands;
CREATE USER poker_admin WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE poker_hands TO poker_admin;
```

### 5. Iniciar Sistema (3 terminais)

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Bot
cd bot && npm start

# Terminal 3: Dashboard
cd dashboard && npm run dev
```

---

## 🤖 Comandos do Bot Discord

### Registrar Jogador
```
/registrar-jogador usuario:@jogador nickname:NickDoJogador
```

### Solicitar Mãos (Mensagem Padrão)
```
/solicitar-maos
```

### Solicitar Mãos (Mensagem Custom)
```
/solicitar-maos mensagem:Por favor enviem as mãos de hoje até às 23h!
```

### Ver Status
```
/status-maos
```

### Cobrar Todos que Não Enviaram
```
/cobrar
```

### Cobrar Jogador Específico
```
/cobrar jogador:@jogador
```

### Listar Jogadores
```
/listar-jogadores
```

---

## 💻 Comandos de Desenvolvimento

### Instalar Nova Dependência

```bash
# Bot
cd bot && npm install nome-do-pacote

# Backend
cd backend && npm install nome-do-pacote

# Dashboard
cd dashboard && npm install nome-do-pacote
```

### Rodar em Modo Watch (Auto-reload)

```bash
# Backend (Node 18+)
cd backend && npm run dev

# Bot (Node 18+)
cd bot && npm run dev

# Dashboard (sempre em watch)
cd dashboard && npm run dev
```

### Verificar Vulnerabilidades

```bash
# Em cada pasta
npm audit
npm audit fix
```

---

## 🗄️ Comandos de Banco de Dados

### Conectar ao Banco

```bash
# Windows (SQL Shell)
# Ou usar pgAdmin GUI

# Linux/Mac
psql -U postgres -d poker_hands
```

### Ver Tabelas

```sql
\dt
```

### Ver Jogadores

```sql
SELECT id, nickname, discord_tag FROM players WHERE active = true;
```

### Ver Submissões Recentes

```sql
SELECT s.id, p.nickname, s.processed_file_name, s.is_gg, s.verified, s.created_at
FROM submissions s
JOIN players p ON s.player_id = p.id
ORDER BY s.created_at DESC
LIMIT 10;
```

### Limpar Submissões de Teste

```sql
-- CUIDADO: Isso deleta dados!
DELETE FROM submissions WHERE created_at < '2026-01-01';
```

---

## 📦 Comandos de Deploy

### Build para Produção

```bash
# Dashboard
cd dashboard
npm run build
# Gera pasta dist/ para servir

# Backend/Bot não precisam build (Node.js)
```

### Deploy com Railway

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Deploy
railway up

# Ver logs
railway logs
```

### Deploy Dashboard com Vercel

```bash
# Instalar CLI
npm install -g vercel

# Na pasta dashboard
cd dashboard

# Deploy
vercel

# Produção
vercel --prod
```

### PM2 (VPS/Linux)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar backend
cd backend
pm2 start src/index.js --name poker-backend

# Iniciar bot
cd ../bot
pm2 start index.js --name poker-bot

# Ver status
pm2 status

# Ver logs
pm2 logs

# Restart
pm2 restart all

# Parar
pm2 stop all

# Auto-start no boot
pm2 startup
pm2 save
```

---

## 🔍 Comandos de Debug

### Ver Logs

```bash
# Ver logs de auditoria
tail -f logs/audit.log

# Ver logs de segurança
tail -f logs/security.log

# Ver logs de erros
tail -f logs/errors.log

# Ver últimas 50 linhas
tail -n 50 logs/audit.log
```

### Testar API

```bash
# Testar health check
curl http://localhost:5000/health

# Listar jogadores (precisa API Key)
curl -H "X-API-Key: sua_chave" http://localhost:5000/api/players

# Ver status de submissions
curl -H "X-API-Key: sua_chave" http://localhost:5000/api/submissions/status
```

### Verificar Portas em Uso

```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :5000
lsof -i :3000
```

---

## 🧹 Comandos de Limpeza

### Limpar node_modules (e reinstalar)

```bash
# Windows
rmdir /s /q node_modules
npm install

# Linux/Mac
rm -rf node_modules
npm install
```

### Limpar Arquivos Temporários

```bash
# Windows
rmdir /s /q uploads\temp

# Linux/Mac
rm -rf uploads/temp/*
```

### Limpar Logs Antigos

```bash
# Linux/Mac
find logs/ -name "*.log" -mtime +30 -delete

# Windows (PowerShell)
Get-ChildItem logs/ -Filter *.log | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} | Remove-Item
```

---

## 🔐 Comandos de Segurança

### Gerar Nova API Key

```bash
node -e "const crypto = require('crypto'); console.log('pk_' + crypto.randomBytes(24).toString('hex'));"
```

### Verificar Permissões de Arquivos (Linux)

```bash
# Uploads deve ser writable
ls -la uploads/

# Se necessário:
chmod 755 uploads/
chmod 755 uploads/gg uploads/outros uploads/temp
```

### Backup do Banco

```bash
# Backup
pg_dump -U postgres poker_hands > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres poker_hands < backup_20260123.sql
```

---

## 📊 Comandos de Monitoramento

### Ver Uso de CPU/RAM (PM2)

```bash
pm2 monit
```

### Ver Tamanho dos Logs

```bash
# Windows
dir logs

# Linux/Mac
du -sh logs/*
```

### Ver Espaço em Disco

```bash
# Windows
dir uploads /s

# Linux/Mac
du -sh uploads/*
```

---

## 🆘 Troubleshooting Rápido

### Bot não conecta?

```bash
# Verifique token
cd bot
cat .env | grep DISCORD_TOKEN

# Teste manualmente
node -e "console.log(require('dotenv').config()); console.log(process.env.DISCORD_TOKEN)"
```

### Backend não inicia?

```bash
# Verifique PostgreSQL
pg_isready -U postgres

# Teste conexão
psql -U postgres -d poker_hands -c "SELECT 1"

# Verifique .env
cd backend
cat .env
```

### Dashboard não carrega dados?

```bash
# Verifique se backend está rodando
curl http://localhost:5000/health

# Verifique API Key no console do navegador (F12)
# Deve aparecer erro se a key estiver errada
```

### Arquivos não processam?

```bash
# Verifique logs de erro
tail -f logs/errors.log

# Verifique permissões
ls -la uploads/

# Teste manualmente (se tiver arquivo de teste)
# Coloque um arquivo em uploads/temp e rode backend
```

---

## 📚 Links Úteis

- **Discord Developers**: https://discord.com/developers/applications
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Node.js Docs**: https://nodejs.org/docs/
- **React Docs**: https://react.dev/
- **Sequelize Docs**: https://sequelize.org/docs/
- **Discord.js Guide**: https://discordjs.guide/

---

## 💡 Dicas

### Desenvolvimento
- Use `npm run dev` para auto-reload
- Mantenha 3 terminais abertos (backend, bot, dashboard)
- Use F12 no navegador para debug do dashboard
- Consulte logs quando algo der errado

### Produção
- Sempre use HTTPS
- Configure backups automáticos
- Monitore logs regularmente
- Mantenha dependências atualizadas

### Segurança
- Nunca commite .env no git
- Mude API keys ao ir para produção
- Use senhas fortes no banco
- Configure firewall adequadamente

---

**Para mais detalhes, consulte SETUP.md ou SECURITY.md**
