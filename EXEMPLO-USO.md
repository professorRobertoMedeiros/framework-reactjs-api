# Exemplo de Uso do Framework (Atualizado)

Este exemplo demonstra como usar o framework após as alterações de outubro/2025.

## 1. Estrutura do Projeto

```
meu-projeto/
├── src/
│   ├── core/
│   │   └── domain/
│   │       └── models/
│   │           └── ClienteModel.ts
│   └── use-cases/
│       └── cliente/
│           ├── repository/
│           │   └── ClienteRepository.ts
│           ├── domains/
│           │   └── ClienteDom.ts
│           ├── ClienteService.ts
│           └── routes/
│               └── ClienteRoutes.ts
├── tsconfig.json
└── package.json
```

## 2. Configuração do tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/models/*": ["core/domain/models/*"],
      "@/repositories/*": ["use-cases/*/repository"],
      "@/services/*": ["use-cases/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 3. Modelo (ClienteModel.ts)

```typescript
import { BaseModel, Entity, Column, Id } from 'framework-reactjs-api';

@Entity('clientes')
export class ClienteModel extends BaseModel {
  @Id()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  nome!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone?: string;

  @Column({ type: 'boolean', default: true })
  ativo?: boolean;

  @Column({ type: 'timestamp', default: 'CURRENT_TIMESTAMP' })
  created_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at?: Date;
}
```

## 4. Gerando o Scaffold

```bash
cd meu-projeto
npx framework-reactjs-api-scaffold Cliente
```

Isso irá gerar automaticamente todos os arquivos abaixo.

## 5. Repository Gerado (ClienteRepository.ts)

```typescript
import { BaseRepository } from 'framework-reactjs-api';
import { ClienteModel } from '@/models/ClienteModel'; // ✅ Import com path alias

/**
 * Repositório para Cliente
 * Estende BaseRepository para operações CRUD básicas
 */
export class ClienteRepository extends BaseRepository<ClienteModel> {
  constructor() {
    super(ClienteModel);
  }

  /**
   * Mapear dados do banco para o modelo Cliente
   */
  protected mapToModel(data: any): ClienteModel {
    const item = new ClienteModel();
    Object.assign(item, data);
    return item;
  }

  /**
   * Buscar por condições customizadas
   */
  async findByConditions(
    conditions: Record<string, any>,
    options?: { limit?: number; offset?: number; includes?: string[]; orderBy?: string }
  ): Promise<ClienteModel[]> {
    return this.findBy(conditions, options);
  }
}
```

## 6. Service Gerado (ClienteService.ts)

```typescript
import { ClienteRepository } from './repository/ClienteRepository';
import { ClienteModel } from '@/models/ClienteModel';

export interface ServiceResponse<T = any> {
  status: number;
  data?: T;
  message?: string;
}

export interface QueryOptions {
  conditions?: Record<string, any>;
  includes?: string[];
  limit?: number;
  offset?: number;
  orderBy?: string;
}

/**
 * Service para Cliente
 */
export class ClienteService {
  private repository: ClienteRepository;

  constructor() {
    this.repository = new ClienteRepository();
  }

  /**
   * Buscar todos os registros com filtros
   */
  async findAll(options?: QueryOptions): Promise<ServiceResponse<ClienteModel[]>> {
    try {
      const data = await this.repository.findByConditions(
        options?.conditions || {},
        {
          limit: options?.limit,
          offset: options?.offset,
          includes: options?.includes,
          orderBy: options?.orderBy,
        }
      );

      return {
        status: 200,
        data,
        message: 'Registros recuperados com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao buscar registros',
      };
    }
  }

  /**
   * Buscar registro por ID
   */
  async findById(id: number, includes?: string[]): Promise<ServiceResponse<ClienteModel>> {
    try {
      const data = await this.repository.findById(id, includes);

      if (!data) {
        return {
          status: 404,
          message: 'Registro não encontrado',
        };
      }

      return {
        status: 200,
        data,
        message: 'Registro recuperado com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao buscar registro',
      };
    }
  }

  /**
   * Criar novo registro
   */
  async create(data: Partial<ClienteModel>): Promise<ServiceResponse<ClienteModel>> {
    try {
      const created = await this.repository.create(data);

      return {
        status: 201,
        data: created,
        message: 'Registro criado com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao criar registro',
      };
    }
  }

  /**
   * Atualizar registro existente
   */
  async update(id: number, data: Partial<ClienteModel>): Promise<ServiceResponse<ClienteModel>> {
    try {
      const updated = await this.repository.update(id, data);

      if (!updated) {
        return {
          status: 404,
          message: 'Registro não encontrado',
        };
      }

      return {
        status: 200,
        data: updated,
        message: 'Registro atualizado com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao atualizar registro',
      };
    }
  }

  /**
   * Deletar registro
   */
  async delete(id: number): Promise<ServiceResponse<boolean>> {
    try {
      const deleted = await this.repository.delete(id);

      if (!deleted) {
        return {
          status: 404,
          message: 'Registro não encontrado',
        };
      }

      return {
        status: 200,
        data: true,
        message: 'Registro deletado com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao deletar registro',
      };
    }
  }

  /**
   * Contar registros com filtros
   */
  async count(conditions?: Record<string, any>): Promise<ServiceResponse<number>> {
    try {
      const count = await this.repository.count(conditions || {});

      return {
        status: 200,
        data: count,
        message: 'Contagem realizada com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao contar registros',
      };
    }
  }
}
```

## 7. Routes Geradas (ClienteRoutes.ts)

```typescript
import { Router, Request, Response } from 'express';
import { ClienteService } from '../ClienteService';

const router = Router();
const service = new ClienteService();

/**
 * GET /cliente
 * Listar todos os registros
 */
router.get('/', async (req: Request, res: Response) => {
  const { limit, offset, orderBy, ...conditions } = req.query;
  
  const result = await service.findAll({
    conditions: Object.keys(conditions).length > 0 ? conditions as Record<string, any> : undefined,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
    orderBy: orderBy as string,
    includes: req.query.includes ? String(req.query.includes).split(',') : undefined,
  });

  return res.status(result.status).json(result);
});

/**
 * GET /cliente/:id
 * Buscar registro por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const includes = req.query.includes ? String(req.query.includes).split(',') : undefined;
  
  const result = await service.findById(id, includes);
  
  return res.status(result.status).json(result);
});

/**
 * POST /cliente
 * Criar novo registro
 */
router.post('/', async (req: Request, res: Response) => {
  const result = await service.create(req.body);
  
  return res.status(result.status).json(result);
});

/**
 * PUT /cliente/:id
 * Atualizar registro existente
 */
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  const result = await service.update(id, req.body);
  
  return res.status(result.status).json(result);
});

/**
 * DELETE /cliente/:id
 * Deletar registro
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  const result = await service.delete(id);
  
  return res.status(result.status).json(result);
});

/**
 * GET /cliente/count
 * Contar registros
 */
router.get('/count', async (req: Request, res: Response) => {
  const result = await service.count(req.query as Record<string, any>);
  
  return res.status(result.status).json(result);
});

export default router;
```

## 8. Registrando as Rotas no App (app.ts ou index.ts)

```typescript
import express from 'express';
import clienteRouter from './use-cases/cliente/routes/ClienteRoutes';

const app = express();

// Middlewares
app.use(express.json());

// Registrar rotas
app.use('/api/cliente', clienteRouter);

// Iniciar servidor
app.listen(3000, () => {
  console.log('🚀 Servidor rodando na porta 3000');
});

export default app;
```

## 9. Exemplos de Requisições

### Listar todos os clientes
```bash
GET http://localhost:3000/api/cliente
```

**Resposta:**
```json
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@example.com",
      "telefone": "11999999999",
      "ativo": true,
      "created_at": "2025-10-14T10:00:00Z"
    }
  ],
  "message": "Registros recuperados com sucesso"
}
```

### Listar com filtros
```bash
GET http://localhost:3000/api/cliente?ativo=true&limit=10&offset=0&orderBy=nome
```

### Buscar por ID
```bash
GET http://localhost:3000/api/cliente/1
```

**Resposta:**
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11999999999",
    "ativo": true,
    "created_at": "2025-10-14T10:00:00Z"
  },
  "message": "Registro recuperado com sucesso"
}
```

### Criar novo cliente
```bash
POST http://localhost:3000/api/cliente
Content-Type: application/json

