# 🃏 Poker Hands Manager

Sistema profissional completo para gerenciamento automatizado de históricos de mãos de poker.

**🚀 Automatiza 100% do processo | 🔒 Segurança empresarial | ⚡ Economiza 80-90% do tempo**

---

## ⚡ Início Rápido

### Windows
```bash
# 1. Instalar tudo
install.bat

# 2. Configure os .env (veja CHECKLIST_SETUP.md)

# 3. Criar banco
psql -U postgres -c "CREATE DATABASE poker_hands;"

# 4. Migrar
cd backend && npm run migrate

# 5. Iniciar tudo
start-all.bat
```

### Linux/Mac
```bash
# 1. Instalar tudo
chmod +x install.sh && ./install.sh

# 2. Configure os .env (veja CHECKLIST_SETUP.md)

# 3. Criar banco
psql -U postgres -c "CREATE DATABASE poker_hands;"

# 4. Migrar
cd backend && npm run migrate

# 5. Iniciar (3 terminais)
# Terminal 1: cd backend && npm start
# Terminal 2: cd bot && npm start
# Terminal 3: cd dashboard && npm run dev
```

**📋 Guia completo:** Veja [SETUP.md](SETUP.md) ou [CHECKLIST_SETUP.md](CHECKLIST_SETUP.md)

---

## 🎯 O Que Este Sistema Faz

### Antes (Manual - 30-60 min)
❌ Solicitar mãos manualmente
❌ Baixar arquivos um por um
❌ Descompactar ZIPs
❌ Processar e mudar nicks no PC
❌ Separar GG vs Outros manualmente
❌ Cobrar quem não enviou
❌ Upload para sócios

### Depois (Automatizado - 5 min)
✅ Bot solicita automaticamente
✅ Bot recebe e processa tudo
✅ Descompacta ZIPs automaticamente
✅ Substitui "Hero" pelo nick real
✅ Separa GG vs Outros automaticamente
✅ Bot cobra quem não enviou
✅ Download direto pelo dashboard

---

## Estrutura do Projeto

```
poker-hands-manager/
├── bot/                    # Bot Discord
│   ├── commands/          # Comandos do bot
│   ├── events/            # Event handlers
│   └── index.js           # Entry point do bot
├── backend/               # API REST
│   └── src/
│       ├── routes/        # Rotas da API
│       ├── controllers/   # Controllers
│       ├── services/      # Lógica de negócio
│       ├── models/        # Modelos do banco
│       └── config/        # Configurações
├── dashboard/             # Frontend React
│   └── src/
│       ├── components/    # Componentes React
│       ├── pages/         # Páginas
│       └── services/      # API client
└── uploads/              # Arquivos processados
    ├── gg/               # Arquivos do GGPoker
    ├── outros/           # Outros sites
    └── temp/             # Temporários
```

## Funcionalidades

### Bot Discord
- **Solicitação de mãos**: Comando para pedir mãos aos jogadores
- **Recebimento automático**: Aceita arquivos .txt e .zip
- **Cobrança**: Lembra jogadores que não enviaram
- **Status**: Mostra quem enviou e quem falta

### Processamento Automático
- Descompacta arquivos ZIP
- Identifica site (GGPoker vs outros)
- Substitui "Hero" pelo nick do jogador
- Categoriza em pastas separadas
- Mantém arquivos descompactados

### Dashboard
- Visualização de envios
- Download de arquivos processados
- Sistema de verificação (tickar)
- Estatísticas e histórico

## Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Conta Discord Developer

### Setup

1. Clone o repositório
2. Instale as dependências:

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

3. Configure as variáveis de ambiente:
   - Copie `.env.example` para `.env` em cada pasta
   - Preencha com suas credenciais

4. Execute as migrações do banco:
```bash
cd backend
npm run migrate
```

5. Inicie os serviços:

```bash
# Terminal 1 - Bot
cd bot
npm start

# Terminal 2 - Backend
cd backend
npm start

# Terminal 3 - Dashboard
cd dashboard
npm start
```

## Configuração do Discord Bot

1. Acesse https://discord.com/developers/applications
2. Crie uma nova aplicação
3. Vá em "Bot" e crie um bot
4. Copie o token e adicione em `.env`
5. Em "OAuth2" > "URL Generator":
   - Selecione scope: `bot`, `applications.commands`
   - Permissões: `Send Messages`, `Read Message History`, `Attach Files`
6. Use a URL gerada para adicionar o bot ao seu servidor

## Uso

### Comandos do Bot

- `/solicitar-maos [mensagem]` - Envia solicitação personalizada de mãos
- `/status-maos` - Mostra quem enviou e quem falta
- `/cobrar [@usuario]` - Cobra envio de jogador específico
- `/listar-jogadores` - Lista todos os jogadores registrados

### Dashboard

Acesse `http://localhost:3000` (ou URL de produção)

- **Players**: Lista de jogadores e status
- **Uploads**: Arquivos recebidos e processados
- **Downloads**: Baixar arquivos por categoria
- **Settings**: Configurações do sistema

## Deploy

### Bot + Backend (Railway)
```bash
railway login
railway init
railway up
```

### Dashboard (Vercel)
```bash
vercel login
vercel
```

## Tecnologias

- **Bot**: discord.js
- **Backend**: Node.js, Express, PostgreSQL, Sequelize
- **Dashboard**: React, Axios, TailwindCSS
- **Processamento**: AdmZip, fs/promises

## Suporte

Para dúvidas ou problemas, entre em contato com o desenvolvedor.

## Licença

Proprietary - Todos os direitos reservados
