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
    "paths": {
      "@framework/*": ["./node_modules/framework-reactjs-api/dist/*"]
    }
  }
}
```

## Configuração Inicial

### Banco de Dados

O primeiro passo é configurar a conexão com o banco de dados:

```typescript
// src/config/database.ts
import { CustomORM } from 'framework-reactjs-api';

// Configuração inicial do ORM
export function setupDatabase() {
  CustomORM.configure({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'meu_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'senha123',
    ssl: process.env.DB_SSL === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
  });
  
  console.log('✅ Conexão com banco de dados configurada');
}
```

### Configuração do Framework

```typescript
// src/app.ts
import { setupDatabase } from './config/database';
import { syncSchema } from 'framework-reactjs-api';

async function initialize() {
  // Configurar banco de dados
  setupDatabase();
  
  // Sincronizar esquema do banco (opcional)
  if (process.env.NODE_ENV === 'development') {
    try {
      await syncSchema();
    } catch (error) {
      console.error('Erro ao sincronizar esquema:', error);
    }
  }
}

initialize().catch(console.error);
```

## Estrutura do Framework

O framework segue uma arquitetura DDD (Domain-Driven Design) com os seguintes componentes principais:

```
framework-reactjs-api/
├── core/
│   ├── auth/           # Serviços de autenticação
│   └── domain/         # Modelos de domínio base
│       └── models/     # Definições de entidades
├── infra/
│   ├── cli/            # Ferramentas de linha de comando
│   ├── db/             # Implementação do ORM e gerenciamento de banco
│   └── repository/     # Implementações base de repositórios
└── use-cases/          # Casos de uso organizados por entidade
    ├── user/           # Exemplo: caso de uso de usuário
    └── product/        # Exemplo: caso de uso de produto
```

## Componentes Principais

### BaseModel

Classe base para todos os modelos de domínio:

```typescript
import { BaseModel } from 'framework-reactjs-api';

export class ClienteModel extends BaseModel {
  // Nome da tabela
  static getTableName(): string {
    return 'clientes';
  }

  // Atributos
  id: number = 0;
  nome: string = '';
  email: string = '';
  telefone: string = '';
  dataCadastro: Date = new Date();
  
  // Definição de constraints
  static getConstraints() {
    return {
      id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
      nome: { type: 'VARCHAR', length: 100, notNull: true },
      email: { type: 'VARCHAR', length: 150, unique: true },
      telefone: { type: 'VARCHAR', length: 20 },
      dataCadastro: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    };
  }
  
  // Método requerido para serialização
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      dataCadastro: this.dataCadastro
    };
  }
}

### Repository

Implementação de repositório para acessar dados:

```typescript
import { BaseRepository, PaginationOptions } from 'framework-reactjs-api';
import { ClienteModel } from '../models/ClienteModel';

// Interface do repositório
export interface IClienteRepository {
  findById(id: number): Promise<ClienteModel | null>;
  findByEmail(email: string): Promise<ClienteModel | null>;
  findAll(options?: PaginationOptions): Promise<ClienteModel[]>;
  create(data: Omit<ClienteModel, 'id'>): Promise<ClienteModel>;
  update(id: number, data: Partial<ClienteModel>): Promise<ClienteModel | null>;
  delete(id: number): Promise<boolean>;
}

// Implementação do repositório
export class ClienteRepository implements IClienteRepository {
  private repository: BaseRepository<ClienteModel>;

  constructor() {
    this.repository = new BaseRepository<ClienteModel>(ClienteModel);
  }

  async findById(id: number): Promise<ClienteModel | null> {
    return this.repository.findById(id);
  }

  async findByEmail(email: string): Promise<ClienteModel | null> {
    return this.repository.findOne({ email });
  }

  async findAll(options?: PaginationOptions): Promise<ClienteModel[]> {
    return this.repository.findAll(options);
  }

  async create(data: Omit<ClienteModel, 'id'>): Promise<ClienteModel> {
    return this.repository.create(data);
  }

  async update(id: number, data: Partial<ClienteModel>): Promise<ClienteModel | null> {
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }
}

### Business

Camada de lógica de negócios:

```typescript
import { ClienteModel } from '../models/ClienteModel';
import { IClienteRepository, ClienteRepository } from '../repository/ClienteRepository';

