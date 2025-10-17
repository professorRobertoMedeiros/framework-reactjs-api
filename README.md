# Framework ReactJS API

Framework completo para APIs RESTful com TypeScript, DDD, Clean Architecture e JWT Authentication.

## 🚀 Quick Start

```bash
# Instalar
npm install framework-reactjs-api
```

## 🏗️ Criar app

```typescript
import express from 'express';
import { setupFramework } from 'framework-reactjs-api';

const app = express();
app.use(express.json());
setupFramework(app);  // ✨ Pronto!

app.listen(3000);
```

**Rotas criadas automaticamente:**
- `POST /api/auth/login` - Login com JWT
- `POST /api/auth/register` - Registro de usuários
- `GET /api/auth/me` - Dados do usuário autenticado

## 📚 Documentação

- **[MANUAL.md](MANUAL.md)** - Documentação completa e objetiva
- **[CHANGELOG.md](CHANGELOG.md)** - Histórico de versões

## ✨ Recursos

### 📊 Sistema de Rastreamento

```typescript
// Importação dos serviços
import { TracingMiddleware, LoggingService } from 'framework-reactjs-api';

// Middleware para adicionar ID único a cada requisição
app.use(TracingMiddleware.addRequestId());

// Logging com ID de rastreamento automático
LoggingService.info('Processando pedido', { orderId: 123 });
```

### 🔐 Autenticação JWT

```typescript
import { AuthMiddleware } from 'framework-reactjs-api';

const authMiddleware = new AuthMiddleware();
router.get('/produtos', authMiddleware.authenticate(), controller.findAll);
```

### 🏗️ Scaffold de Use Cases

```bash
# Gera estrutura completa: Model, Repository, Service, Business, Routes
npx framework-reactjs-api-scaffold Produto
```

## 📦 Distribuição e Instalação

Este framework está preparado para ser distribuído como um pacote NPM:

- ✅ **Código Pré-compilado**: Inclui pasta `dist/` com código JavaScript compilado
- ✅ **CLIs Funcionais**: Scripts executáveis em `bin/` com permissões corretas
- ✅ **Documentação Completa**: Inclui MANUAL.md e exemplos

### Para Desenvolvedores do Framework

```bash
# Build local (desenvolvimento)
npm run build

# Publicação (executa build automaticamente)
npm publish
```

## 🚀 Início Rápido

### 1. Instalação

```bash
npm install framework-reactjs-api --save
```

### 2. Setup Automático 

```typescript
import express from 'express';
import { setupFramework } from 'framework-reactjs-api';

const app = express();
app.use(express.json());

// Configura tudo automaticamente
setupFramework(app);

app.listen(3000, () => console.log('🚀 Servidor rodando na porta 3000'));
```

---

**Versão:** 1.0.0  
**Última atualização:** Outubro 2025
