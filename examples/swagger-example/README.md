# 📚 Swagger Example - Framework ReactJS API

Exemplo completo demonstrando a integração do **Swagger UI** com o Framework ReactJS API.

## 🎯 O que este exemplo demonstra

- ✅ Configuração automática do Swagger via `setupFramework()`
- ✅ Documentação de rotas com anotações JSDoc
- ✅ Swagger UI interativo para testar a API
- ✅ Autenticação JWT integrada no Swagger
- ✅ Schemas reutilizáveis (Product, Error)
- ✅ Tags para organizar endpoints
- ✅ Exemplos de requisições e respostas

---

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o `.env` conforme necessário.

### 3. Iniciar o Servidor

```bash
npm run dev
```

### 4. Acessar a Documentação

Abra no navegador:

```
http://localhost:3000/docs
```

---

## 📋 Endpoints Disponíveis

### Documentação
- **GET** `/docs` - Swagger UI (interface interativa)

### Autenticação (gerada automaticamente pelo framework)
- **POST** `/api/auth/login` - Login
- **POST** `/api/auth/register` - Registro
- **GET** `/api/auth/me` - Usuário atual

### Products
- **GET** `/api/products` - Listar produtos
- **GET** `/api/products/:id` - Buscar produto
- **POST** `/api/products` - Criar produto (requer autenticação)
- **PUT** `/api/products/:id` - Atualizar produto (requer autenticação)
- **DELETE** `/api/products/:id` - Deletar produto (requer autenticação)

---

## 📝 Como Documentar suas Rotas

### Exemplo Básico

```typescript
/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Listar todos os produtos
 *     description: Retorna lista de produtos
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', (req, res) => {
  // ...
});
```

### Definindo Schemas

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
 *         name:
 *           type: string
 *         price:
 *           type: number
 *       example:
 *         id: 1
 *         name: Notebook
 *         price: 3500.00
 */
```

### Endpoint com Autenticação

```typescript
/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Criar produto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Produto criado
 */
```

---

## ⚙️ Configuração do Swagger

### No arquivo `src/index.ts`:

```typescript
import { setupFramework } from 'framework-reactjs-api';

setupFramework(app, {
  enableSwagger: true,
  swaggerPath: '/docs',
  swaggerOptions: {
    title: 'My API',
    description: 'API documentation',
    version: '1.0.0',
    serverUrl: 'http://localhost:3000',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    },
    tags: [
      { name: 'Products', description: 'Product endpoints' },
      { name: 'Users', description: 'User endpoints' }
    ],
    apis: ['./src/**/*.ts']
  }
});
```

---

## 🎨 Recursos do Swagger UI

### 1. **Try it Out**
Clique em qualquer endpoint e depois em "Try it out" para testar diretamente na interface.

### 2. **Autenticação**
- Clique no botão "Authorize" no topo da página
- Cole o token JWT obtido do login
- Todos os requests subsequentes incluirão o token automaticamente

### 3. **Schemas**
Todos os schemas estão documentados na seção "Schemas" no final da página.

### 4. **Filtros**
Use a barra de busca no topo para filtrar endpoints por nome ou tag.

---

## 📦 Estrutura do Projeto

```
swagger-example/
├── .env.example              # Configurações
├── package.json              # Dependências
├── tsconfig.json             # TypeScript config
├── README.md                 # Este arquivo
└── src/
    ├── index.ts              # Express app com Swagger
    └── routes/
        └── products.ts       # Rotas com documentação Swagger
```

---

## 🎯 Testando a API

### 1. Testar sem Autenticação

```bash
# Listar produtos
curl http://localhost:3000/api/products

# Buscar produto específico
curl http://localhost:3000/api/products/1
```

### 2. Testar com Autenticação

```bash
# 1. Fazer login (ou usar Swagger UI)
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# 2. Criar produto
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SSD Samsung 1TB",
    "price": 550.00,
    "stock": 15
  }'
```

### 3. Testar via Swagger UI

1. Acesse `http://localhost:3000/docs`
2. Clique em "Authorize" e insira o token JWT
3. Navegue até qualquer endpoint
4. Clique em "Try it out"
5. Preencha os parâmetros
6. Clique em "Execute"

---

## 🔧 Personalização

### Alterar Tema do Swagger

```typescript
import { swaggerUIOptions } from 'framework-reactjs-api';

const customOptions = {
  ...swaggerUIOptions,
  customCss: '.swagger-ui .topbar { background-color: #1976d2 }'
};
```

### Adicionar Servidores Múltiplos

```typescript
swaggerOptions: {
  servers: [
    { url: 'http://localhost:3000', description: 'Development' },
    { url: 'https://api.staging.com', description: 'Staging' },
    { url: 'https://api.production.com', description: 'Production' }
  ]
}
```

### Adicionar Mais Tags

```typescript
swaggerOptions: {
  tags: [
    { name: 'Authentication', description: 'Auth endpoints' },
    { name: 'Products', description: 'Product management' },
    { name: 'Orders', description: 'Order management' },
    { name: 'Users', description: 'User management' }
  ]
}
```

---

## 📚 Recursos Adicionais

### OpenAPI 3.0 Specification
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger Editor](https://editor.swagger.io/)

### JSDoc para Swagger
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)

---

## ✅ Checklist

- [x] Swagger UI configurado e funcionando
- [x] Rotas de autenticação documentadas
- [x] Rotas de produtos documentadas
- [x] Schemas reutilizáveis criados
- [x] Tags organizando endpoints
- [x] Autenticação JWT integrada
- [x] Exemplos de requisições
- [x] Try it out funcionando

---

## 🎓 Próximos Passos

1. **Adicione suas rotas**: Documente suas rotas seguindo os exemplos
2. **Crie schemas**: Defina schemas para seus modelos de dados
3. **Organize com tags**: Use tags para agrupar endpoints relacionados
4. **Configure para produção**: Ajuste `serverUrl` e `NODE_ENV` para produção
5. **Personalize**: Customize cores, logo e descrições

---

**Versão:** 1.0.0  
**Framework:** Framework ReactJS API  
**Swagger:** OpenAPI 3.0
