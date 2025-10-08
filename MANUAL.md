# Framework ReactJS/API com Domain-Driven Design (DDD)

## Visão Geral

Este framework implementa uma estrutura de aplicação TypeScript baseada em Domain-Driven Design (DDD), Clean Architecture e princípios SOLID, para servir como uma camada de data flow/API para aplicações React. A arquitetura foi projetada para garantir alta manutenibilidade e escalabilidade.

## Tecnologias Utilizadas

- **Linguagem**: TypeScript
- **Framework Backend**: Node.js (Express pode ser facilmente integrado)
- **Banco de Dados**: PostgreSQL
- **ORM/Persistence**: Abstração customizada (CustomORM)
- **Autenticação**: JWT (JSON Web Tokens)
- **Segurança**: Bcrypt para hash de senhas

## Estrutura de Diretórios

```
framework-reactjs-api/
├── src/
│   ├── core/                  # Núcleo do Domínio
│   │   ├── domain/
│   │   │   ├── models/        # Modelos/Entidades do Domínio
│   │   │   │   ├── BaseModel.ts
│   │   │   │   ├── UserModel.ts
│   │   │   │   └── ...
│   │   │   └── ...
│   │   ├── auth/              # Autenticação e Segurança
│   │   │   ├── AuthService.ts
│   │   │   └── AuthMiddleware.ts
│   ├── infra/                 # Infraestrutura
│   │   ├── cli/               # Scripts CLI (Automação)
│   │   │   ├── usecase-scaffold.ts
│   │   │   ├── migration-runner.ts
│   │   │   └── schema-sync.ts
│   │   ├── db/                # Banco de Dados
│   │   │   ├── CustomORM.ts
│   │   │   └── query/         # Construtor de Consultas
│   │   │       └── QueryBuilder.ts
│   │   ├── migrations/        # Migrações SQL
│   │   │   └── 20251008000000_initial_schema.sql
│   │   ├── repository/        # Implementações de Repositories
│   │   │   ├── BaseRepository.ts  # Repositório base com CRUD genérico
│   │   │   ├── UserRepository.ts
│   │   │   └── ...
│   │   └── ...
│   ├── use-cases/             # Use Cases do Domínio
│   │   ├── user/              # Use Cases para Usuários
│   │   │   ├── UserService.ts
│   │   │   ├── UserBusiness.ts
│   │   │   └── ...
│   │   └── ...
│   └── index.ts
├── package.json
├── tsconfig.json
└── MANUAL.md                  # Este arquivo
```

## Arquitetura e Camadas (Strict DDD)

A arquitetura segue o padrão estrito de DDD com 4 camadas bem definidas:

### 1. Router (Presentation Layer)

**Responsabilidade**: Receber requisições HTTP (ou comandos de UI no contexto React), validar dados de entrada e orquestrar a execução.

**Regra**: Rotas SÓ PODEM chamar componentes da camada Services.

**Exemplo de implementação** (não incluído no framework base, mas pode ser facilmente adicionado com Express):

```typescript
// src/routes/UserRoutes.ts
import { Router } from 'express';
import { UserService } from '../use-cases/user/UserService';

const router = Router();
const userService = new UserService();

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await userService.getUserById(id);
  return res.status(result.success ? 200 : 404).json(result);
});

// Outras rotas...

export default router;
```

### 2. Services (Application Layer)

**Responsabilidade**: Orquestrar o fluxo de aplicação, gerenciar transações e segurança, e delegar a lógica de domínio.

**Regra**: Services SÓ PODEM chamar outros Services ou componentes da camada Business.

**Exemplo**: [UserService.ts](src/use-cases/user/UserService.ts)

### 3. Business (Domain Layer)

**Responsabilidade**: Conter toda a lógica de negócio (Regras de Domínio). Aqui residem os Use Cases.

**Regra**: Business SÓ PODEM chamar outros Business ou componentes da camada Repository.

**Exemplo**: [UserBusiness.ts](src/use-cases/user/UserBusiness.ts)

### 4. Repository (Infrastructure Layer)

**Responsabilidade**: Abstrair a lógica de persistência de dados (CRUD, consultas diretas ao DB).

