# Manual de Uso do Framework ReactJS API

Este manual serve como guia completo para uso do framework ReactJS API como dependência em seus projetos. O documento é estruturado para ser facilmente compreendido tanto por desenvolvedores quanto por assistentes de IA que precisem implementar, estender ou dar suporte a projetos que utilizem este framework.

## Índice

1. [Instalação](#instalação)
2. [Configuração Inicial](#configuração-inicial)
3. [Estrutura do Framework](#estrutura-do-framework)
4. [Componentes Principais](#componentes-principais)
5. [Uso do Framework](#uso-do-framework)
   - [Criação de Modelos](#criação-de-modelos)
   - [Implementação de Repositórios](#implementação-de-repositórios)
   - [Desenvolvimento de Casos de Uso](#desenvolvimento-de-casos-de-uso)
   - [Autenticação](#autenticação)
   - [Compatibilidade de Decoradores](#compatibilidade-de-decoradores)
6. [Ferramentas CLI](#ferramentas-cli)
7. [Padrões de Design](#padrões-de-design)
8. [Exemplos Completos](#exemplos-completos)
9. [Troubleshooting](#troubleshooting)
   - [Resolução de Problemas de Importação](#resolução-de-problemas-de-importação)

## Instalação

Para adicionar o framework como dependência em um projeto existente:

```bash
npm install framework-reactjs-api --save
```

Para TypeScript, certifique-se de incluir os tipos:

```json
// tsconfig.json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Configuração Inicial

Após a instalação, configure seu projeto para utilizar o framework:

1. Configure o banco de dados no arquivo `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=meu_projeto
```

2. Inicialize o framework no ponto de entrada da aplicação:

```typescript
// src/index.ts
import { initializeFramework } from 'framework-reactjs-api';

async function bootstrap() {
  await initializeFramework({
    databaseConfig: {
      // Você pode sobrescrever as configurações do .env aqui se necessário
    },
    // Outras configurações...
  });
  
  // Inicialização do seu servidor/aplicação
}

bootstrap();
```

## Estrutura do Framework

O framework está estruturado seguindo os princípios de Domain-Driven Design (DDD):

```
framework-reactjs-api/
├── core/
│   ├── auth/              # Serviços de autenticação
│   └── domain/
│       └── models/        # Modelos de domínio base
├── infra/
│   ├── cli/               # Ferramentas de linha de comando
│   ├── db/                # Camada de acesso a dados
│   ├── migrations/        # Migrações de banco de dados
│   └── repository/        # Implementações base de repositório
└── use-cases/             # Casos de uso específicos
    ├── user/              # Caso de uso de usuário
    └── [outros]/          # Outros casos de uso
```

## Componentes Principais

### Modelos de Domínio

Os modelos de domínio são a base para todas as entidades do sistema:

```typescript
import { BaseModel } from 'framework-reactjs-api';

export class ClienteModel extends BaseModel {
  static tableName = 'clientes';
  
  nome: string;
  email: string;
  telefone: string;
  
  constructor(data?: Partial<ClienteModel>) {
    super();
    Object.assign(this, data);
  }
}
```

### Repositórios

Os repositórios gerenciam o acesso a dados para cada modelo:

```typescript
import { BaseRepository } from 'framework-reactjs-api';
import { ClienteModel } from '../models/ClienteModel';

export class ClienteRepository extends BaseRepository<ClienteModel> {
  constructor() {
    super(ClienteModel);
  }
  
  // Métodos específicos além dos CRUD básicos
  async findByEmail(email: string): Promise<ClienteModel | null> {
    return this.findOne({ email });
  }
}
```

### Serviços de Negócios

Os serviços implementam a lógica de negócios:

```typescript
import { ClienteRepository } from '../repository/ClienteRepository';
import { ClienteModel } from '../models/ClienteModel';

export class ClienteService {
  private repository: ClienteRepository;
  
  constructor() {
    this.repository = new ClienteRepository();
  }
  
  async criarCliente(dados: Omit<ClienteModel, 'id'>): Promise<ClienteModel> {
    // Validação de regras de negócio
    if (!dados.email) {
      throw new Error('Email é obrigatório');
    }
    
    // Verificar se já existe
    const existente = await this.repository.findByEmail(dados.email);
    if (existente) {
      throw new Error('Cliente com este email já existe');
    }
    
    // Criar cliente
    return this.repository.create(dados);
  }
}
```

## Uso do Framework

### Criação de Modelos

Para criar um novo modelo:

1. Crie uma classe que estenda `BaseModel`
2. Defina a propriedade estática `tableName`
3. Adicione as propriedades do modelo
4. Implemente o construtor

```typescript
import { BaseModel } from 'framework-reactjs-api';

export class ProdutoModel extends BaseModel {
  static tableName = 'produtos';
  
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoriaId: number;
  
  constructor(data?: Partial<ProdutoModel>) {
    super();
    Object.assign(this, data);
  }
}
```

### Implementação de Repositórios

Para implementar um repositório:

```typescript
import { BaseRepository } from 'framework-reactjs-api';
import { ProdutoModel } from '../models/ProdutoModel';

export class ProdutoRepository extends BaseRepository<ProdutoModel> {
  constructor() {
    super(ProdutoModel);
  }
  
  async findByCategoria(categoriaId: number): Promise<ProdutoModel[]> {
    return this.findMany({ categoriaId });
  }
  
  async findInStock(): Promise<ProdutoModel[]> {
    return this.findMany({ estoque: { $gt: 0 } });
  }
}
```

### Desenvolvimento de Casos de Uso

Estruture seus casos de uso seguindo o padrão:

```
src/use-cases/[nome-do-caso-uso]/
├── models/              # Modelos específicos do caso de uso
├── repository/          # Repositórios específicos do caso de uso
├── [Nome]Business.ts    # Lógica de negócio
└── [Nome]Service.ts     # Interface de serviço
```

### Autenticação

O framework fornece um sistema completo de autenticação:

```typescript
import { AuthService } from 'framework-reactjs-api';

// Autenticar usuário
const token = await AuthService.authenticate('usuario@email.com', 'senha123');

// Verificar token
const payload = AuthService.verifyToken(token);

// Obter usuário atual
const currentUser = await AuthService.getCurrentUser(token);
```

### Compatibilidade de Decoradores

O framework suporta decoradores para validação, transformação e outras funcionalidades:

```typescript
import { BaseModel } from 'framework-reactjs-api';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UsuarioModel extends BaseModel {
  static tableName = 'usuarios';
  
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;
  
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
  
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;
  
  constructor(data?: Partial<UsuarioModel>) {
    super();
    Object.assign(this, data);
  }
}
```

## Ferramentas CLI

O framework oferece ferramentas de linha de comando para aumentar a produtividade:

> **Importante**: Quando o framework é usado como dependência em seu projeto, use sempre os comandos prefixados com `framework-reactjs-api-` ou através do `npx`.

### Migration Runner

Para executar migrações:

```bash
npx framework-reactjs-api-migrate
```

### Schema Sync

Para sincronizar o esquema do banco de dados com os modelos:

```bash
npx framework-reactjs-api-sync
```

### Scaffolding de Use Cases

Para criar um novo caso de uso completo:

```bash
npx framework-reactjs-api-scaffold Product
```

Este comando irá:
1. Verificar se existe um `ProductModel.ts` em `src/core/domain/models/`
2. Criar a estrutura completa de arquivos:
   - `src/use-cases/product/repository/ProductRepository.ts` (estende BaseRepository)
   - `src/use-cases/product/ProductBusiness.ts` (regras de negócio)
   - `src/use-cases/product/ProductService.ts` (orquestração)
   - `src/use-cases/product/domains/ProductDom.ts` (interfaces de domínio)
   - `src/use-cases/product/routes/ProductRoutes.ts` (rotas Express com CRUD completo)

Se algum desses arquivos já existir, o script irá pular a criação.

#### Diferença entre Desenvolvimento vs Uso como Dependência

**Desenvolvimento do Framework (para contribuidores):**
```bash
npm run scaffold Product  # Apenas para desenvolvimento interno
```

**Uso como Dependência (para usuários finais):**
```bash
npx framework-reactjs-api-scaffold Product  # Comando correto para projetos
```

#### Arquivo de Rotas Gerado

O scaffolding agora gera automaticamente um arquivo de rotas Express com:

- **GET /api/products** - Listar produtos com paginação (público)
- **GET /api/products/:id** - Buscar produto por ID (público)
- **POST /api/products** - Criar novo produto (protegido - requer JWT)
- **PUT /api/products/:id** - Atualizar produto (protegido - requer JWT)
- **DELETE /api/products/:id** - Excluir produto (protegido - requer JWT)

Todas as rotas incluem:
- Validação de entrada
- Tratamento de erros
- Respostas padronizadas
- Autenticação JWT para operações de escrita
- Documentação JSDoc

#### Exemplo de Uso das Rotas

```typescript
// app.ts - Exemplo de como usar as rotas geradas
import express from 'express';
import productRouter from './src/use-cases/product/routes/ProductRoutes';

const app = express();
app.use(express.json());

// Registrar as rotas do produto
app.use('/api/products', productRouter);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
```

## Padrões de Design

O framework segue os seguintes padrões:

1. **Repository Pattern**: Abstrai a camada de persistência
2. **Service Layer**: Encapsula a lógica de negócio
3. **Domain-Driven Design**: Foco no domínio do problema
4. **Dependency Injection**: Facilita testes e desacoplamento
5. **Model-View-Controller**: Para aplicações web

## Exemplos Completos

### Caso de Uso: Pedido

Exemplo de um caso de uso completo para gerenciar pedidos:

#### Modelo

```typescript
import { BaseModel } from 'framework-reactjs-api';

export class PedidoModel extends BaseModel {
  static tableName = 'pedidos';
  
  clienteId: number;
  data: Date;
  status: 'pendente' | 'aprovado' | 'cancelado';
  valorTotal: number;
  
  constructor(data?: Partial<PedidoModel>) {
    super();
    Object.assign(this, data || {});
    if (!this.data) {
      this.data = new Date();
    }
    if (!this.status) {
      this.status = 'pendente';
    }
  }
}
```

#### Repositório

```typescript
import { BaseRepository } from 'framework-reactjs-api';
import { PedidoModel } from '../../../models/PedidoModel';

export interface IPedidoRepository {
  findById(id: number): Promise<PedidoModel | null>;
  findByClienteId(clienteId: number): Promise<PedidoModel[]>;
  findAll(options?: PaginationOptions): Promise<PedidoModel[]>;
  create(data: Omit<PedidoModel, 'id'>): Promise<PedidoModel>;
  update(id: number, data: Partial<PedidoModel>): Promise<PedidoModel | null>;
  delete(id: number): Promise<boolean>;
}

export class PedidoRepository implements IPedidoRepository {
  private repository: BaseRepository<PedidoModel>;

  constructor() {
    this.repository = new BaseRepository<PedidoModel>(PedidoModel);
  }

  async findById(id: number): Promise<PedidoModel | null> {
    return this.repository.findById(id);
  }

  async findByClienteId(clienteId: number): Promise<PedidoModel[]> {
    return this.repository.findMany({ clienteId });
  }

  async findAll(options?: PaginationOptions): Promise<PedidoModel[]> {
    return this.repository.findAll(options);
  }

  async create(data: Omit<PedidoModel, 'id'>): Promise<PedidoModel> {
    return this.repository.create(data);
  }

  async update(id: number, data: Partial<PedidoModel>): Promise<PedidoModel | null> {
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }
}
```

#### Rotas

O framework também gera automaticamente um arquivo de rotas para cada caso de uso, que implementa endpoints REST completos:

```typescript
import express from 'express';
import { PedidoService } from './PedidoService';
import { AuthMiddleware } from 'framework-reactjs-api';

// Criação do roteador para Pedido
const pedidoRouter = express.Router();
const pedidoService = new PedidoService();

// Middleware de autenticação para rotas protegidas
const authMiddleware = AuthMiddleware.verifyToken;

// Rota para buscar todos os registros (GET /api/pedidos)
pedidoRouter.get('/', async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

  const result = await pedidoService.getAll(page, limit);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(500).json(result);
  }
});

// Outras rotas (GET /:id, POST /, PUT /:id, DELETE /:id)...

export default pedidoRouter;
```

## Troubleshooting

### Resolução de Problemas de Importação

Quando utilizar o framework como dependência, você pode encontrar problemas relacionados à importação de módulos. Aqui estão algumas soluções comuns:

#### Problema: Módulos não encontrados

Se você estiver recebendo erros como `Cannot find module 'framework-reactjs-api/something'`:

```
Erro: Cannot find module 'framework-reactjs-api/core/domain/models'
```

**Solução**: Certifique-se de importar os módulos corretamente usando os pontos de entrada exportados:

```typescript
// Incorreto
import { BaseModel } from 'framework-reactjs-api/core/domain/models';

// Correto
import { BaseModel } from 'framework-reactjs-api';
```

#### Problema: Caminho incorreto para modelos específicos

**Solução**: Ao criar modelos em seu projeto que dependem do framework:

```typescript
// Estrutura de diretórios em seu projeto
// src/
//   └── models/
//       └── ClienteModel.ts

// Em ClienteModel.ts
import { BaseModel } from 'framework-reactjs-api';

export class ClienteModel extends BaseModel {
  // Implementação do modelo
}

// Em outro arquivo que usa ClienteModel
// Certifique-se de usar o caminho relativo correto para seu próprio modelo
import { ClienteModel } from '../models/ClienteModel';
```

#### Problema: Ferramentas CLI não encontradas

Se as ferramentas CLI não estiverem disponíveis:

**Solução**: Verifique se o pacote está instalado corretamente e considere adicionar scripts no package.json:

```json
{
  "scripts": {
    "migrations": "framework-reactjs-api-migrate",
    "schema:sync": "framework-reactjs-api-sync",
    "scaffold": "framework-reactjs-api-scaffold"
  }
}
```

Depois execute com:

```bash
npm run migrations
npm run schema:sync
npm run scaffold Product
```

Ou use diretamente os executáveis do framework:

```bash
npx framework-reactjs-api-migrate
npx framework-reactjs-api-sync  
npx framework-reactjs-api-scaffold Product
```