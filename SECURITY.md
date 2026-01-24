# Documentação de Segurança

Este documento detalha todas as medidas de segurança implementadas no sistema.

## Visão Geral

O sistema foi desenvolvido com **segurança como prioridade** desde o início, implementando múltiplas camadas de proteção contra ameaças comuns.

## Camadas de Segurança Implementadas

### 1. Validação de Entrada

#### Validação de Arquivos
- **Extensões permitidas**: Apenas .txt e .zip
- **Tamanho máximo**: 50MB por arquivo
- **Magic Number Validation**: Verifica assinatura binária dos arquivos ZIP
- **Validação de conteúdo**: Verifica se o arquivo parece ser um hand history válido
- **Sanitização de nomes**: Remove caracteres perigosos dos nomes de arquivos

```javascript
// Implementado em: backend/src/services/securityValidator.js
- validateFile()
- validateFileSignature()
- sanitizeFileName()
```

#### Validação de ZIP
- **Proteção contra Zip Bombs**: Limita tamanho total extraído (200MB)
- **Limite de arquivos**: Máximo 100 arquivos por ZIP
- **Path Traversal**: Previne extração fora do diretório permitido
- **Extensões dentro do ZIP**: Apenas .txt são permitidos

```javascript
// Implementado em: backend/src/services/securityValidator.js
- validateZipLimits()
- validateZipEntryExtension()
```

#### Validação de Dados
- **Discord ID**: Formato numérico de 17-19 dígitos
- **Nickname**: 2-30 caracteres alfanuméricos
- **Sanitização de paths**: Previne path traversal (../, ~/, etc.)
- **Validação de conteúdo texto**: Detecta padrões maliciosos (script tags, etc.)

### 2. Autenticação e Autorização

#### API Keys
- **Bot API Key**: Autenticação do bot Discord com o backend
- **Admin API Keys**: Autenticação de administradores no dashboard
- **Headers customizados**: `X-API-Key` para todas as requisições

```javascript
// Implementado em: backend/src/middleware/auth.js
- authenticateBot()
- authenticateAdmin()
- authenticateBotOrAdmin()
- requireAdmin()
```

#### Geração Segura de Chaves
```bash
# Comando para gerar chaves
node -e "const crypto = require('crypto'); console.log('pk_' + crypto.randomBytes(24).toString('hex'));"
```

### 3. Rate Limiting

Proteção contra abuso e ataques DDoS:

| Tipo | Limite | Janela |
|------|--------|--------|
| Upload | 10 requests | 1 minuto |
| API Geral | 60 requests | 1 minuto |
| Auth | 5 tentativas | 5 minutos |

```javascript
// Implementado em: backend/src/middleware/rateLimiter.js
```

### 4. Auditoria e Logs

#### Sistema de Logs
- **audit.log**: Todas as ações dos usuários
- **security.log**: Eventos de segurança
- **errors.log**: Erros do sistema

#### Eventos Registrados
- ✅ Upload de arquivos
- ✅ Processamento de arquivos
- ✅ Registro de jogadores
- ✅ Solicitações de mãos
- ✅ Verificação de arquivos
- ❌ Tentativas de upload inválido
- ❌ Acessos não autorizados
- ❌ Rate limit excedido
- ❌ Atividades suspeitas

```javascript
// Implementado em: backend/src/services/auditLogger.js
```

### 5. Proteção de Conteúdo

