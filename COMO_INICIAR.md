# 🚀 Como Iniciar o Sistema - Poker Hands Manager

**Data:** 2026-01-23

---

## ✅ O Que Já Está Pronto

Todo o sistema está **95% configurado**! Aqui está o que já foi feito:

- ✅ PostgreSQL 18 instalado e funcionando
- ✅ Banco de dados `poker_hands` criado
- ✅ 3 tabelas criadas (players, submissions, requests)
- ✅ Backend completamente configurado
- ✅ Bot com dependências instaladas
- ✅ Dashboard completamente configurado
- ✅ Todos os diretórios necessários criados
- ✅ API Keys geradas

---

## ⚠️ O Que Falta Fazer (5%)

Você precisa apenas **adicionar suas credenciais do Discord**:

### 1. Criar Bot no Discord Developer Portal

1. Acesse: https://discord.com/developers/applications
2. Clique em **"New Application"**
3. Dê um nome (ex: "Poker Hands Bot")
4. Vá em **"Bot"** no menu lateral
5. Clique em **"Add Bot"**
6. **COPIE O TOKEN** (você vai precisar dele!)
7. Ative estas **Intents**:
   - ✅ Message Content Intent
   - ✅ Server Members Intent
8. Salve as mudanças

### 2. Adicionar Bot ao Servidor

1. Vá em **"OAuth2"** → **"URL Generator"**
2. Marque em **Scopes**:
   - ✅ bot
   - ✅ applications.commands
3. Marque em **Permissions**:
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Attach Files
   - ✅ Use Slash Commands
4. **Copie a URL** gerada
5. Abra a URL no navegador e adicione o bot ao seu servidor

### 3. Obter Guild ID (Server ID)

1. No Discord, vá em **Configurações de Usuário** → **Avançado**
2. Ative o **"Modo Desenvolvedor"**
3. Clique com botão direito no seu servidor
4. Clique em **"Copiar ID do Servidor"**

### 4. Configurar o arquivo bot/.env

Abra o arquivo: `C:\Users\paulo\OneDrive\Desktop\poker-hands-manager\bot\.env`

E substitua:

```env
DISCORD_TOKEN=SEU_TOKEN_AQUI          # Cole o token do passo 1
GUILD_ID=SEU_GUILD_ID_AQUI            # Cole o Guild ID do passo 3
```

**O resto já está configurado!**

---

## 🎯 Iniciar o Sistema

Você tem 2 opções:

### Opção 1: Automático (Windows)

No diretório do projeto, execute:

```bash
start-all.bat
```

Isso vai abrir **3 janelas** automaticamente:
- Terminal 1: Backend (porta 5000)
- Terminal 2: Bot Discord
- Terminal 3: Dashboard (porta 3000)

### Opção 2: Manual (3 Terminais)

**Terminal 1 - Backend:**
```bash
cd C:\Users\paulo\OneDrive\Desktop\poker-hands-manager\backend
npm start
```
Aguarde ver: `🚀 Servidor rodando na porta 5000`

**Terminal 2 - Bot:**
```bash
cd C:\Users\paulo\OneDrive\Desktop\poker-hands-manager\bot
npm start
```
Aguarde ver: `✅ Bot online como [SeuBot]#1234`

**Terminal 3 - Dashboard:**
```bash
cd C:\Users\paulo\OneDrive\Desktop\poker-hands-manager\dashboard
npm run dev
```
O navegador abrirá em: http://localhost:3000

---

## 🧪 Testar o Sistema

### 1. Testar Backend

Abra no navegador: http://localhost:5000/health

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

### 2. Testar Bot no Discord

No seu servidor Discord, digite:

```
/registrar-jogador usuario:@você nickname:TestPlayer
```

O bot deve responder: `✅ Jogador TestPlayer registrado com sucesso!`

### 3. Solicitar Mãos

```
/solicitar-maos
```

O bot deve enviar uma mensagem no canal!

### 4. Enviar Arquivo de Teste

1. Crie um arquivo de teste: `teste.txt` com qualquer conteúdo
2. Envie no canal do Discord
3. O bot deve reagir com ✅
4. O bot deve responder confirmando o recebimento

### 5. Ver no Dashboard

1. Abra: http://localhost:3000
2. Veja as estatísticas
3. Clique em "Jogadores" → Você deve ver "TestPlayer"
4. Clique em "Submissões" → Você deve ver o arquivo enviado

---

## 📊 URLs Importantes

- **Backend API:** http://localhost:5000
- **Backend Health:** http://localhost:5000/health
- **Dashboard:** http://localhost:3000
- **Discord Developer:** https://discord.com/developers/applications

---

## 🔐 Credenciais de Acesso

### Banco de Dados PostgreSQL
```
Host: localhost
Port: 5432
Database: poker_hands
User: postgres
Password: 255342
```

### API Keys
```
Bot API Key: pk_158aba90ae3fc72035f24e5ad159acb5f37251f086780815
Admin API Key: pk_366b48b56a86f6aaa65576c0d50b1449c846aea7cd04a14a
```

---

## 🆘 Problemas Comuns

### Backend não inicia
```bash
# Verifique se o PostgreSQL está rodando
export PGPASSWORD=255342
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d poker_hands -c "\l"
```

### Bot não conecta
- Verifique se o TOKEN está correto no `bot/.env`
- Verifique se as Intents estão ativas no Discord Developer Portal
- Verifique se o bot foi adicionado ao servidor

### Dashboard não carrega
- Verifique se o backend está rodando (http://localhost:5000/health)
- Abra F12 no navegador e veja os erros no Console

### Comandos não aparecem no Discord
- Aguarde até 1 hora (comandos globais levam tempo)
- OU use GUILD_ID no bot/.env (aparece instantaneamente no servidor)

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- `README.md` - Visão geral do projeto
- `COMECE_AQUI.md` - Guia passo a passo completo
- `CHECKLIST_SETUP.md` - Checklist de verificação
- `COMANDOS_RAPIDOS.md` - Referência de comandos
- `.project-status.md` - Status técnico completo

---

## 🎉 Pronto!

Assim que você:

1. ✅ Criar o bot no Discord
2. ✅ Copiar o TOKEN
3. ✅ Copiar o GUILD_ID
4. ✅ Colar no arquivo `bot/.env`
5. ✅ Rodar `start-all.bat`

**Seu sistema estará 100% funcional!** 🚀

---

**Boa sorte! Qualquer dúvida, consulte a documentação ou verifique os logs.**
