# Exemplo de Uso do Framework como Dependência

Este é um exemplo básico de como usar o framework ReactJS API como uma dependência em seu projeto.

## Instalação

```bash
# Criar novo projeto
mkdir meu-projeto
cd meu-projeto
npm init -y

# Instalar framework e dependências
npm install framework-reactjs-api typescript ts-node dotenv

# Inicializar projeto TypeScript
npx tsc --init
```

## Configuração

1. Configure o arquivo `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "./dist"
  }
}
```

2. Crie um arquivo `.env` na raiz do projeto:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=senha123
DB_DATABASE=meu_projeto
```

3. Crie a estrutura básica do projeto:

```
meu-projeto/
├── src/
│   ├── models/
│   │   └── ProdutoModel.ts
│   ├── use-cases/
│   │   └── produto/
│   └── index.ts
├── .env
├── package.json
└── tsconfig.json
```

## Criando um Modelo

Arquivo `src/models/ProdutoModel.ts`:

```typescript
import { BaseModel } from 'framework-reactjs-api';

export class ProdutoModel extends BaseModel {
  static tableName = 'produtos';
  
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  
  constructor(data?: Partial<ProdutoModel>) {
    super();
    Object.assign(this, data || {});
  }
  
  // Método para serializar para JSON
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      preco: this.preco,
      estoque: this.estoque
    };
  }
}
```

## Criando um Ponto de Entrada

Arquivo `src/index.ts`:

```typescript
import { CustomORM } from 'framework-reactjs-api';
import { ProdutoModel } from './models/ProdutoModel';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function main() {
  console.log('Inicializando aplicação...');
  
  try {
    // Obter instância do ORM
    const orm = CustomORM.getInstance();
    
    // Registrar modelo
    orm.registerModel(ProdutoModel);
    
    // Sincronizar esquema do banco de dados
    await orm.syncSchema();
    
    console.log('Banco de dados sincronizado!');
    
    // Criar um novo produto
    const novoProduto = new ProdutoModel({
      nome: 'Produto de Teste',
      descricao: 'Este é um produto de teste',
      preco: 29.99,
      estoque: 10
    });
    
    const produtoSalvo = await orm.create<ProdutoModel>('produtos', novoProduto);
    console.log('Produto criado:', produtoSalvo);
    
    // Buscar todos os produtos
    const produtos = await orm.findAll<ProdutoModel>('produtos');
    console.log('Produtos encontrados:', produtos.length);
    
    // Finalizar
    console.log('Processo finalizado com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Executar aplicação
main().catch(console.error);
```

## Utilizando Scaffold de Caso de Uso

Para criar automaticamente um caso de uso completo:

```bash
# Executar scaffold para o modelo Produto
npx framework-reactjs-api-scaffold Produto
```

Isso criará a estrutura completa:

```
meu-projeto/
└── src/
    └── use-cases/
        └── produto/
            ├── domains/
            │   └── ProdutoDom.ts
            ├── repository/
            │   └── ProdutoRepository.ts
            ├── ProdutoBusiness.ts
            └── ProdutoService.ts
```

## Executando a Aplicação

```bash
# Compilar
npx tsc

# Executar
node dist/index.js
```

## Executando Migrações

Para criar e executar migrações:

```bash
# Criar um arquivo de migração manualmente
mkdir -p migrations
echo "CREATE TABLE IF NOT EXISTS produtos (id SERIAL PRIMARY KEY, nome VARCHAR(100), descricao TEXT, preco DECIMAL, estoque INT);" > migrations/001_create_produtos_table.sql

# Executar migrações
npx framework-reactjs-api-migrate
```