# 👋 COMECE AQUI - Poker Hands Manager

**Bem-vindo!** Este é seu ponto de partida. Siga este guia para ter o sistema rodando em 30 minutos.

---

## 🎯 O Que Você Vai Fazer

1. ✅ Instalar dependências (5 min)
2. ✅ Configurar Discord Bot (10 min)
3. ✅ Configurar banco de dados (5 min)
4. ✅ Configurar variáveis de ambiente (5 min)
5. ✅ Testar tudo (5 min)

**Total:** ~30 minutos

---

## 📋 Você Tem Instalado?

Antes de começar, verifique se tem:

```bash
# Node.js 18+
node --version
# Deve mostrar: v18.x.x ou superior

# PostgreSQL 14+
psql --version
# Deve mostrar: psql (PostgreSQL) 14.x ou superior
```

**Não tem?** Instale antes:
- Node.js: https://nodejs.org/
- PostgreSQL: https://www.postgresql.org/download/

---

## 🚀 Passo 1: Instalação Rápida

### Windows
```bash
# Abra o terminal nesta pasta e execute:
install.bat
```

### Linux/Mac
```bash
# Abra o terminal nesta pasta e execute:
chmod +x install.sh
./install.sh
```

**O que isso faz?**
- Instala todas as dependências (bot, backend, dashboard)
- Cria arquivos .env baseados nos exemplos

---

## 🤖 Passo 2: Configurar Discord Bot

### 2.1 Criar Bot no Discord

1. Acesse: https://discord.com/developers/applications
2. Clique **"New Application"**
3. Nome: `Poker Hands Bot` (ou o que quiser)
4. Vá em **"Bot"** (menu lateral)
5. Clique **"Add Bot"** → Confirme
6. **COPIE O TOKEN** (botão "Copy")
7. Ative as **Intents** (na mesma página):
   - ✅ Message Content Intent
   - ✅ Server Members Intent
8. Clique **"Save Changes"**

### 2.2 Adicionar Bot ao Servidor

1. Vá em **"OAuth2"** → **"URL Generator"**
2. Selecione **Scopes:**
   - ✅ bot
   - ✅ applications.commands
3. Selecione **Permissions:**
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Attach Files
   - ✅ Use Slash Commands
4. **Copie a URL** gerada no final da página
5. **Abra a URL** no navegador
6. Selecione seu servidor
7. Autorize

### 2.3 Obter IDs

**Server ID (Guild ID):**
1. No Discord: Configurações → Avançado → Ative **"Modo Desenvolvedor"**
2. Clique com botão direito no seu servidor → **"Copiar ID"**

---

## 🗄️ Passo 3: Configurar Banco de Dados

### Opção A: Linha de Comando
```bash
# Conecte ao PostgreSQL
psql -U postgres

# Cole estes comandos:
CREATE DATABASE poker_hands;
CREATE USER poker_admin WITH PASSWORD 'MinhaSenh@123';
GRANT ALL PRIVILEGES ON DATABASE poker_hands TO poker_admin;
\q
```

### Opção B: pgAdmin (GUI)
1. Abra pgAdmin
2. Clique com botão direito em "Databases" → "Create" → "Database"
3. Nome: `poker_hands`
4. Save

---

## 🔐 Passo 4: Configurar Variáveis de Ambiente

### 4.1 Gerar API Keys

Abra o terminal e execute **DUAS VEZES** (para gerar 2 chaves):

```bash
node -e "const crypto = require('crypto'); console.log('pk_' + crypto.randomBytes(24).toString('hex'));"
```

**Salve as 2 chaves** geradas, você vai usar agora.

### 4.2 Configurar Bot

Abra o arquivo: `bot/.env`

```env
DISCORD_TOKEN=cole_o_token_do_bot_aqui
GUILD_ID=cole_o_id_do_servidor_aqui
API_URL=http://localhost:5000/api
```

### 4.3 Configurar Backend

Abra o arquivo: `backend/.env`