{
  "nome": "Maria Santos",
  "email": "maria@example.com",
  "telefone": "11988888888"
}
```

**Resposta:**
```json
{
  "status": 201,
  "data": {
    "id": 2,
    "nome": "Maria Santos",
    "email": "maria@example.com",
    "telefone": "11988888888",
    "ativo": true,
    "created_at": "2025-10-14T11:00:00Z"
  },
  "message": "Registro criado com sucesso"
}
```

### Atualizar cliente
```bash
PUT http://localhost:3000/api/cliente/1
Content-Type: application/json

{
  "telefone": "11977777777"
}
```

**Resposta:**
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11977777777",
    "ativo": true,
    "updated_at": "2025-10-14T12:00:00Z"
  },
  "message": "Registro atualizado com sucesso"
}
```

### Deletar cliente
```bash
DELETE http://localhost:3000/api/cliente/1
```

**Resposta:**
```json
{
  "status": 200,
  "data": true,
  "message": "Registro deletado com sucesso"
}
```

### Contar registros
```bash
GET http://localhost:3000/api/cliente/count?ativo=true
```

**Resposta:**
```json
{
  "status": 200,
  "data": 5,
  "message": "Contagem realizada com sucesso"
}
```

## 10. Benefícios do Novo Padrão

✅ **Imports Limpos**: Uso de path aliases (`@/models/`) em vez de caminhos relativos  
✅ **Respostas Padronizadas**: Todas as respostas seguem o formato `{status, data, message}`  
✅ **Filtros Flexíveis**: Suporte a `conditions`, `includes`, `limit`, `offset` e `orderBy`  
✅ **Status HTTP Correto**: Status vem direto do service  
✅ **Código Limpo**: Routes apenas delegam para services  
✅ **Fácil Manutenção**: Menos código duplicado  

## 11. Próximos Passos

- Adicionar validações customizadas nos services
- Implementar autenticação e autorização
- Adicionar testes unitários
- Configurar migrations do banco de dados
- Adicionar relacionamentos entre modelos