#### Headers de Segurança
```javascript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

#### CORS
- Configuração restrita por origem
- Credenciais controladas
- Headers específicos permitidos

```javascript
// Implementado em: backend/src/index.js
```

### 6. Processamento Seguro de Arquivos

#### Isolamento
- Diretórios temporários únicos por processamento
- Limpeza automática após erro
- Nomes de arquivo com timestamp + random

#### Substituição de "Hero"
- Regex com word boundary para evitar substituições incorretas
- Preservação de formatação original
- Validação do nickname antes da substituição

```javascript
// Implementado em: backend/src/services/fileProcessor.js
```

### 7. Banco de Dados

#### Sequelize ORM
- **Previne SQL Injection**: Queries parametrizadas automaticamente
- **Validação de tipos**: DataTypes do Sequelize
- **Timestamps**: Rastreamento automático de criação/atualização

#### Soft Delete
- Jogadores não são deletados, apenas desativados
- Mantém histórico para auditoria

```javascript
// Implementado em: backend/src/models/
```

## Vetores de Ataque Mitigados

### ✅ SQL Injection
**Como prevenimos:**
- ORM Sequelize com queries parametrizadas
- Validação de tipos
- Sem queries raw ou string concatenation

### ✅ Path Traversal
**Como prevenimos:**
- Sanitização de paths
- Validação de caracteres perigosos (.., ~, etc.)
- Paths absolutos controlados
- Validação de entradas de ZIP

### ✅ Zip Bomb
**Como prevenimos:**
- Limite de tamanho extraído (200MB)
- Limite de número de arquivos (100)
- Validação de ratio de compressão

### ✅ XSS (Cross-Site Scripting)
**Como prevenimos:**
- Headers de segurança
- Sanitização de inputs
- React escapa conteúdo automaticamente

### ✅ CSRF (Cross-Site Request Forgery)
**Como prevenimos:**
- API Key obrigatória em todas as requisições
- CORS restrito

### ✅ DoS/DDoS
**Como prevenimos:**
- Rate limiting por IP/usuário
- Limites de tamanho de arquivo
- Timeouts configurados

### ✅ Arbitrary File Upload
**Como prevenimos:**
- Whitelist de extensões (.txt, .zip)
- Magic number validation
- Validação de conteúdo
- Sanitização de nomes

### ✅ Command Injection
**Como prevenimos:**
- Sem execução de comandos do sistema
- Sem eval() ou Function()
- Validação rigorosa de inputs

### ✅ Information Disclosure
**Como prevenimos:**
- Mensagens de erro genéricas em produção
- Logs sensíveis apenas localmente
- Sem stack traces para usuários

## Checklist de Segurança para Produção

Antes de ir para produção, verifique:

- [ ] Todas as API Keys foram trocadas
- [ ] NODE_ENV=production no backend
- [ ] HTTPS/SSL configurado
- [ ] Firewall configurado
- [ ] Backups automáticos do banco
- [ ] Logs sendo monitorados
- [ ] Rate limits ajustados para sua escala
- [ ] Credenciais do banco seguras
- [ ] .env não commitado no git
- [ ] Dependências atualizadas
- [ ] Testes de segurança realizados
- [ ] Plano de resposta a incidentes definido

## Boas Práticas Implementadas

### Código
- ✅ Validação de entrada em todas as camadas
- ✅ Princípio do menor privilégio
- ✅ Fail-safe defaults
- ✅ Defense in depth (múltiplas camadas)
- ✅ Separação de responsabilidades
- ✅ Logs estruturados
- ✅ Tratamento de erros consistente

### Infraestrutura
- ✅ Variáveis de ambiente para configuração
- ✅ Secrets não hardcoded
- ✅ Limpeza de recursos temporários
- ✅ Graceful shutdown
- ✅ Health checks

## Monitoramento Recomendado

### Métricas para Acompanhar
1. **Taxa de erros**: Picos podem indicar ataques
2. **Rate limit hits**: Usuários/IPs batendo limites
3. **Tamanho médio de arquivos**: Anomalias podem indicar problema
4. **Tempo de processamento**: Performance degradada
5. **Tentativas de auth falhas**: Possível brute force

### Alertas Recomendados
- ⚠️ Mais de 10 tentativas de auth falhas em 1 minuto
- ⚠️ Upload de arquivo rejeitado por validação
- ⚠️ Erro ao processar mais de 5 arquivos seguidos
- ⚠️ Taxa de erro > 5%
- 🚨 Path traversal detectado
- 🚨 Zip bomb detectado
- 🚨 Conteúdo suspeito detectado

## Resposta a Incidentes

### Se detectar atividade suspeita:

1. **Identifique**: Verifique logs (security.log, audit.log)
2. **Contenha**: Bloqueie IP/usuário se necessário
3. **Erradique**: Corrija vulnerabilidade
4. **Recupere**: Restaure de backup se necessário
5. **Documente**: Registre incidente e ações tomadas
6. **Aprenda**: Atualize processos para prevenir recorrência

## Atualizações de Segurança

### Processo Recomendado
1. Monitore vulnerabilidades: `npm audit`
2. Atualize dependências regularmente
3. Teste após atualizações
4. Mantenha changelog de segurança

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir automaticamente (quando possível)
npm audit fix

# Ver detalhes
npm audit --json
```

## Contato de Segurança

Se você descobrir uma vulnerabilidade:
1. **NÃO** abra uma issue pública
2. Entre em contato diretamente com o desenvolvedor
3. Forneça detalhes técnicos e steps para reproduzir
4. Aguarde resposta antes de divulgar

---

**Este sistema foi desenvolvido com segurança como prioridade máxima. 🔒**

Última atualização: 2026-01-23