**Regra**: Repositories SÓ PODEM chamar outros Repositories (para compor dados de diferentes fontes) ou o driver de banco de dados (CustomORM).

**Exemplo**: [UserRepository.ts](src/infra/repository/UserRepository.ts) extendendo [BaseRepository.ts](src/infra/repository/BaseRepository.ts)

## Sistemas de Autenticação JWT

O framework inclui uma implementação completa de autenticação com JWT:

### AuthService

Classe responsável pela geração e validação de tokens JWT, além de manipulação de senhas:

```typescript
import { AuthService } from './core/auth/AuthService';

// Criar instância do serviço de autenticação
const authService = new AuthService();

// Hash de senha
const hashedPassword = await authService.hashPassword('senha123');

// Validar senha
const isValid = await authService.comparePassword('senha123', hashedPassword);

// Gerar token JWT
const token = authService.generateToken({ 
  id: 1, 
  email: 'usuario@exemplo.com',
  roles: ['admin', 'editor'] 
}, { expiresIn: '7d' });

// Verificar token
const verification = authService.verifyToken(token);
if (verification.valid) {
  const userId = verification.payload?.id;
  // Prosseguir com operações autorizadas...
}
```

### AuthMiddleware

Middleware para Express que protege rotas, verificando a autenticação e autorização:

```typescript
import { AuthMiddleware } from './core/auth/AuthMiddleware';

// Criar instância do middleware de autenticação
const authMiddleware = new AuthMiddleware();

// Proteger rota com autenticação
app.get('/api/profile', 
  authMiddleware.authenticate(), 
  (req, res) => {
    // req.user contém os dados do usuário autenticado
    const userId = req.user.id;
    // ...
  }
);

// Verificar funções/permissões
app.get('/api/admin', 
  authMiddleware.authenticate(),
  authMiddleware.hasRole(['admin']), 
  (req, res) => {
    // Somente usuários com função "admin" podem acessar
    // ...
  }
);
```

## BaseRepository com CRUD Genérico

O framework fornece uma classe base para repositórios com operações CRUD padrão:

```typescript
// Exemplo de repositório que estende BaseRepository
export class ProductRepository extends BaseRepository<ProductModel> {
  constructor() {
    super(ProductModel);
  }
  
  protected mapToModel(data: any): ProductModel {
    const product = new ProductModel();
    product.id = data.id;
    product.name = data.name;
    product.price = data.price;
    return product;
  }
  
  // Métodos específicos podem ser adicionados aqui
  async findByPriceRange(min: number, max: number): Promise<ProductModel[]> {
    return this.findBy({ 
      price: { operator: '>=', value: min },
      price2: { operator: '<=', value: max }
    });
  }
}

// Uso:
const productRepo = new ProductRepository();
const product = await productRepo.findById(123);
const products = await productRepo.findAll({ limit: 10, orderBy: 'name ASC' });
const newProduct = await productRepo.create({ name: 'Novo Produto', price: 99.90 });
```

## QueryBuilder para SQL Dinâmico

O `QueryBuilder` permite construir consultas SQL complexas com uma API fluente:

```typescript
import { QueryBuilder, Operator } from './infra/db/query/QueryBuilder';

// Construir uma consulta complexa
const query = QueryBuilder.from('products', 'p')
  .select('p.id', 'p.name', 'p.price', 'c.name as category_name')
  .leftJoin('categories', 'c', 'p.category_id = c.id')
  .where('p.active', Operator.EQUALS, true)
  .where('p.price', Operator.GREATER_THAN, 50)
  .whereLike('p.name', '%smartphone%')
  .orderBy('p.created_at', 'DESC')
  .limit(20)
  .offset(40)
  .build();

// Resultado:
// {
//   sql: 'SELECT p.id, p.name, p.price, c.name as category_name FROM products AS p LEFT JOIN categories AS c ON p.category_id = c.id WHERE p.active = $1 AND p.price > $2 AND p.name LIKE $3 ORDER BY p.created_at DESC LIMIT 20 OFFSET 40',
//   params: [true, 50, '%smartphone%']
// }

// Para consultas INSERT/UPDATE
const insertQuery = QueryBuilder.buildInsert(
  'products',
  { name: 'Novo Produto', price: 199.99, active: true },
  ['id'] // Campos a retornar (RETURNING)
);

const updateQuery = QueryBuilder.buildUpdate(
  'products',
  { price: 149.99, updated_at: new Date() },
  { id: 123 }, // Condição WHERE
  ['id', 'price', 'updated_at'] // Campos a retornar
);
```

