# Framework ReactJS API

Framework base para camada de data flow/API de projetos React com DDD, Clean Architecture e SOLID. Pronto para ser usado como dependência em outros projetos.

## Instalação

```bash
npm install framework-reactjs-api
```

## Distribuição e Instalação

Este framework está preparado para ser distribuído como um pacote NPM:

- ✅ **Sem Build Automático**: O framework não executa `npm run build` durante a instalação
- ✅ **Código Pré-compilado**: Inclui pasta `dist/` com código JavaScript compilado
- ✅ **CLIs Funcionais**: Scripts executáveis em `bin/` com permissões corretas
- ✅ **Otimização de Tamanho**: Exclui código fonte TypeScript do pacote final
- ✅ **Documentação Completa**: Inclui README, MANUAL e exemplos

### Para Desenvolvedores do Framework

```bash
# Build local (desenvolvimento)
npm run build

# Publicação (executa build automaticamente)
npm publish
```

### Para Usuários do Framework

Simplesmente instale e use - não é necessário compilar:

```bash
npm install framework-reactjs-api
# Pronto para usar!
```

## Configuração Rápida

Para adicionar o framework ao seu projeto:

1. **Instalação**

```bash
npm install framework-reactjs-api --save
```

2. **Configuração do TypeScript** (tsconfig.json)

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/models/*": ["core/domain/models/*"],
      "@/repositories/*": ["core/domain/repositories/*"],
      "@/services/*": ["core/application/services/*"]
    }
  }
}
```

> **Importante**: A configuração de `paths` permite usar imports limpos como `import { Model } from '@/models/Model'` em vez de caminhos relativos longos.

3. **Usando os Componentes do Framework**

```typescript
// Importando componentes principais
import { 
  BaseModel, 
  BaseRepository, 
  CustomORM, 
  AuthService 
} from 'framework-reactjs-api';

// Importando seus modelos (usando path alias)
import { ProdutoModel } from '@/models/ProdutoModel';

// Criando seu próprio modelo
export class ProdutoModel extends BaseModel {
  static tableName = 'produtos';
  nome: string;
  preco: number;
}
```

4. **Ferramentas CLI**

```bash
# Executar migrações
npx framework-reactjs-api-migrate

# Sincronizar esquema do banco de dados
npx framework-reactjs-api-sync

# Criar scaffold de um caso de uso completo
# (Gera: Repository, Service, Business, Domain e Routes)
npx framework-reactjs-api-scaffold Usuario
```

## ⚡ Novidades (Outubro 2025)

### ✅ Imports com Path Aliases
Todos os repositórios agora usam imports limpos:
```typescript
import { ClienteModel } from '@/models/ClienteModel'; // ✅ Novo
// Em vez de: '../../../core/domain/models/ClienteModel'
```

### ✅ Services com Respostas Padronizadas
Services agora retornam `{status, data, message}`:
```typescript
const result = await service.findAll({
  conditions: { status: 'ativo' },
  limit: 10,
  includes: ['pedidos']
});
// result = { status: 200, data: [...], message: '...' }
```

### ✅ Routes Simplificadas
Routes chamam direto os services e usam o status retornado:
```typescript
router.get('/', async (req, res) => {
  const result = await service.findAll({ ...req.query });
  return res.status(result.status).json(result);
});
```

📖 **Detalhes**: Veja [ALTERACOES.md](./ALTERACOES.md) para mais informações.

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
    │   ├── routes/             # Rotas para API REST
    │   ├── ProductBusiness.ts  # Lógica de negócios
    │   └── ProductService.ts   # Camada de serviço
    └── user/
        ├── domains/            # Interfaces de domínio
        ├── repository/         # Repositório específico
        ├── routes/             # Rotas para API REST
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
### 4. Utilizando as Ferramentas CLI

O framework inclui ferramentas de linha de comando que podem ser executadas diretamente:

#### Criar novos casos de uso (scaffolding):

```bash
npx framework-reactjs-api-scaffold NomeEntidade
```

#### Executar migrações de banco de dados:

```bash
npx framework-reactjs-api-migrate
```

#### Sincronizar esquema do banco com modelos:

```bash
npx framework-reactjs-api-sync
```

## Solucionando Problemas de Importação

Quando usar o framework como dependência em outro projeto, use os seguintes padrões de importação:

```typescript
// ✅ Correto: Importar componentes do ponto de entrada principal
import { BaseModel, BaseRepository, CustomORM } from 'framework-reactjs-api';

// ❌ Incorreto: Não tente acessar diretamente arquivos internos
// import { BaseModel } from 'framework-reactjs-api/core/domain/models/BaseModel';
```

Para mais detalhes sobre resolução de problemas de importação, consulte a [seção de troubleshooting](./MANUAL.md#resolução-de-problemas-de-importação) no MANUAL.md.

#### Sincronizar esquema do banco de dados:

```bash
npx framework-reactjs-api-sync
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

# Gerar novo use case (desenvolvimento do framework)
npm run scaffold <NomeDoModelo>

# Para usuários finais, use:
# npx framework-reactjs-api-scaffold <NomeDoModelo>

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