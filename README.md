# Framework ReactJS API# Framework ReactJS API



Framework completo para APIs RESTful com TypeScript, DDD, Clean Architecture e JWT Authentication.Framework base para camada de data flow/API de projetos React com DDD, Clean Architecture e SOLID. Pronto para ser usado como dependência em outros projetos.



## 🚀 Quick Start## Instalação



```bash```bash

# Instalarnpm install framework-reactjs-api

npm install framework-reactjs-api```



# Criar app## Distribuição e Instalação

import express from 'express';

import { setupFramework } from 'framework-reactjs-api';Este framework está preparado para ser distribuído como um pacote NPM:



const app = express();- ✅ **Sem Build Automático**: O framework não executa `npm run build` durante a instalação

app.use(express.json());- ✅ **Código Pré-compilado**: Inclui pasta `dist/` com código JavaScript compilado

setupFramework(app);  // ✨ Pronto!- ✅ **CLIs Funcionais**: Scripts executáveis em `bin/` com permissões corretas

- ✅ **Otimização de Tamanho**: Exclui código fonte TypeScript do pacote final

app.listen(3000);- ✅ **Documentação Completa**: Inclui README, MANUAL e exemplos

```

### Para Desenvolvedores do Framework

**Rotas criadas automaticamente:**

- `POST /api/auth/login` - Login com JWT```bash

- `POST /api/auth/register` - Registro de usuários# Build local (desenvolvimento)

- `GET /api/auth/me` - Dados do usuário autenticadonpm run build



## 📚 Documentação# Publicação (executa build automaticamente)

npm publish

- **[GUIA-RAPIDO.md](GUIA-RAPIDO.md)** - Tutorial completo e referência rápida```

- **[GUIA-AUTENTICACAO-JWT.md](GUIA-AUTENTICACAO-JWT.md)** - Autenticação JWT em detalhes

- **[CHANGELOG.md](CHANGELOG.md)** - Histórico de versões### Para Usuários do Framework



## ✨ RecursosSimplesmente instale e use - não é necessário compilar:



### 🔐 Autenticação JWT```bash

```typescriptnpm install framework-reactjs-api

import { setupFramework, AuthMiddleware } from 'framework-reactjs-api';# Pronto para usar!

```

// Setup automático com rotas de auth

setupFramework(app);## 🚀 Início Rápido



// Proteger rotas customizadas### 1. Instalação

const authMiddleware = new AuthMiddleware();

router.get('/produtos', authMiddleware.authenticate(), controller.findAll);```bash

```npm install framework-reactjs-api --save

```

### 🏗️ Scaffold de Use Cases

```bash### 2. Setup Automático (✨ Novidade!)

# Gera estrutura completa: Model, Repository, Service, Business, Routes

npx framework-reactjs-api-scaffold Produto```typescript

```// src/app.ts

import express from 'express';

**Gera automaticamente:**import { setupFramework } from 'framework-reactjs-api';

```

src/use-cases/produto/const app = express();

├── domains/ProdutoDom.tsapp.use(express.json());

├── repository/ProdutoRepository.ts

├── ProdutoBusiness.ts// ✨ Uma linha e tudo está configurado!

├── ProdutoService.tssetupFramework(app);

└── routes/ProdutoRoutes.ts  (🔒 protegidas com JWT)

```// Suas rotas personalizadas

app.use('/api/products', productRouter);

### 💾 Models com Decorators

```typescriptapp.listen(3000, () => {

import { BaseModel, Entity, Column, Id } from 'framework-reactjs-api';  console.log('🚀 Servidor rodando na porta 3000');

});

@Entity('produtos')```

export class ProdutoModel extends BaseModel {

  @Id()**Rotas disponíveis automaticamente:**

  id!: number;- `POST /api/auth/login` - Autenticação JWT

- `POST /api/auth/register` - Registro de usuários

  @Column({ type: 'VARCHAR', nullable: false, length: 255 })- `GET /api/auth/me` - Dados do usuário autenticado

  nome!: string;

📖 **[Guia Completo de Setup Automático →](SETUP-AUTOMATICO.md)**

  @Column({ type: 'DECIMAL', precision: 10, scale: 2 })

  preco!: number;### 3. Configuração do TypeScript (tsconfig.json)

}

``````json

