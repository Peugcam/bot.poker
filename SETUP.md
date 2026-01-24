# Guia de Setup - Poker Hands Manager

Este guia irá te ajudar a configurar e executar o sistema completo em **modo de desenvolvimento** e **produção**.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **Conta Discord Developer** ([Portal](https://discord.com/developers/applications))

## Parte 1: Configuração do Banco de Dados

### 1.1 Instalar PostgreSQL

Após instalar o PostgreSQL, abra o terminal e crie o banco:

```bash
# Acesse o PostgreSQL (Windows: usar SQL Shell ou pgAdmin)
psql -U postgres

# Crie o banco de dados
CREATE DATABASE poker_hands;

# Crie um usuário (opcional, mas recomendado)
CREATE USER poker_admin WITH PASSWORD 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON DATABASE poker_hands TO poker_admin;

# Saia do psql
\q
```

## Parte 2: Configuração do Bot Discord

### 2.1 Criar Aplicação no Discord

1. Acesse: https://discord.com/developers/applications
2. Clique em **"New Application"**
3. Dê um nome (ex: "Poker Hands Bot")
4. Vá em **"Bot"** no menu lateral
5. Clique em **"Add Bot"** → Confirme
6. **Copie o Token** (você vai precisar depois)
7. Ative as seguintes **Privileged Gateway Intents**:
   - ✅ Message Content Intent
   - ✅ Server Members Intent

### 2.2 Adicionar Bot ao Servidor

1. Vá em **"OAuth2"** → **"URL Generator"**
2. Selecione os **scopes**:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Selecione as **permissões** (Bot Permissions):
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Attach Files
   - ✅ Use Slash Commands
4. Copie a URL gerada e abra no navegador
5. Selecione seu servidor e autorize

### 2.3 Obter IDs Necessários

**Guild ID (ID do Servidor):**
1. No Discord, ative o Modo Desenvolvedor: Configurações → Avançado → Modo Desenvolvedor
2. Clique com botão direito no seu servidor → Copiar ID

**Channel ID (opcional):**
- Clique com botão direito em um canal → Copiar ID

## Parte 3: Instalação das Dependências

Abra o terminal na pasta do projeto e instale as dependências:

```bash
# Bot
cd bot
npm install

# Backend
cd ../backend
npm install

# Dashboard
cd ../dashboard
npm install
```

## Parte 4: Configuração das Variáveis de Ambiente

### 4.1 Bot (.env)

```bash
cd bot
cp .env.example .env
```

Edite o arquivo `bot/.env`:

```env
DISCORD_TOKEN=cole_seu_token_aqui
GUILD_ID=id_do_seu_servidor
API_URL=http://localhost:5000/api
```

### 4.2 Backend (.env)

```bash
cd ../backend
cp .env.example .env
```

Edite o arquivo `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=poker_hands
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres

# API Keys - IMPORTANTE: Gere chaves seguras!
BOT_API_KEY=cole_chave_gerada_abaixo
ADMIN_API_KEYS=cole_chave_gerada_abaixo
```

**Gere chaves seguras:**

```bash
# Execute este comando 2x (uma para BOT_API_KEY, outra para ADMIN_API_KEYS)
node -e "const crypto = require('crypto'); console.log('pk_' + crypto.randomBytes(24).toString('hex'));"
```

Cole as chaves geradas no `.env`.

### 4.3 Dashboard (.env)

```bash
cd ../dashboard
cp .env.example .env
```

Edite o arquivo `dashboard/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_API_KEY=mesma_chave_do_ADMIN_API_KEYS_do_backend
```

## Parte 5: Inicializar o Banco de Dados

```bash
cd backend

# Sincroniza tabelas (apenas primeira vez ou após mudanças nos modelos)
npm start
# Aguarde ver: "✅ Modelos sincronizados com banco de dados"
# Pressione Ctrl+C para parar
```

## Parte 6: Executar o Sistema

Abra **3 terminais** separados:

### Terminal 1 - Backend

```bash
cd backend
npm start
```

Aguarde ver: `🚀 Servidor rodando na porta 5000`

### Terminal 2 - Bot Discord

```bash
cd bot
npm start
```

Aguarde ver: `✅ Bot online como [NomeDoBot]#1234`

### Terminal 3 - Dashboard

```bash
cd dashboard
npm run dev
```

O navegador abrirá automaticamente em `http://localhost:3000`

## Parte 7: Primeiro Uso

### 7.1 Registrar Primeiro Jogador

No Discord, use o comando:

```
/registrar-jogador usuario:@jogador nickname:NickDoJogador
```

### 7.2 Solicitar Mãos

```
/solicitar-maos mensagem:Por favor enviem as mãos de hoje!
```

### 7.3 Jogador Envia Arquivo

O jogador envia o arquivo .txt ou .zip:
- Diretamente no canal onde foi solicitado
- Ou no DM do bot

### 7.4 Verificar no Dashboard

1. Abra `http://localhost:3000`
2. Vá em **"Submissões"**
3. Veja os arquivos processados
4. Clique em **"Verificar"** após conferir
5. Baixe individualmente ou em lote

## Comandos do Bot

| Comando | Descrição |
|---------|-----------|
| `/solicitar-maos [mensagem]` | Solicita mãos aos jogadores |
| `/status-maos` | Mostra quem enviou e quem falta |
| `/cobrar [@jogador]` | Cobra envio (específico ou todos) |
| `/registrar-jogador @usuario nickname` | Registra novo jogador |
| `/listar-jogadores` | Lista todos os jogadores |

## Estrutura de Pastas

Após processamento, os arquivos ficam organizados:

```
uploads/
├── gg/           ← Arquivos do GGPoker processados
├── outros/       ← Arquivos de outros sites processados
└── temp/         ← Temporários (são deletados automaticamente)
```

## Logs e Auditoria

Os logs ficam em:

```
logs/
├── audit.log     ← Ações dos usuários
├── security.log  ← Eventos de segurança
└── errors.log    ← Erros do sistema
```

## Troubleshooting

### Bot não conecta

- Verifique se o token está correto no `.env`
- Certifique-se que o bot foi adicionado ao servidor
- Verifique se as intents estão ativadas

### Erro de banco de dados

- Verifique se o PostgreSQL está rodando
- Teste a conexão: `psql -U postgres -d poker_hands`
- Verifique credenciais no `backend/.env`

### Dashboard não carrega dados

- Verifique se backend está rodando
- Verifique se a API_KEY está correta
- Abra o Console do navegador (F12) para ver erros

### Arquivos não são processados

- Verifique logs em `logs/errors.log`
- Certifique-se que a pasta `uploads/` existe e tem permissões
- Verifique se o arquivo é .txt ou .zip válido

## Segurança em Produção

### IMPORTANTE: Antes de colocar em produção

1. **Mude todas as API Keys** no `.env`
2. **Use HTTPS** (SSL/TLS)
3. **Configure firewall** (apenas portas necessárias)
4. **Use variáveis de ambiente** (não commite .env no git)
5. **Ative NODE_ENV=production** no backend
6. **Use banco gerenciado** (AWS RDS, Supabase, etc.)
7. **Configure backups** automáticos do banco
8. **Monitore logs** regularmente
9. **Limite taxa de requisições** (já implementado, mas ajuste conforme necessário)
10. **Use Redis** para rate limiting em produção

## Deploy em Produção

### Opção 1: Railway (Recomendado para iniciantes)

**Backend + Bot:**
```bash
# Instale Railway CLI
npm install -g @railway/cli

# Login
railway login

# Na pasta backend
cd backend
railway init
railway up

# Configure variáveis de ambiente no dashboard
# railway.app

# Repita para o bot
cd ../bot
railway init
railway up
```

**Dashboard:**
```bash
# Instale Vercel CLI
npm install -g vercel

cd dashboard
vercel

# Siga as instruções
# Configure variáveis de ambiente no dashboard
```

### Opção 2: VPS (Mais controle)

1. Contrate uma VPS (DigitalOcean, Linode, AWS EC2)
2. Instale Node.js e PostgreSQL
3. Clone o repositório
4. Configure `.env` com valores de produção
5. Use PM2 para manter processos rodando:

```bash
npm install -g pm2

# Backend
cd backend
pm2 start src/index.js --name poker-backend

# Bot
cd ../bot
pm2 start index.js --name poker-bot

# Dashboard (build estático)
cd ../dashboard
npm run build
# Sirva a pasta dist/ com nginx ou similar
```

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs em `logs/`
2. Consulte a documentação do Discord.js
3. Abra uma issue no repositório

---

**Desenvolvido com segurança e boas práticas em mente! 🔒**
