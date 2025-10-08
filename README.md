# Framework ReactJS API

Framework base para camada de data flow/API de projetos React com DDD, Clean Architecture e SOLID. Pronto para ser usado como dependência em outros projetos.

## Instalação

```bash
npm install framework-reactjs-api
```

## Visão Geral

O framework é estruturado em quatro camadas principais:

1. **Router** (Presentation Layer): Recebe requisições e delega para Services
2. **Services** (Application Layer): Orquestra fluxos e delega para Business
3. **Business** (Domain Layer): Implementa regras de negócio e usa Repositories
4. **Repository** (Infrastructure Layer): Abstrai o acesso a dados, organizado dentro de cada caso de uso

## Características Principais

- Arquitetura DDD estrita com separação clara de responsabilidades
- ORM customizado leve com decoradores TypeScript
- Sistema de migrações e sincronização automática de esquema
- Scaffolding de Use Cases via CLI
- Compatibilidade total com TypeScript e React
- Repositories organizados dentro dos próprios casos de uso para maior coesão
- Interfaces de domínio (Dom) para cada caso de uso

## Estrutura do Framework

```
src/
├── core/
│   ├── auth/                   # Serviços de autenticação
│   └── domain/                 # Modelos base de domínio
├── infra/
│   ├── cli/                    # Ferramentas CLI (migrações, scaffold)
│   ├── db/                     # Camada de banco de dados e ORM
│   └── repository/             # Base de repositórios
└── use-cases/                  # Casos de uso do sistema
    ├── product/
    │   ├── domains/            # Interfaces de domínio
    │   ├── repository/         # Repositório específico
    │   ├── ProductBusiness.ts  # Lógica de negócios
    │   └── ProductService.ts   # Camada de serviço
    └── user/
        ├── domains/            # Interfaces de domínio
        ├── repository/         # Repositório específico
        ├── UserBusiness.ts     # Lógica de negócios
        └── UserService.ts      # Camada de serviço
```

## Como Usar

### 1. Configuração Inicial

```typescript
import { CustomORM } from 'framework-reactjs-api';

// Configuração da conexão com o banco de dados
CustomORM.configure({
  host: 'localhost',
  port: 5432,
  database: 'meu_app',
  user: 'postgres',
  password: 'senha123'
});
```

### 2. Usando Modelos e Repositórios

```typescript
import { UserRepository, UserModel } from 'framework-reactjs-api';

// Usando o repositório
const userRepo = new UserRepository();
const users = await userRepo.findAll();
```

### 3. Usando Casos de Uso

```typescript
import { UserService } from 'framework-reactjs-api';

const userService = new UserService();
const result = await userService.getAllUsers(1, 10);

if (result.success) {
  console.log(result.data.users);
}
```
### 4. Criando Novos Casos de Uso

Utilize o CLI integrado para criar novos casos de uso:

```bash
npx framework-reactjs-api scaffold NomeEntidade
```

## Extensão do Framework

Para estender o framework para seu próprio projeto:

1. Crie novos modelos de domínio estendendo `BaseModel`
2. Crie novos repositórios estendendo `BaseRepository`
3. Organize seus casos de uso seguindo a estrutura de pastas recomendada:
   - `/domains` para interfaces de domínio
   - `/repository` para repositórios específicos
   - `EntityBusiness.ts` para lógica de negócios
   - `EntityService.ts` para camada de serviço

## Desenvolvimento

```bash
# Instalação de dependências para desenvolvimento
npm install

# Compilação 
npm run build

# Gerar novo use case
npm run scaffold <NomeDoModelo>

# Executar migrações
npm run migration:run

# Sincronização do esquema
npm run schema:sync

# Visualizar manual de uso
npm run docs:manual
```

## Documentação

Consulte [MANUAL.md](MANUAL.md) para documentação completa sobre a instalação, uso e arquitetura do framework.

## Tecnologias

- TypeScript
- Node.js
- PostgreSQL
- Reflect Metadata (decoradores)

## Licença

MIT