// Interfaces do domínio
export interface ClienteDom {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  dataCadastro: Date;
}

export interface CreateClienteDom {
  nome: string;
  email: string;
  telefone?: string;
}

export interface UpdateClienteDom {
  nome?: string;
  email?: string;
  telefone?: string;
}

// Interface da camada de negócios
export interface IClienteBusiness {
  getById(id: number): Promise<ClienteDom | null>;
  getByEmail(email: string): Promise<ClienteDom | null>;
  getAll(options?: { limit?: number; offset?: number }): Promise<ClienteDom[]>;
  create(data: CreateClienteDom): Promise<ClienteDom>;
  update(id: number, data: UpdateClienteDom): Promise<ClienteDom | null>;
  delete(id: number): Promise<boolean>;
}

// Implementação da camada de negócios
export class ClienteBusiness implements IClienteBusiness {
  private clienteRepository: IClienteRepository;

  constructor(clienteRepository?: IClienteRepository) {
    this.clienteRepository = clienteRepository || new ClienteRepository();
  }

  // Converter modelo para domínio
  private toDomain(model: ClienteModel): ClienteDom {
    return {
      id: model.id,
      nome: model.nome,
      email: model.email,
      telefone: model.telefone,
      dataCadastro: model.dataCadastro
    };
  }

  async getById(id: number): Promise<ClienteDom | null> {
    const cliente = await this.clienteRepository.findById(id);
    return cliente ? this.toDomain(cliente) : null;
  }

  async getByEmail(email: string): Promise<ClienteDom | null> {
    const cliente = await this.clienteRepository.findByEmail(email);
    return cliente ? this.toDomain(cliente) : null;
  }

  async getAll(options?: { limit?: number; offset?: number }): Promise<ClienteDom[]> {
    const clientes = await this.clienteRepository.findAll(options);
    return clientes.map(cliente => this.toDomain(cliente));
  }

  async create(data: CreateClienteDom): Promise<ClienteDom> {
    // Validação de negócios
    if (!data.nome || !data.email) {
      throw new Error('Nome e email são obrigatórios');
    }

    // Verificar se email já existe
    const existingCliente = await this.clienteRepository.findByEmail(data.email);
    if (existingCliente) {
      throw new Error('Email já cadastrado');
    }

    // Criar modelo
    const cliente = new ClienteModel();
    cliente.nome = data.nome;
    cliente.email = data.email;
    cliente.telefone = data.telefone || '';

    // Persistir
    const created = await this.clienteRepository.create(cliente);
    return this.toDomain(created);
  }

  async update(id: number, data: UpdateClienteDom): Promise<ClienteDom | null> {
    // Verificar se cliente existe
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      return null;
    }

    // Validação de email único
    if (data.email && data.email !== cliente.email) {
      const existingCliente = await this.clienteRepository.findByEmail(data.email);
      if (existingCliente) {
        throw new Error('Email já cadastrado');
      }
    }

    // Atualizar modelo
    const updated = await this.clienteRepository.update(id, data);
    return updated ? this.toDomain(updated) : null;
  }

  async delete(id: number): Promise<boolean> {
    return this.clienteRepository.delete(id);
  }
}

### Service

Camada de serviço que implementa a API:

