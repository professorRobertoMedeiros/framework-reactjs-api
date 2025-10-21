# 📚 Swagger Integration - Framework ReactJS API

Guia completo para usar **Swagger UI** no Framework ReactJS API.

## 🎯 O que é Swagger?

Swagger (OpenAPI) é uma especificação padrão para documentar APIs REST. Com Swagger você pode:

- ✅ Documentar endpoints automaticamente
- ✅ Testar APIs diretamente no navegador
- ✅ Gerar clientes em várias linguagens
- ✅ Validar requests e responses
- ✅ Compartilhar documentação interativa

---

## 🚀 Quick Start

### 1. Instalação

O Swagger já está incluído no framework. Instale as dependências:

```bash
npm install swagger-ui-express swagger-jsdoc
npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc
```

### 2. Habilitar Swagger

No seu `index.ts`:

```typescript
import express from 'express';
import { setupFramework } from 'framework-reactjs-api';

const app = express();
app.use(express.json());

setupFramework(app, {
  enableSwagger: true,  // ✅ Habilita Swagger
  swaggerPath: '/docs' // URL da documentação
});

app.listen(3000);
```

### 3. Acessar Documentação

Abra no navegador:

```
http://localhost:3000/docs
```

**Pronto!** 🎉 Você já tem uma interface Swagger funcionando.

---

## ⚙️ Configuração Completa

### Opções Disponíveis

```typescript
setupFramework(app, {
  enableSwagger: true,
  swaggerPath: '/docs',
  swaggerOptions: {
    title: 'My API',
    description: 'Complete API documentation',
    version: '1.0.0',
    serverUrl: process.env.API_URL || 'http://localhost:3000',
    serverDescription: 'Development server',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
      url: 'https://example.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    },
    tags: [
      { name: 'Products', description: 'Product management' },
      { name: 'Users', description: 'User management' }
    ],
    apis: ['./src/**/*.ts'], // Arquivos para escanear
    enableJWT: true, // Habilita autenticação JWT
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://api.staging.com', description: 'Staging' },
      { url: 'https://api.production.com', description: 'Production' }
    ]
  }
});
```

---

## 📝 Documentando Rotas

### Exemplo Básico

```typescript
/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: List all products
 *     description: Returns a list of products
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get('/api/products', (req, res) => {
  // ...
});
```

### Com Parâmetros

```typescript
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Product ID
 *       - in: query
 *         name: includeDetails
 *         schema:
 *           type: boolean
 *         description: Include detailed information
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
```

### Com Request Body

```typescript
/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Notebook Dell
 *               price:
 *                 type: number
 *                 example: 3500.00
 *               stock:
 *                 type: number
 *                 example: 10
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid input
 */
```

---

## 🎨 Schemas Reutilizáveis

### Definir Schema

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: number
 *           description: Unique identifier
 *         name:
 *           type: string
 *           description: Product name
 *         price:
 *           type: number
 *           format: float
 *           description: Product price
 *         stock:
 *           type: number
 *           description: Available quantity
 *         active:
 *           type: boolean
 *           description: Product status
 *       example:
 *         id: 1
 *         name: Notebook Dell
 *         price: 3500.00
 *         stock: 10
 *         active: true
 */
```

### Usar Schema

```typescript
/**
 * @swagger
 * /api/products:
 *   get:
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
```

---

## 🔐 Autenticação JWT

### Configuração Automática

O framework já configura automaticamente o esquema de autenticação JWT:

```typescript
setupFramework(app, {
  enableSwagger: true,
  swaggerOptions: {
    enableJWT: true // ✅ Já vem true por padrão
  }
});
```

### Usar em Endpoints

```typescript
/**
 * @swagger
 * /api/products:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     ...
 */
```

### Como Autenticar no Swagger UI

1. Faça login via `/api/auth/login`
2. Copie o token JWT retornado
3. Clique no botão **"Authorize"** no topo da página Swagger
4. Cole o token no campo
5. Clique em "Authorize"
6. Agora todos os requests incluirão o token automaticamente

---

## 📦 Schemas Padrão do Framework

O framework já inclui schemas comuns:

### Error

```typescript
/**
 * $ref: '#/components/schemas/Error'
 * 
 * Estrutura:
 * {
 *   status: number,
 *   message: string
 * }
 */
