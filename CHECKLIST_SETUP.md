# ✅ Checklist de Setup - Poker Hands Manager

Use este checklist para garantir que tudo foi configurado corretamente.

---

## 📋 Pré-requisitos

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 14+ instalado
- [ ] Git instalado (opcional)
- [ ] Conta Discord Developer criada

---

## 🗄️ Banco de Dados

- [ ] PostgreSQL está rodando
- [ ] Banco `poker_hands` foi criado
- [ ] Usuário do banco foi criado (opcional)
- [ ] Consegue conectar: `psql -U postgres -d poker_hands`

---

## 🤖 Discord Bot

- [ ] Aplicação criada no Discord Developer Portal
- [ ] Bot criado e token copiado
- [ ] Intents ativados:
  - [ ] Message Content Intent
  - [ ] Server Members Intent
- [ ] Bot adicionado ao servidor
- [ ] Permissões corretas:
  - [ ] Send Messages
  - [ ] Read Message History
  - [ ] Attach Files
  - [ ] Use Slash Commands
- [ ] Guild ID (Server ID) copiado

---

## 📦 Instalação

- [ ] Dependências instaladas no bot: `cd bot && npm install`
- [ ] Dependências instaladas no backend: `cd backend && npm install`
- [ ] Dependências instaladas no dashboard: `cd dashboard && npm install`

**OU simplesmente:**
- [ ] Executou `install.bat` (Windows) ou `install.sh` (Linux/Mac)

---

## 🔐 Configuração - Bot

Arquivo: `bot/.env`

- [ ] `DISCORD_TOKEN` = Token do bot
- [ ] `GUILD_ID` = ID do seu servidor
- [ ] `API_URL` = http://localhost:5000/api (desenvolvimento)

---

## 🔐 Configuração - Backend

Arquivo: `backend/.env`

- [ ] `PORT` = 5000
- [ ] `NODE_ENV` = development
- [ ] `DB_HOST` = localhost
- [ ] `DB_PORT` = 5432
- [ ] `DB_NAME` = poker_hands
- [ ] `DB_USER` = seu_usuario
- [ ] `DB_PASSWORD` = sua_senha
- [ ] `BOT_API_KEY` = chave gerada ✨
- [ ] `ADMIN_API_KEYS` = chave gerada ✨
- [ ] `CORS_ORIGIN` = http://localhost:3000

**Gerar chaves:**
```bash
node -e "const crypto = require('crypto'); console.log('pk_' + crypto.randomBytes(24).toString('hex'));"
```

---

## 🔐 Configuração - Dashboard

Arquivo: `dashboard/.env`

- [ ] `VITE_API_URL` = http://localhost:5000/api
- [ ] `VITE_ADMIN_API_KEY` = mesma chave do ADMIN_API_KEYS do backend

---

## 🔄 Migração do Banco

- [ ] Executou: `cd backend && npm run migrate`
- [ ] Viu mensagem: "✅ Migração concluída com sucesso!"
- [ ] Verificou tabelas criadas:
  - [ ] players
  - [ ] submissions
  - [ ] requests

---

## 🚀 Teste de Inicialização

### Backend

- [ ] Executou: `cd backend && npm start`
- [ ] Viu: "🚀 Servidor rodando na porta 5000"
- [ ] Viu: "✅ Conexão com banco de dados estabelecida"
- [ ] Testou: http://localhost:5000/health
- [ ] Resposta: `{"status":"ok",...}`

### Bot

- [ ] Executou: `cd bot && npm start`
- [ ] Viu: "✅ Bot online como [NomeDoBotBot]#1234"
- [ ] Viu: "✅ Comandos slash registrados"
- [ ] Bot aparece online no Discord

### Dashboard

- [ ] Executou: `cd dashboard && npm run dev`
- [ ] Navegador abriu automaticamente
- [ ] Dashboard carregou em http://localhost:3000
- [ ] Não há erros no console (F12)

---

## 🧪 Testes Funcionais

### Teste 1: Registrar Jogador