```typescript
import { IClienteBusiness, ClienteBusiness, ClienteDom, CreateClienteDom, UpdateClienteDom } from './ClienteBusiness';

// Interface de resposta do serviço
export interface ServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Interface do serviço
export interface IClienteService {
  getById(id: number): Promise<ServiceResponse<ClienteDom>>;
  getAll(page?: number, limit?: number): Promise<ServiceResponse<{
    items: ClienteDom[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>>;
  create(data: CreateClienteDom): Promise<ServiceResponse<ClienteDom>>;
  update(id: number, data: UpdateClienteDom): Promise<ServiceResponse<ClienteDom>>;
  delete(id: number): Promise<ServiceResponse>;
}

// Implementação do serviço
export class ClienteService implements IClienteService {
  private clienteBusiness: IClienteBusiness;

  constructor(clienteBusiness?: IClienteBusiness) {
    this.clienteBusiness = clienteBusiness || new ClienteBusiness();
  }

  async getById(id: number): Promise<ServiceResponse<ClienteDom>> {
    try {
      const cliente = await this.clienteBusiness.getById(id);
      
      if (!cliente) {
        return {
          success: false,
          message: `Cliente com ID ${id} não encontrado`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        message: 'Cliente encontrado com sucesso',
        data: cliente
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao buscar cliente',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  async getAll(
    page: number = 1,
    limit: number = 10
  ): Promise<ServiceResponse<{
    items: ClienteDom[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    try {
      // Validar parâmetros de paginação
      if (page < 1) page = 1;
      if (limit < 1) limit = 10;
      if (limit > 100) limit = 100;

      const offset = (page - 1) * limit;

      // Buscar dados
      const clientes = await this.clienteBusiness.getAll({
        limit,
        offset
      });

      // Calcular total (em um cenário real, isso seria implementado no repositório)
      const total = clientes.length; // Simplificado para o exemplo
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Clientes listados com sucesso',
        data: {
          items: clientes,
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao listar clientes',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  async create(data: CreateClienteDom): Promise<ServiceResponse<ClienteDom>> {
    try {
      const cliente = await this.clienteBusiness.create(data);
      
      return {
        success: true,
        message: 'Cliente criado com sucesso',
        data: cliente
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao criar cliente',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  async update(id: number, data: UpdateClienteDom): Promise<ServiceResponse<ClienteDom>> {
    try {
      const cliente = await this.clienteBusiness.update(id, data);
      
      if (!cliente) {
        return {
          success: false,
          message: `Cliente com ID ${id} não encontrado`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        message: 'Cliente atualizado com sucesso',
        data: cliente
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao atualizar cliente',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  async delete(id: number): Promise<ServiceResponse> {
    try {
      const deleted = await this.clienteBusiness.delete(id);
      
      if (!deleted) {
        return {
          success: false,
          message: `Cliente com ID ${id} não encontrado`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        message: 'Cliente excluído com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao excluir cliente',
        error: error.message || 'Erro desconhecido'
      };
    }
  }
}

## Troubleshooting

### Problema: Erro ao conectar com o banco de dados

**Solução**: Verifique as configurações de conexão e certifique-se de que o banco de dados está acessível.

```typescript
import { CustomORM } from 'framework-reactjs-api';

// Teste de conexão
async function testDbConnection() {
  try {
    const orm = CustomORM.getInstance();
    await orm.query('SELECT 1');
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
    return false;
  }
}

testDbConnection();
```

### Problema: Entidades não estão sendo sincronizadas

**Solução**: Certifique-se de que os modelos estão implementando corretamente todos os métodos requeridos.

```typescript
// Verificar se o modelo está implementado corretamente
function validateModel(model: any): boolean {
  // Verificar se o modelo estende BaseModel
  const extendsBaseModel = Object.getPrototypeOf(model).name === 'BaseModel';
  
  // Verificar se os métodos estáticos existem
  const hasTableName = typeof model.getTableName === 'function';
  const hasConstraints = typeof model.getConstraints === 'function';
  
  // Verificar se o método de instância existe
  const instance = new model();
  const hasToJSON = typeof instance.toJSON === 'function';
  
  return extendsBaseModel && hasTableName && hasConstraints && hasToJSON;
}
```

### Problema: Erro no scaffolding de casos de uso

**Solução**: Verifique se o modelo referenciado existe e se está corretamente implementado.

```bash
# Verificar se o modelo existe
ls -la src/core/domain/models/ClienteModel.ts