## Modelagem de Dados com Decoradores

O framework implementa um sistema de decoradores para a definição de modelos (Entidades), simulando a funcionalidade de um ORM leve:

### Decoradores Disponíveis

- `@Entity(tableName: string)`: Define a classe como uma tabela do banco de dados
- `@Column(options?: { type: string, primaryKey?: boolean, nullable?: boolean, default?: any, length?: number })`: Define uma propriedade como coluna
- `@Id()`: Alias para @Column({ primaryKey: true, type: 'SERIAL' })
- `@UniqueIndex(indexName: string, columns: string[])`: Define um índice único
- `@BusinessIndex(indexName: string, columns: string[], type: 'INDEX' | 'FULLTEXT')`: Define índices de negócio não-únicos

### Exemplo de Modelo

```typescript
@Entity('users')
@UniqueIndex('idx_users_email', ['email'])
@BusinessIndex('idx_users_name', ['first_name', 'last_name'], 'INDEX')
export class UserModel extends BaseModel {
  @Id()
  id!: number;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 100
  })
  first_name!: string;

  // Outras propriedades...
}
```

## Ferramentas CLI e Automação

### 1. Scaffolding de Use Cases

O framework inclui um script para gerar automaticamente a estrutura de um novo Use Case:

```bash
npm run usecases:dev <NomeDoModelo>
```

Exemplo:

```bash
npm run usecases:dev Product
```

Este comando irá:
1. Verificar se existe um `ProductModel.ts` em `src/core/domain/models/`
2. Criar a estrutura de arquivos:
   - `src/use-cases/product/ProductBusiness.ts`
   - `src/use-cases/product/ProductService.ts`
   - `src/infra/repository/ProductRepository.ts`

Se algum desses arquivos já existir, o script irá pular a criação.

### 2. Migrações de Banco de Dados

O framework gerencia migrações de banco de dados com dois mecanismos:

#### Sincronização de Esquema

```bash
npm run build
```

Este comando:
1. Compila o projeto TypeScript
2. Executa a sincronização de esquema baseada nos modelos decorados com `@Entity`
3. Executa todas as migrações pendentes

#### Migrações SQL Manuais

```bash
npm run migration:dev
```

Este comando:
1. Lê todos os arquivos SQL em `src/infra/migrations/`
2. Verifica quais não foram executados (usando a tabela `schema_migrations`)
3. Executa os scripts pendentes em ordem cronológica
4. Registra cada migração executada na tabela `schema_migrations`

### 3. Visualização do Manual

Para visualizar este manual no console:

```bash
npm run docs:manual
```

## Configuração Inicial

### 1. Instalação de Dependências

```bash
npm install
```

### 2. Configuração do Banco de Dados

Crie um arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=seu_banco_de_dados
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

### 3. Compilação e Sincronização

```bash
npm run build
```

## Criando Novos Modelos e Use Cases

### 1. Criar um Modelo (Entidade)

Primeiro, crie um novo modelo em `src/core/domain/models/`:

```typescript
// src/core/domain/models/ProductModel.ts
import { BaseModel, Entity, Column, Id } from './BaseModel';

@Entity('products')
export class ProductModel extends BaseModel {
  @Id()
  id!: number;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 100
  })
  name!: string;

  @Column({
    type: 'TEXT',
    nullable: true
  })
  description?: string;

  @Column({
    type: 'INT',
    nullable: false,
    default: 0
  })
  stock!: number;

  @Column({
    type: 'TIMESTAMP',
    nullable: false,
    default: 'CURRENT_TIMESTAMP'
  })
  created_at!: Date;
}
```

### 2. Gerar Use Case Completo

```bash
npm run usecases:dev Product
```

### 3. Personalizar a Lógica de Negócio

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