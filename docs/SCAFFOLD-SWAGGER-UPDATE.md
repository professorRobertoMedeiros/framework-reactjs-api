# 🔄 Atualização: Scaffold com Swagger

## 🎯 Novidade

A partir de agora, quando você criar um novo use-case com o comando `scaffold`, as rotas serão geradas automaticamente com **documentação Swagger completa**!

---

## ✅ O que foi atualizado

### **Template de Rotas** (`routes-template.ts`)

Agora gera automaticamente:

1. ✅ **Schemas Swagger** para o modelo
2. ✅ **Documentação completa** de todos os endpoints CRUD
3. ✅ **Parâmetros documentados** (query, path, body)
4. ✅ **Respostas documentadas** (200, 201, 400, 401, 404, 500)
5. ✅ **Segurança JWT** marcada em todos os endpoints
6. ✅ **Exemplos de uso** no final do arquivo

---

## 🚀 Como Usar

### 1. Criar Novo Use-Case

```bash
npm run scaffold NomeDoModelo
```

### 2. Arquivo de Rotas Gerado

O arquivo `src/use-cases/nomedomodelo/routes/NomeDoModeloRoutes.ts` será criado com:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     NomeDoModelo:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         # ... outras propriedades
 */

/**
 * @swagger
 * /api/nomedomodelos:
 *   get:
 *     tags:
 *       - NomeDoModelo
 *     summary: Listar todos os nomedomodelos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authMiddleware.authenticate(), async (req, res) => {
  // ...
});
```

### 3. Configurar Swagger no App

No seu `index.ts`:

```typescript
import { setupFramework } from 'framework-reactjs-api';
import produtoRouter from './use-cases/produto/routes/ProdutoRoutes';

setupFramework(app, {
  enableSwagger: true,
  swaggerOptions: {
    title: 'My API',
    tags: [
      { name: 'Produto', description: 'Produto management endpoints' }
    ],
    apis: ['./src/**/*.ts'] // ✅ Importante: path para escanear
  }
});

app.use('/api/produtos', produtoRouter);
```

### 4. Acessar Documentação

```
http://localhost:3000/docs
```

---

## 📝 Rotas Geradas Automaticamente

Cada use-case terá as seguintes rotas documentadas:

### **GET /api/{recursos}**
- Lista todos os recursos
- Parâmetros: `limit`, `offset`, `page`, `orderBy`, `includes`
- Resposta: Array de objetos

### **GET /api/{recursos}/:id**
- Busca recurso por ID
- Parâmetro: `id` (path)
- Resposta: Objeto único

### **POST /api/{recursos}**
- Cria novo recurso
- Body: Schema do modelo
- Resposta: Objeto criado

### **PUT /api/{recursos}/:id**
- Atualiza recurso existente
- Parâmetros: `id` (path) + body
- Resposta: Objeto atualizado

### **DELETE /api/{recursos}/:id**
- Deleta recurso
- Parâmetro: `id` (path)
- Resposta: Boolean

### **GET /api/{recursos}/count**
- Conta recursos
- Parâmetros: filtros via query
- Resposta: Número

---

## 🎨 Schemas Gerados

Para cada modelo, são gerados 3 schemas:

### 1. **{Modelo}**
Schema completo do modelo (usado em respostas)

### 2. **{Modelo}CreateRequest**
Schema para criação (POST)

### 3. **{Modelo}UpdateRequest**
Schema para atualização (PUT)

---

## 🔄 Atualizando Rotas Existentes

Se você já tem use-cases criados antes desta atualização, pode:

### Opção 1: Recriar o Use-Case
```bash
# Backup dos arquivos antigos
mv src/use-cases/produto src/use-cases/produto.backup

# Gerar novamente
npm run scaffold Produto

# Copiar sua lógica de negócio de volta
```

### Opção 2: Adicionar Manualmente

Copie a estrutura de documentação Swagger do exemplo:

```typescript
/**
 * @swagger
 * /api/produtos:
 *   get:
 *     tags:
 *       - Produto
 *     summary: Listar produtos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
```

---

## 📚 Exemplo Completo

Veja o exemplo completo em:
- `examples/swagger-example/src/routes/products.ts`

Este arquivo demonstra todas as anotações Swagger que são geradas automaticamente.

---

## ✅ Benefícios

1. **Zero Configuração**: Documentação gerada automaticamente
2. **Padrão Consistente**: Todas as rotas seguem o mesmo padrão
3. **Testável**: Use Swagger UI para testar
4. **Completo**: Todos os endpoints CRUD documentados
5. **Autenticação**: JWT já configurado
6. **Parâmetros**: Todos os query/path/body params documentados
7. **Respostas**: Todos os status codes documentados

---

## 🎯 Próximos Passos

1. ✅ Crie novos use-cases com `npm run scaffold`
2. ✅ Configure Swagger no seu app com `setupFramework()`
3. ✅ Acesse `/docs` para ver a documentação
4. ✅ Teste seus endpoints diretamente no Swagger UI
5. ✅ Customize os schemas conforme necessário

---

## 📝 Notas

- **Tags**: Cada modelo tem sua própria tag no Swagger
- **Segurança**: Todos os endpoints requerem JWT por padrão
- **Schemas**: Schemas básicos são gerados, customize conforme necessário
- **Exemplos**: Valores de exemplo devem ser atualizados manualmente

---

**Versão:** 1.0.5  
**Data:** 21 de Outubro de 2025  
**Feature:** Scaffold com Swagger automático