{

### 🔄 Sincronização Automática de Banco  "compilerOptions": {

```bash    "esModuleInterop": true,

npm run build    "experimentalDecorators": true,

npx framework-reactjs-api-sync    "emitDecoratorMetadata": true,

```    "baseUrl": "./src",

    "paths": {

**Sincroniza automaticamente:**      "@/*": ["*"],

- ✅ Modelos do framework (users, products, categories, etc)      "@/models/*": ["core/domain/models/*"],

- ✅ Seus modelos personalizados      "@/repositories/*": ["core/domain/repositories/*"],

- ✅ Índices e constraints      "@/services/*": ["core/application/services/*"]

    }

### 📦 Repository Pattern  }

```typescript}

import { BaseRepository } from 'framework-reactjs-api';```



export class ProdutoRepository extends BaseRepository<ProdutoModel> {> **Importante**: A configuração de `paths` permite usar imports limpos como `import { Model } from '@/models/Model'` em vez de caminhos relativos longos.

  constructor() {

    super(ProdutoModel);3. **Usando os Componentes do Framework**

  }

```typescript

  // Métodos herdados: findAll, findById, create, update, delete, count// Importando componentes principais

  import { 

  async findAtivos(): Promise<ProdutoModel[]> {  BaseModel, 

    return this.findBy({ ativo: true });  BaseRepository, 

  }  CustomORM, 

}  AuthService 

```} from 'framework-reactjs-api';



### 🎯 Service Layer// Importando seus modelos (usando path alias)

```typescriptimport { ProdutoModel } from '@/models/ProdutoModel';

import { BaseService } from 'framework-reactjs-api';

// Criando seu próprio modelo

export class ProdutoService extends BaseService<ProdutoModel> {export class ProdutoModel extends BaseModel {

  constructor(private repo: ProdutoRepository) {  static tableName = 'produtos';

    super(repo);  nome: string;

  }  preco: number;

}

  async buscarAtivos() {```

    return this.executeWithResponse(async () => {

      return await this.repo.findAtivos();4. **Ferramentas CLI**

    });

  }```bash

}# Criar novo use-case completo com rotas privadas (JWT)

```npx framework-reactjs-api-scaffold Usuario



### 📊 Query Builder# Sincronizar esquema do banco de dados

```typescript# Sincroniza automaticamente: UserModel, ProductModel + seus modelos

import { QueryBuilder } from 'framework-reactjs-api';npx framework-reactjs-api-sync



const produtos = await new QueryBuilder('produtos')# Executar migrações

  .select(['id', 'nome', 'preco'])npx framework-reactjs-api-migrate

  .where('ativo', '=', true)```

  .where('preco', '>', 100)

  .orderBy('preco', 'DESC')> **Novidades:**

  .limit(10)> - ✨ Scaffold gera rotas **protegidas por JWT** automaticamente!

  .execute();> - 📦 Schema-sync sincroniza **modelos do framework** (users, products) + seus modelos

```> 

> 📖 **[Ver guia completo de sincronização →](MODELOS-FRAMEWORK.md)**

## 🛠️ Comandos CLI

## ⚡ Novidades (Outubro 2025)

```bash

# Criar use case completo### ✅ Imports com Path Aliases

npx framework-reactjs-api-scaffold NomeDoUseCaseTodos os repositórios agora usam imports limpos:

```typescript

# Sincronizar modelos com banco de dadosimport { ClienteModel } from '@/models/ClienteModel'; // ✅ Novo

npx framework-reactjs-api-sync// Em vez de: '../../../core/domain/models/ClienteModel'

```

# Executar migrações SQL

npx framework-reactjs-api-migrate### ✅ Services com Respostas Padronizadas

```Services agora retornam `{status, data, message}`:

```typescript

## 📦 O Que Está Incluídoconst result = await service.findAll({

  conditions: { status: 'ativo' },

- ✅ **Authentication** - Sistema completo de JWT  limit: 10,

- ✅ **Authorization** - Middleware de proteção de rotas  includes: ['pedidos']

- ✅ **ORM Customizado** - Com decorators e migrations});

- ✅ **Repository Pattern** - BaseRepository genérico// result = { status: 200, data: [...], message: '...' }

- ✅ **Service Layer** - BaseService com tratamento de erros```

- ✅ **Business Layer** - BaseBusiness para regras de negócio

- ✅ **Query Builder** - Construtor de queries SQL### ✅ Routes Simplificadas

- ✅ **CLI Tools** - Scaffold, migrations e syncRoutes chamam direto os services e usam o status retornado:

- ✅ **TypeScript** - 100% tipado```typescript

- ✅ **Clean Architecture** - DDD e SOLIDrouter.get('/', async (req, res) => {

  const result = await service.findAll({ ...req.query });

## 🔧 Configuração Mínima  return res.status(result.status).json(result);

});

### package.json```