# Se não existir, crie-o primeiro
touch src/core/domain/models/ClienteModel.ts
```

---

Este manual é uma referência completa para o uso do Framework ReactJS API. Para questões adicionais, consulte a documentação ou entre em contato com a equipe de suporte.

## Uso do Framework

### Criação de Modelos

Os modelos são a base do seu domínio. Para criar um novo modelo:

1. Crie uma classe que estende `BaseModel`
2. Implemente o método estático `getTableName()` que retorna o nome da tabela
3. Implemente o método estático `getConstraints()` que define a estrutura da tabela
4. Implemente o método `toJSON()` para serialização

Exemplo:

```typescript
import { BaseModel } from 'framework-reactjs-api';

export class ProdutoModel extends BaseModel {
  static getTableName(): string {
    return 'produtos';
  }

  id: number = 0;
  nome: string = '';
  preco: number = 0;
  descricao: string = '';
  estoque: number = 0;
  categoriaId: number = 0;

  static getConstraints() {
    return {
      id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
      nome: { type: 'VARCHAR', length: 100, notNull: true },
      preco: { type: 'DECIMAL', precision: 10, scale: 2, notNull: true },
      descricao: { type: 'TEXT' },
      estoque: { type: 'INTEGER', default: 0 },
      categoriaId: { type: 'INTEGER', references: { table: 'categorias', column: 'id' } }
    };
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      preco: this.preco,
      descricao: this.descricao,
      estoque: this.estoque,
      categoriaId: this.categoriaId
    };
  }
}

### Implementação de Repositórios

Para criar um repositório personalizado:

1. Defina uma interface para o repositório
2. Crie uma classe que implementa essa interface
3. Utilize o `BaseRepository` internamente

### Desenvolvimento de Casos de Uso

Para implementar um novo caso de uso:

1. Crie um diretório para o caso de uso dentro de `src/use-cases`
2. Use o CLI para scaffold do caso de uso: `npx framework-reactjs-api-scaffold NomeEntidade`
3. Customize as interfaces e implementações conforme necessário

### Autenticação

O framework já fornece um serviço básico de autenticação:

```typescript
import { AuthService } from 'framework-reactjs-api';

const authService = new AuthService();

// Login
const token = await authService.login('usuario@exemplo.com', 'senha123');

// Verificação de token
const userInfo = await authService.verify(token);
```

### Compatibilidade de Decoradores

O framework oferece suporte a diferentes versões do TypeScript, incluindo TypeScript 4.x com decoradores experimentais e TypeScript 5.0+ com a nova sintaxe de decoradores.

> **IMPORTANTE:** Sempre use os parênteses com os decoradores, mesmo no TypeScript 5.0+. A sintaxe `@Id` sem parênteses pode causar erros.

Para TypeScript 4.x:
```typescript
import { BaseModel, Entity, Column, Id } from 'framework-reactjs-api';

@Entity('produtos')
export class ProdutoModel extends BaseModel {
  @Id()
  id: number = 0;
  
  @Column({ type: 'VARCHAR', length: 100 })
  nome: string = '';
}
```

Para TypeScript 5.0+:
```typescript
import { BaseModel, Entity, Column5 as Column, Id5 as Id } from 'framework-reactjs-api';

@Entity('produtos')
export class ProdutoModel extends BaseModel {
  @Id()  // IMPORTANTE: Sempre inclua os parênteses!
  id: number = 0;
  
  @Column({ type: 'VARCHAR', length: 100 })
  nome: string = '';
}
```

Para mais detalhes sobre compatibilidade de decoradores, consulte o arquivo `DECORATORS.md`.

## Ferramentas CLI

O framework fornece três ferramentas de linha de comando:

### 1. Scaffold de Use Cases

Gera automaticamente a estrutura de um novo caso de uso:

```bash
npx framework-reactjs-api-scaffold Cliente
```

