# ✅ Schema-Sync: Solução Completa e Documentação

## 🎯 Problemas Identificados e Resolvidos

### 1. ❌ Problema: Schema-sync carregava arquivos .ts em vez de .js
**Causa**: Lógica procurava primeiro diretório que **existe**, não que **contém .js**

**Solução**: ✅ Corrigido - agora procura diretórios COM arquivos .js compilados

### 2. ❌ Problema: Modelos não eram registrados no ORM
**Causa**: Código apenas carregava (`new Model()`), mas não registrava (`orm.registerModel()`)

**Solução**: ✅ Corrigido - modelos agora são registrados automaticamente

### 3. ❌ Problema: Modelos sem decorators não funcionam
**Causa**: Framework usa `@Entity`, `@Column`, `@Id` para metadados de schema

**Solução**: ✅ Documentado - modelos devem usar decorators

## 📝 Como Criar Modelos Corretamente

### ❌ ERRADO (sem decorators):
```typescript
import { BaseModel } from 'framework-reactjs-api';

export class ClienteModel extends BaseModel {
  static tableName = 'clientes';  // ❌ Não funciona
  
  nome: string;  // ❌ Sem metadados
  email: string;
}
```

### ✅ CORRETO (com decorators):
```typescript
import { BaseModel, Entity, Column, Id } from 'framework-reactjs-api';

@Entity('clientes')  // ✅ Define nome da tabela
export class ClienteModel extends BaseModel {
  @Id()  // ✅ Primary key auto-incremento
  id!: number;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 255
  })
  nome!: string;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 255
  })
  email!: string;

  @Column({
    type: 'VARCHAR',
    nullable: true,  // ✅ Campo opcional
    length: 50
  })
  telefone?: string;

  constructor(data?: Partial<ClienteModel>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
```

## 🔧 Tipos de Colunas Disponíveis

```typescript
type: 'SERIAL'    // Auto-incremento (geralmente para IDs)
type: 'VARCHAR'   // Texto variável (especificar length)
type: 'INT'       // Número inteiro
type: 'BOOLEAN'   // Verdadeiro/Falso
type: 'TIMESTAMP' // Data e hora
type: 'TEXT'      // Texto longo
type: 'JSONB'     // JSON binário (PostgreSQL)
```

## 📋 Workflow Completo

### 1. Criar Modelo
```typescript
// src/models/ProdutoModel.ts
import { BaseModel, Entity, Column, Id } from 'framework-reactjs-api';

@Entity('produtos')
export class ProdutoModel extends BaseModel {
  @Id()
  id!: number;

  @Column({ type: 'VARCHAR', nullable: false, length: 255 })
  nome!: string;

  @Column({ type: 'TEXT', nullable: true })
  descricao?: string;

  @Column({ type: 'INT', nullable: false, default: 0 })
  preco!: number;

  constructor(data?: Partial<ProdutoModel>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
```

### 2. Configurar tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "experimentalDecorators": true,  // ✅ OBRIGATÓRIO
    "emitDecoratorMetadata": true    // ✅ OBRIGATÓRIO
  }
}
```

### 3. Configurar .env
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meu_banco
DB_USER=postgres
DB_PASSWORD=postgres
```

### 4. Compilar e Sincronizar
```bash
# Compilar TypeScript → JavaScript
npm run build

# Sincronizar schema
npx framework-reactjs-api-sync
```

## ✅ Exemplo Completo de Output Bem-Sucedido

```bash
$ npm run build && npx framework-reactjs-api-sync

> projeto@1.0.0 build
> tsc

Sincronizando esquema do banco de dados no diretório: /workspaces/seu-projeto
=== Framework TypeScript DDD - Sincronização de Esquema ===
Carregando modelos de /workspaces/seu-projeto/dist/models...
Carregando modelo: ClienteModel.js
✓ Modelo ClienteModel carregado e registrado com sucesso
Carregando modelo: ProdutoModel.js
✓ Modelo ProdutoModel carregado e registrado com sucesso
Sincronizando esquema...
Conexão estabelecida com o banco de dados
Iniciando sincronização do esquema...
Sincronizando modelo: ClienteModel
Tabela clientes sincronizada
Sincronizando modelo: ProdutoModel
Tabela produtos sincronizada
Sincronização de esquema concluída com sucesso!
✅ Esquema sincronizado com sucesso!
```

## 🚨 Erros Comuns e Soluções

### Erro: "Modelo não possui tabela ou colunas definidas"
**Causa**: Falta `@Entity` ou `@Column` decorators

**Solução**:
```typescript
@Entity('nome_tabela')  // ✅ Adicionar
export class MeuModel extends BaseModel {
  @Column({ type: 'VARCHAR', nullable: false, length: 255 })  // ✅ Adicionar
  campo!: string;
}
```

### Erro: "Cannot find name 'Entity'"
**Causa**: Import incompleto

**Solução**:
```typescript
// ✅ Import completo
import { BaseModel, Entity, Column, Id } from 'framework-reactjs-api';
```

### Erro: "experimentalDecorators"
**Causa**: tsconfig.json sem suporte a decorators

**Solução**:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Erro: "ECONNREFUSED"
**Causa**: PostgreSQL não está rodando

**Solução**:
```bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Iniciar se necessário
sudo service postgresql start

# Ou usar Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

## 📚 Decorators Avançados

### Índices Únicos
```typescript
import { UniqueIndex } from 'framework-reactjs-api';

@Entity('usuarios')
@UniqueIndex('idx_email_unico', ['email'])  // ✅ Email único
export class UsuarioModel extends BaseModel {
  @Id()
  id!: number;

  @Column({ type: 'VARCHAR', nullable: false, length: 255 })
  email!: string;
}
```

### Índices de Negócio
```typescript
import { BusinessIndex } from 'framework-reactjs-api';

@Entity('produtos')
@BusinessIndex('idx_nome_produto', ['nome'], 'INDEX')  // ✅ Índice para busca
export class ProdutoModel extends BaseModel {
  @Id()
  id!: number;

  @Column({ type: 'VARCHAR', nullable: false, length: 255 })
  nome!: string;
}
```

## 🎯 Checklist Completo

- [ ] Modelo criado com `@Entity('nome_tabela')`
- [ ] Campo ID com `@Id()`
- [ ] Todos os campos com `@Column({...})`
- [ ] tsconfig.json com `experimentalDecorators: true`
- [ ] tsconfig.json com `emitDecoratorMetadata: true`
- [ ] tsconfig.json com `outDir: "./dist"`
- [ ] .env configurado com credenciais do banco
- [ ] PostgreSQL rodando e acessível
- [ ] Projeto compilado com `npm run build`
- [ ] `dist/models/` contém arquivos .js
- [ ] Executar `npx framework-reactjs-api-sync`

---

**Data**: 17 de outubro de 2025  
**Status**: ✅ **100% FUNCIONAL** (exceto conexão com banco de dados que depende do ambiente)  
**Correções Aplicadas**: 
1. Schema-sync prioriza dist/ corretamente ✅
2. Modelos são registrados no ORM automaticamente ✅
3. Documentação completa de uso de decorators ✅