```json

{📖 **Detalhes**: Veja [ALTERACOES.md](./ALTERACOES.md) para mais informações.

  "scripts": {

    "build": "tsc",## Visão Geral

    "dev": "ts-node src/server.ts",

    "start": "node dist/server.js"O framework é estruturado em quatro camadas principais:

  },

  "dependencies": {1. **Router** (Presentation Layer): Recebe requisições e delega para Services

    "express": "^4.18.0",2. **Services** (Application Layer): Orquestra fluxos e delega para Business

    "framework-reactjs-api": "^1.0.0"3. **Business** (Domain Layer): Implementa regras de negócio e usa Repositories

  },4. **Repository** (Infrastructure Layer): Abstrai o acesso a dados, organizado dentro de cada caso de uso

  "devDependencies": {

    "typescript": "^5.0.0",## Características Principais

    "@types/node": "^20.0.0",

    "@types/express": "^4.17.0"- Arquitetura DDD estrita com separação clara de responsabilidades

  }- ORM customizado leve com decoradores TypeScript

}- Sistema de migrações e sincronização automática de esquema

```- Scaffolding de Use Cases via CLI

- Compatibilidade total com TypeScript e React

### tsconfig.json- Repositories organizados dentro dos próprios casos de uso para maior coesão

```json- Interfaces de domínio (Dom) para cada caso de uso

{

  "compilerOptions": {## Estrutura do Framework

    "target": "ES2020",

    "module": "commonjs",```

    "outDir": "./dist",src/

    "experimentalDecorators": true,├── core/

    "emitDecoratorMetadata": true,│   ├── auth/                   # Serviços de autenticação

    "esModuleInterop": true│   └── domain/                 # Modelos base de domínio

  }├── infra/

}│   ├── cli/                    # Ferramentas CLI (migrações, scaffold)

```│   ├── db/                     # Camada de banco de dados e ORM

│   └── repository/             # Base de repositórios

### .env└── use-cases/                  # Casos de uso do sistema

```env    ├── product/

DB_HOST=localhost    │   ├── domains/            # Interfaces de domínio

DB_PORT=5432    │   ├── repository/         # Repositório específico

DB_NAME=seu_banco    │   ├── routes/             # Rotas para API REST

DB_USER=postgres    │   ├── ProductBusiness.ts  # Lógica de negócios

DB_PASSWORD=sua_senha    │   └── ProductService.ts   # Camada de serviço

JWT_SECRET=sua_chave_secreta    └── user/

PORT=3000        ├── domains/            # Interfaces de domínio

```        ├── repository/         # Repositório específico

        ├── routes/             # Rotas para API REST

## 🧪 Exemplo Completo        ├── UserBusiness.ts     # Lógica de negócios

        └── UserService.ts      # Camada de serviço

```typescript```

// src/app.ts

import express from 'express';## Como Usar

import { setupFramework } from 'framework-reactjs-api';

import produtoRouter from './use-cases/produto/routes/ProdutoRoutes';### 1. Configuração Inicial



const app = express();```typescript

app.use(express.json());import { CustomORM } from 'framework-reactjs-api';



// Setup do framework (auth routes)// Configuração da conexão com o banco de dados