Isso criará:
- `src/use-cases/cliente/domains/ClienteDom.ts`
- `src/use-cases/cliente/repository/ClienteRepository.ts`
- `src/use-cases/cliente/ClienteBusiness.ts`
- `src/use-cases/cliente/ClienteService.ts`

### 2. Migrations

Executa migrações SQL para o banco de dados:

```bash
npx framework-reactjs-api-migrate
```

As migrações devem estar em arquivos SQL dentro de `src/infra/migrations` ou na raiz do projeto em uma pasta `migrations`.

### 3. Sincronização de Esquema

Sincroniza automaticamente o esquema do banco de dados com base nos modelos:

```bash
npx framework-reactjs-api-sync
```

## Padrões de Design

O framework utiliza os seguintes padrões:

1. **Repository Pattern**: Abstrai o acesso ao banco de dados
2. **Service Layer**: Orquestra fluxos de aplicação e define contratos de API
3. **Domain-Driven Design**: Organiza o código em torno do domínio do negócio
4. **Clean Architecture**: Separa responsabilidades em camadas
5. **Dependency Injection**: Facilita testes e troca de implementações

## Exemplos Completos

### Exemplo: Sistema de Pedidos

```typescript
// src/models/PedidoModel.ts
import { BaseModel } from 'framework-reactjs-api';

export class PedidoModel extends BaseModel {
  static getTableName(): string {
    return 'pedidos';
  }

  id: number = 0;
  clienteId: number = 0;
  data: Date = new Date();
  status: string = 'pendente';
  valorTotal: number = 0;

  static getConstraints() {
    return {
      id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
      clienteId: { 
        type: 'INTEGER', 
        notNull: true,
        references: { table: 'clientes', column: 'id' }
      },
      data: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      status: { 
        type: 'VARCHAR', 
        length: 20, 
        default: "'pendente'",
        check: "status IN ('pendente', 'processando', 'enviado', 'entregue', 'cancelado')" 
      },
      valorTotal: { type: 'DECIMAL', precision: 10, scale: 2, default: 0 }
    };
  }

  toJSON() {
    return {
      id: this.id,
      clienteId: this.clienteId,
      data: this.data,
      status: this.status,
      valorTotal: this.valorTotal
    };
  }
}

// src/use-cases/pedido/repository/PedidoRepository.ts
import { BaseRepository, PaginationOptions } from 'framework-reactjs-api';
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

Após o scaffolding, edite os arquivos gerados para adicionar a lógica específica do seu domínio.

## Boas Práticas

1. **Respeite as Regras de Camada**: Siga estritamente as regras de dependências entre camadas.
2. **Nomes Consistentes**: Use nomes claros e consistentes (PascalCase para classes, camelCase para métodos/propriedades).
3. **DTOs Explícitos**: Use DTOs para transferência de dados entre camadas.
4. **Validações**: Adicione validações na camada Service e regras de negócio na camada Business.
5. **Migrações Pequenas**: Prefira várias migrações pequenas a uma única migração grande.

## Extensões e Personalizações

O framework foi projetado para ser extensível. Algumas sugestões de personalização:

1. **Integração com Express**: Adicione um diretório `src/presentation/` para controllers e rotas Express.
2. **Autenticação**: Implemente um sistema de autenticação JWT na camada de serviço.
3. **Logging**: Adicione um sistema de logging centralizado.
4. **Testes**: Configure Jest para testes unitários e de integração.
5. **Docker**: Adicione um Dockerfile e docker-compose.yml para facilitar a implantação.

## Limitações Conhecidas

1. O CustomORM é uma abstração simples e não possui todas as funcionalidades de ORMs completos como TypeORM ou Sequelize.
2. A sincronização automática de esquema é útil para desenvolvimento, mas em produção é recomendado usar apenas migrações SQL explícitas.

## Suporte e Contribuições

Para reportar bugs ou sugerir melhorias, por favor, abra uma issue no repositório GitHub.