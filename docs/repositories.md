# Repositórios no Framework ReactJS/API

Este documento explica como utilizar o sistema de repositórios abstraídos no framework, que implementa o padrão Repository para acesso a dados.

## Estrutura de Repositórios

O framework implementa uma abstração robusta de repositórios com as seguintes características:

- **BaseRepository**: Implementa todas as operações CRUD e paginação
- **Repositórios específicos**: Herdam do BaseRepository e adicionam métodos específicos
- **Mapeamento automático**: Conversão entre dados do banco e modelos de domínio
- **Paginação integrada**: Suporte para paginação com metadados de navegação

## Usando o BaseRepository

### Operações CRUD Herdadas

Todos os repositórios que estendem `BaseRepository` herdam automaticamente os seguintes métodos:

```typescript
// Busca por ID
findById(id: ID): Promise<T | null>;

// Listar todos
findAll(options?: PaginationOptions): Promise<T[]>;

// Listar todos com paginação
findAllPaginated(options?: PaginationOptions): Promise<PaginatedResult<T>>;

// Buscar por condições
findBy(conditions: Record<string, any>, options?: PaginationOptions): Promise<T[]>;

// Buscar por condições com paginação
findByPaginated(conditions: Record<string, any>, options?: PaginationOptions): Promise<PaginatedResult<T>>;

// Buscar um único registro por condições
findOneBy(conditions: Record<string, any>): Promise<T | null>;

// Criar novo registro
create(entity: Omit<T, 'id'>): Promise<T>;

// Atualizar registro existente
update(id: ID, entity: Partial<T>): Promise<T | null>;

// Excluir registro
delete(id: ID): Promise<boolean>;

// Contar registros
count(conditions?: Record<string, any>): Promise<number>;

// Verificar se existe
exists(conditions: Record<string, any>): Promise<boolean>;
```

### Paginação

Os métodos `findAllPaginated` e `findByPaginated` retornam resultados paginados com a seguinte estrutura:

```typescript
{
  data: T[],           // Dados da página atual
  pagination: {
    total: number,     // Total de registros
    page: number,      // Página atual
    limit: number,     // Limite por página
    totalPages: number, // Total de páginas
    hasNextPage: boolean,  // Se existe próxima página
    hasPreviousPage: boolean // Se existe página anterior
  }
}
```

Para usar a paginação:

```typescript
const options: PaginationOptions = {
  page: 2,       // Página desejada (começa em 1)
  limit: 10,     // Registros por página
  orderBy: 'created_at DESC'  // Ordenação
};

const result = await userRepository.findAllPaginated(options);
```

## Criando um Novo Repositório

Para criar um novo repositório, basta estender o `BaseRepository` e implementar apenas os métodos específicos:

```typescript
// 1. Defina a interface do repositório
export interface IProductRepository extends IRepository<ProductModel> {
  findByCategory(categoryId: number): Promise<ProductModel[]>;
}

// 2. Implemente a classe que estende BaseRepository
export class ProductRepository extends BaseRepository<ProductModel> implements IProductRepository {
  constructor() {
    super(ProductModel);
  }
  
  // Implemente apenas os métodos específicos
  async findByCategory(categoryId: number): Promise<ProductModel[]> {
    return this.findBy({ category_id: categoryId });
  }
  
  // Os métodos CRUD já estão herdados e funcionais!
}
```

## Uso em Serviços e Business

Nos serviços ou classes de negócio, injete o repositório e use seus métodos:

```typescript
export class ProductService {
  constructor(private productRepository: IProductRepository) {}
  
  async getProductById(id: number): Promise<ProductModel | null> {
    // Usa método herdado do BaseRepository
    return this.productRepository.findById(id);
  }
  
  async listProducts(page: number = 1, limit: number = 10): Promise<PaginatedResult<ProductModel>> {
    // Usa método de paginação herdado do BaseRepository
    return this.productRepository.findAllPaginated({ page, limit });
  }
}
```

## Mapeamento de Modelos

O BaseRepository implementa um `mapToModel` padrão que mapeia automaticamente os campos do banco de dados para o modelo. No entanto, você pode sobrescrever este método em repositórios específicos se precisar de um mapeamento personalizado.

## Transações

Use o método `executeInTransaction` para executar operações dentro de uma transação:

```typescript
await userRepository.executeInTransaction(async () => {
  // Todas essas operações serão executadas em uma transação
  const user = await userRepository.create({ ... });
  await profileRepository.create({ userId: user.id, ... });
});
```

O método faz commit automaticamente se tudo correr bem, ou rollback em caso de erro.