setupFramework(app);CustomORM.configure({

  host: 'localhost',

// Suas rotas  port: 5432,

app.use('/api/produtos', produtoRouter);  database: 'meu_app',

  user: 'postgres',

export default app;  password: 'senha123'

```});

```

```typescript

// src/server.ts### 2. Usando Modelos e Repositórios

import app from './app';

```typescript

const PORT = process.env.PORT || 3000;import { UserRepository, UserModel } from 'framework-reactjs-api';



app.listen(PORT, () => {// Usando o repositório

  console.log(`🚀 Server running on port ${PORT}`);const userRepo = new UserRepository();

  console.log(`📝 API: http://localhost:${PORT}/api`);const users = await userRepo.findAll();

  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);```

});

```### 3. Usando Casos de Uso



## 📖 Tutoriais```typescript

import { UserService } from 'framework-reactjs-api';

### 1. Criar Projeto do Zero

Ver **[GUIA-RAPIDO.md](GUIA-RAPIDO.md)** - Seção "Quick Start Completo"const userService = new UserService();

const result = await userService.getAllUsers(1, 10);

### 2. Adicionar Autenticação

Ver **[GUIA-AUTENTICACAO-JWT.md](GUIA-AUTENTICACAO-JWT.md)**if (result.success) {

  console.log(result.data.users);

### 3. Criar Modelo e Repository}

Ver **[GUIA-RAPIDO.md](GUIA-RAPIDO.md)** - Seção "Modelos com Decorators"```

### 4. Utilizando as Ferramentas CLI

### 4. Usar Query Builder

Ver **[GUIA-RAPIDO.md](GUIA-RAPIDO.md)** - Seção "Query Builder"O framework inclui ferramentas de linha de comando que podem ser executadas diretamente:



## 🚀 Desenvolvimento do Framework#### Criar novos casos de uso (scaffolding):



### Estrutura do Projeto```bash

```npx framework-reactjs-api-scaffold NomeEntidade

framework-reactjs-api/```

├── src/

│   ├── core/#### Executar migrações de banco de dados:

│   │   ├── auth/          # Authentication & JWT

│   │   ├── business/      # Business layer```bash

│   │   ├── domain/        # Modelsnpx framework-reactjs-api-migrate

│   │   │   └── models/```

│   │   └── services/      # Service layer

│   ├── infra/#### Sincronizar esquema do banco com modelos:

│   │   ├── cli/           # CLI tools

│   │   ├── db/            # ORM & Query Builder```bash

│   │   └── repository/    # Repository basenpx framework-reactjs-api-sync

│   ├── routes/            # Auth routes```

│   └── index.ts           # Public exports

├── bin/                   # Executáveis CLI## Solucionando Problemas de Importação

├── examples/              # Exemplos de uso

└── dist/                  # Build outputQuando usar o framework como dependência em outro projeto, use os seguintes padrões de importação:

```

```typescript

### Build e Publicação// ✅ Correto: Importar componentes do ponto de entrada principal

```bashimport { BaseModel, BaseRepository, CustomORM } from 'framework-reactjs-api';

# Desenvolvimento local

npm run build// ❌ Incorreto: Não tente acessar diretamente arquivos internos

// import { BaseModel } from 'framework-reactjs-api/core/domain/models/BaseModel';

# Publicar no NPM```

npm version patch  # ou minor/major

npm publishPara mais detalhes sobre resolução de problemas de importação, consulte a [seção de troubleshooting](./MANUAL.md#resolução-de-problemas-de-importação) no MANUAL.md.

```

#### Sincronizar esquema do banco de dados:

## 📊 Exports Disponíveis

```bash

```typescriptnpx framework-reactjs-api-sync

import {```

  // Core

  BaseModel, Entity, Column, Id, UniqueIndex, BusinessIndex,## Extensão do Framework

  

  // ModelsPara estender o framework para seu próprio projeto:

  UserModel, ProductModel, CategoryModel,

  1. Crie novos modelos de domínio estendendo `BaseModel`

  // Services & Business2. Crie novos repositórios estendendo `BaseRepository`

  BaseService, BaseBusiness,3. Organize seus casos de uso seguindo a estrutura de pastas recomendada:

  ServiceResponse, PaginatedResponse,   - `/domains` para interfaces de domínio

     - `/repository` para repositórios específicos

  // Auth   - `EntityBusiness.ts` para lógica de negócios

  AuthMiddleware, AuthService, authRoutes,   - `EntityService.ts` para camada de serviço

  setupFramework, createFrameworkRouter,

  ## Desenvolvimento

  // Database

  CustomORM, initializeORM, QueryBuilder,```bash

  # Instalação de dependências para desenvolvimento

  // Repositorynpm install

  BaseRepository, IRepository,

  PaginationOptions, PaginatedResult,# Compilação 

  npm run build

  // CLI

  runMigration, syncSchema, scaffoldUseCase# Gerar novo use case (desenvolvimento do framework)

} from 'framework-reactjs-api';npm run scaffold <NomeDoModelo>

```

# Para usuários finais, use:

## 🤝 Contribuindo# npx framework-reactjs-api-scaffold <NomeDoModelo>



Contribuições são bem-vindas! Por favor:# Executar migrações

npm run migration:run

1. Fork o projeto

2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)# Sincronização do esquema

3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)npm run schema:sync

4. Push para a branch (`git push origin feature/AmazingFeature`)

5. Abra um Pull Request# Visualizar manual de uso

npm run docs:manual

## 📄 Licença```



MIT License - veja o arquivo LICENSE para detalhes.## Documentação



## 👥 AutorConsulte [MANUAL.md](MANUAL.md) para documentação completa sobre a instalação, uso e arquitetura do framework.



**Roberto Medeiros**## Tecnologias

- GitHub: [@professorRobertoMedeiros](https://github.com/professorRobertoMedeiros)

- Email: professor.roberto.medeiros@gmail.com- TypeScript

- Node.js

## 🔗 Links Úteis- PostgreSQL

- Reflect Metadata (decoradores)

- **Documentação Completa:** [GUIA-RAPIDO.md](GUIA-RAPIDO.md)

- **Autenticação JWT:** [GUIA-AUTENTICACAO-JWT.md](GUIA-AUTENTICACAO-JWT.md)## Licença

- **Changelog:** [CHANGELOG.md](CHANGELOG.md)

- **Repositório:** https://github.com/professorRobertoMedeiros/framework-reactjs-apiMIT

---

**Versão:** 1.0.0  
**Status:** ✅ Production Ready  
**Última atualização:** Janeiro 2025