```env
PORT=5000
NODE_ENV=development

# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=poker_hands
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgres

# API Keys (use as chaves que você gerou)
BOT_API_KEY=cole_primeira_chave_aqui
ADMIN_API_KEYS=cole_segunda_chave_aqui

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4.4 Configurar Dashboard

Abra o arquivo: `dashboard/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_API_KEY=mesma_segunda_chave_do_backend
```

---

## 🔄 Passo 5: Migrar Banco de Dados

```bash
cd backend
npm run migrate
```

**Deve ver:**
```
✅ Conexão com banco estabelecida
✅ Tabelas criadas/atualizadas com sucesso
✅ Migração concluída com sucesso!
```

---

## 🎮 Passo 6: Iniciar Sistema

### Opção A: Windows (Automático)
```bash
start-all.bat
```

Isso abrirá 3 terminais automaticamente!

### Opção B: Manual (3 terminais)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Aguarde ver: `🚀 Servidor rodando na porta 5000`

**Terminal 2 - Bot:**
```bash
cd bot
npm start
```
Aguarde ver: `✅ Bot online como [SeuBot]#1234`

**Terminal 3 - Dashboard:**
```bash
cd dashboard
npm run dev
```
Navegador abrirá em: http://localhost:3000

---

## ✅ Passo 7: Testar

### No Discord

1. **Registrar você como jogador:**
   ```
   /registrar-jogador usuario:@você nickname:MeuNick
   ```
   Deve ver: ✅ Jogador registrado!

2. **Solicitar mãos:**
   ```
   /solicitar-maos
   ```
   Bot deve enviar mensagem no canal!

3. **Ver status:**
   ```
   /status-maos
   ```
   Deve mostrar lista de jogadores!

### No Dashboard

1. Abra: http://localhost:3000
2. Deve ver as estatísticas
3. Clique em "Jogadores" → Deve ver você na lista!
4. Clique em "Submissões" → Deve carregar (vazio por enquanto)

---

## 🎉 Pronto!

Se tudo funcionou, **parabéns!** 🚀 Seu sistema está rodando!

### Próximos Passos

1. **Teste enviar um arquivo:** Pegue qualquer .txt e envie no Discord
2. **Registre seus jogadores:** Use `/registrar-jogador` para cada um
3. **Leia a documentação completa:**
   - [COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md) - Referência de comandos
   - [SETUP.md](SETUP.md) - Guia completo
   - [SECURITY.md](SECURITY.md) - Entenda a segurança
   - [VALOR_PROJETO.md](VALOR_PROJETO.md) - Apresente ao contratante

---

## 🆘 Problemas?

### Bot não conecta
```
Verifique:
1. Token está correto no bot/.env?
2. Bot foi adicionado ao servidor?
3. Intents estão ativas?
```

### Backend não inicia
```
Verifique:
1. PostgreSQL está rodando?
2. Banco poker_hands existe?
3. Credenciais no backend/.env estão corretas?
```

### Dashboard não carrega dados
```
Verifique:
1. Backend está rodando? (http://localhost:5000/health)
2. API Key no dashboard/.env está correta?
3. Abra F12 no navegador e veja erros
```

**Mais ajuda:** Consulte [CHECKLIST_SETUP.md](CHECKLIST_SETUP.md)

---

## 📚 Estrutura de Arquivos

```
📁 Documentação (LEIA)
├── COMECE_AQUI.md          ← Você está aqui!
├── CHECKLIST_SETUP.md      ← Checklist completo
├── SETUP.md                ← Guia detalhado
├── COMANDOS_RAPIDOS.md     ← Referência rápida
├── SECURITY.md             ← Documentação de segurança
├── VALOR_PROJETO.md        ← ROI e valor do projeto
├── APRESENTACAO.md         ← Apresentação visual
└── RESUMO_PROJETO.md       ← Resumo executivo

📁 Código
├── bot/                    ← Bot Discord
├── backend/                ← API Backend
├── dashboard/              ← Interface Web
├── uploads/                ← Arquivos processados
└── logs/                   ← Logs de auditoria

🚀 Scripts de Instalação
├── install.bat             ← Windows
├── install.sh              ← Linux/Mac
└── start-all.bat           ← Iniciar tudo (Windows)
```

---

## 💡 Dicas

- **Primeiro trabalho de dev?** Siga este guia linha por linha!
- **Tem experiência?** Vá direto para SETUP.md
- **Quer entender tudo?** Leia SECURITY.md também
- **Vai apresentar?** Use VALOR_PROJETO.md e APRESENTACAO.md

---

**Boa sorte! 🍀 Qualquer dúvida, consulte a documentação!**