```

### SuccessResponse

```typescript
/**
 * $ref: '#/components/schemas/SuccessResponse'
 * 
 * Estrutura:
 * {
 *   status: number,
 *   data: object,
 *   message: string
 * }
 */
```

---

## 🏷️ Organizando com Tags

### Definir Tags

```typescript
swaggerOptions: {
  tags: [
    { name: 'Authentication', description: 'Authentication endpoints' },
    { name: 'Products', description: 'Product management' },
    { name: 'Orders', description: 'Order management' },
    { name: 'Users', description: 'User management' }
  ]
}
```

### Usar Tags

```typescript
/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     ...
 */
```

Tags agrupam endpoints relacionados na interface do Swagger.

---

## 🌐 Múltiplos Ambientes

### Configurar Servidores

```typescript
swaggerOptions: {
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development'
    },
    {
      url: 'https://api-staging.myapp.com',
      description: 'Staging environment'
    },
    {
      url: 'https://api.myapp.com',
      description: 'Production environment'
    }
  ]
}
```

O usuário pode alternar entre servidores diretamente no Swagger UI.

---

## 🎨 Personalização Visual

### CSS Customizado

```typescript
import { swaggerUIOptions } from 'framework-reactjs-api';

const customOptions = {
  ...swaggerUIOptions,
  customCss: `
    .swagger-ui .topbar { 
      background-color: #1976d2;
    }
    .swagger-ui .info .title {
      color: #1976d2;
    }
  `,
  customSiteTitle: 'My API Docs'
};

app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(swaggerSpec, customOptions));
```

---

## 📋 Exemplos Completos

### CRUD Completo

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         email:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     tags: [Users]
 *     summary: Create user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Created
 * 
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Success
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Deleted
 */
```

---

## 🔧 Troubleshooting

### Swagger não aparece

**Problema:** Ao acessar `/docs`, recebe 404.

**Solução:**
```typescript
// Certifique-se de que enableSwagger está true
setupFramework(app, {
  enableSwagger: true
});
```

### Rotas não documentadas

**Problema:** Endpoints não aparecem no Swagger.

**Solução:**
```typescript
swaggerOptions: {
  apis: ['./src/**/*.ts'] // Certifique-se que o path está correto
}
```

### Autenticação não funciona

**Problema:** Mesmo após autorizar, recebe 401.

**Solução:**
- Verifique se o token está válido
- Certifique-se de que `security: [{ bearerAuth: [] }]` está na rota
- Confirme que o middleware de autenticação está ativo

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)

### Ferramentas
- [Swagger Editor](https://editor.swagger.io/) - Editor online
- [Swagger Inspector](https://inspector.swagger.io/) - Teste APIs
- [OpenAPI Generator](https://openapi-generator.tech/) - Gere clientes

---

## ✅ Checklist de Implementação

- [ ] Instalar dependências (`swagger-ui-express`, `swagger-jsdoc`)
- [ ] Habilitar Swagger no `setupFramework()`
- [ ] Configurar `swaggerOptions` (título, descrição, etc.)
- [ ] Documentar schemas principais
- [ ] Documentar rotas com `@swagger`
- [ ] Definir tags para organização
- [ ] Configurar autenticação JWT
- [ ] Testar endpoints no Swagger UI
- [ ] Adicionar exemplos de requisições
- [ ] Configurar múltiplos ambientes (dev, staging, prod)

---

## 🎯 Boas Práticas

1. **Documente tudo:** Cada endpoint deve ter documentação Swagger
2. **Use schemas:** Reutilize schemas para consistência
3. **Exemplos claros:** Forneça exemplos realistas
4. **Organize com tags:** Agrupe endpoints relacionados
5. **Segurança:** Marque endpoints protegidos com `security`
6. **Descrições úteis:** Explique o que cada endpoint faz
7. **Validações:** Documente parâmetros obrigatórios
8. **Códigos de erro:** Liste todos os possíveis status codes

---

**Versão:** 1.0.0  
**Data:** 21 de Outubro de 2025  
**Framework:** Framework ReactJS API  
**Swagger:** OpenAPI 3.0