- [ ] No Discord: `/registrar-jogador usuario:@voce nickname:TestPlayer`
- [ ] Bot respondeu: "✅ Jogador TestPlayer registrado com sucesso!"
- [ ] No Dashboard: Jogador aparece na lista

### Teste 2: Solicitar Mãos

- [ ] No Discord: `/solicitar-maos`
- [ ] Bot enviou mensagem no canal
- [ ] Mensagem está formatada corretamente

### Teste 3: Enviar Arquivo

- [ ] Pegue um arquivo de teste (pode ser qualquer .txt)
- [ ] Envie no canal do Discord
- [ ] Bot reagiu com ✅
- [ ] Bot respondeu: "✅ Arquivo(s) recebido(s)..."
- [ ] No Dashboard: Arquivo aparece nas submissões

### Teste 4: Status

- [ ] No Discord: `/status-maos`
- [ ] Bot mostrou lista de quem enviou e quem falta

### Teste 5: Dashboard

- [ ] Dashboard mostra estatísticas corretas
- [ ] Consegue ver lista de jogadores
- [ ] Consegue ver submissões
- [ ] Consegue verificar (✓) uma submissão
- [ ] Consegue baixar um arquivo

---

## 🔒 Verificação de Segurança

- [ ] Arquivos .env estão no .gitignore
- [ ] API Keys foram trocadas (não estão com valor padrão)
- [ ] Senha do banco é forte
- [ ] Logs estão sendo gerados em `logs/`
- [ ] Upload de arquivos funciona apenas para jogadores registrados

---

## 📊 Verificação Final

- [ ] Todos os 3 sistemas rodando simultaneamente
- [ ] Backend: http://localhost:5000
- [ ] Dashboard: http://localhost:3000
- [ ] Bot online no Discord
- [ ] Comandos funcionando
- [ ] Arquivos sendo processados
- [ ] Dashboard mostrando dados
- [ ] Nenhum erro nos logs

---

## 🎯 Pronto para Produção?

### Desenvolvimento: SIM ✅
Se todos os checkboxes acima estão marcados, você está pronto para usar em desenvolvimento!

### Produção: Ainda não!
Antes de ir para produção, veja `SETUP.md` seção "Deploy em Produção" e complete:

- [ ] Trocou todas as API Keys
- [ ] Configurou HTTPS
- [ ] Configurou firewall
- [ ] Configurou backups do banco
- [ ] Testou em ambiente de staging
- [ ] NODE_ENV=production no backend
- [ ] Domínio configurado
- [ ] DNS configurado
- [ ] Monitoramento configurado

---

## 🆘 Problemas Comuns

### Backend não conecta no banco
```bash
# Teste a conexão
psql -U postgres -d poker_hands

# Se falhar, verifique:
- PostgreSQL está rodando?
- Credenciais no .env estão corretas?
- Banco poker_hands existe?
```

### Bot não conecta
```bash
# Verifique o token
cd bot
cat .env | grep DISCORD_TOKEN

# Token deve ter formato: MTIz...ABC
# Se começar com "seu_token_aqui", está errado!
```

### Dashboard não carrega dados
```bash
# Abra o Console do navegador (F12)
# Procure por erros vermelhos
# Erros comuns:
- "Network Error" → Backend não está rodando
- "401 Unauthorized" → API Key incorreta no dashboard/.env
```

### Comandos não aparecem no Discord
```bash
# Aguarde até 1 hora (comandos globais)
# OU use GUILD_ID no bot/.env (instantâneo)
# Verifique: Bot tem permissão "Use Application Commands"?
```

---

## 📚 Próximos Passos

Tudo funcionando? Ótimo! 🎉

1. **Leia `COMANDOS_RAPIDOS.md`** para referência de comandos
2. **Consulte `SECURITY.md`** para entender as proteções
3. **Veja `VALOR_PROJETO.md`** para apresentar ao contratante
4. **Quando for para produção:** Siga `SETUP.md` seção de deploy

---

**Dúvidas?** Consulte a documentação ou os arquivos de log!

**Tudo OK?** Parabéns! Seu sistema está rodando! 🚀
