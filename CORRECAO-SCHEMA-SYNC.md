# Correção: Schema Sync com TypeScript

## ❌ Problema Encontrado

Ao executar o comando `npx framework-reactjs-api-sync` em um projeto externo, ocorria o seguinte erro:

```bash
npx framework-reactjs-api-sync
Sincronizando esquema do banco de dados no diretório: /workspaces/projeto-teste-framework-api
=== Framework TypeScript DDD - Sincronização de Esquema ===
Carregando modelos de /workspaces/projeto-teste-framework-api/src/models...
Carregando modelo: ClienteNovoModel.ts
Erro ao carregar modelo ClienteNovoModel.ts: SyntaxError: Invalid or unexpected token
```

### Causa Raiz

O comando `schema-sync` estava tentando fazer `require()` de arquivos TypeScript (`.ts`) diretamente. O Node.js **não consegue interpretar TypeScript** sem transpilação prévia, causando o erro `SyntaxError: Invalid or unexpected token`.

## ✅ Solução Implementada

### 1. Detecção de Arquivos Compilados

Adicionado código para:
- Primeiro procurar arquivos compilados (`.js`)
- Apenas usar arquivos `.ts` se não houver `.js` (desenvolvimento interno)
- Dar mensagem clara se modelos não estiverem compilados

```typescript
// Verificar se existem arquivos compilados (.js) ou apenas TypeScript (.ts)
const files = fs.readdirSync(modelsDir);
const jsFiles = files.filter(f => f.endsWith('.js'));
const tsFiles = files.filter(f => f.endsWith('.ts'));

if (jsFiles.length === 0 && tsFiles.length > 0) {
  console.error('❌ Erro: Modelos TypeScript encontrados, mas não compilados!');
  console.log('⚠️  O comando schema-sync requer que os modelos sejam compilados primeiro.');
  console.log('\nPor favor, execute:');
  console.log('  npm run build');
  console.log('E depois execute novamente:');
  console.log('  npx framework-reactjs-api-sync\n');
  process.exit(1);
}
```

### 2. Priorização de Arquivos JavaScript

```typescript
const modelsToLoad = jsFiles.length > 0 ? jsFiles : tsFiles;
```

- Se houver `.js`, usa eles (compilados, funcionam perfeitamente)
- Se houver apenas `.ts`, tenta usar (apenas para desenvolvimento interno do framework)
- Se `.ts` sem compilar em projeto externo, mostra erro com instruções

### 3. Feedback Visual Aprimorado

Agora exibe:
- ✓ Para modelos carregados com sucesso
- ✗ Para erros ao carregar
- Mensagens coloridas e claras

## 📖 Como Usar Corretamente

### Projeto Externo (Consumindo o Framework)

```bash
# 1. Configure seus modelos
# src/models/ClienteModel.ts

# 2. Configure o tsconfig.json
{
  "compilerOptions": {
    "outDir": "./dist",
    // ... outras opções
  }
}

# 3. Compile o projeto
npm run build

# 4. Execute a sincronização
npx framework-reactjs-api-sync
```

### Fluxo Recomendado

**Adicione script no `package.json`:**

```json
{
  "scripts": {
    "build": "tsc",
    "db:sync": "npm run build && npx framework-reactjs-api-sync"
  }
}
```

**Execute:**

```bash
npm run db:sync
```

## 🔍 Estruturas de Diretório Suportadas

O `schema-sync` procura modelos em (ordem de prioridade):

1. `src/core/domain/models/` (DDD completo)
2. `src/models/` (estrutura simplificada)
3. `models/` (estrutura minimalista)

**Após compilação, procura em:**

1. `dist/core/domain/models/`
2. `dist/models/`
3. `dist/`

## 📋 Checklist de Verificação

Antes de executar `schema-sync`, verifique:

- [ ] Modelos criados em um dos diretórios suportados
- [ ] `tsconfig.json` configurado com `outDir`
- [ ] Projeto compilado (`npm run build`)
- [ ] Diretório `dist/` existe com arquivos `.js`
- [ ] Variáveis de ambiente do banco configuradas (`.env`)

## 🎯 Exemplo Completo

### 1. Criar Modelo

```typescript
// src/models/ProductModel.ts
import { BaseModel } from 'framework-reactjs-api';

export class ProductModel extends BaseModel {
  static tableName = 'products';
  
  id!: number;
  name!: string;
  price!: number;
  stock!: number;
  created_at!: Date;
  updated_at?: Date;
  
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      stock: this.stock,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
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
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Compilar e Sincronizar

```bash
# Compilar
npm run build

# Verificar se compilou
ls dist/models/
# Deve mostrar: ProductModel.js

# Sincronizar
npx framework-reactjs-api-sync
```

**Saída esperada:**

```
Sincronizando esquema do banco de dados...
=== Framework TypeScript DDD - Sincronização de Esquema ===
Carregando modelos de /seu-projeto/dist/models...
Carregando modelo: ProductModel.js
✓ Modelo ProductModel carregado com sucesso
Sincronizando esquema...
✓ Tabela 'products' criada/atualizada
Esquema sincronizado com sucesso!
```

## ⚠️ Problemas Comuns

### Problema 1: "Modelos TypeScript encontrados, mas não compilados"

**Solução:**
```bash
npm run build
```

### Problema 2: "Diretório de modelos não encontrado"

**Solução:**
Certifique-se de que os modelos estão em um dos diretórios suportados:
- `src/models/`
- `src/core/domain/models/`
- `models/`

### Problema 3: "SyntaxError: Invalid or unexpected token"

**Solução:**
Isso significa que está tentando carregar `.ts` em vez de `.js`. Compile primeiro:
```bash
npm run build && npx framework-reactjs-api-sync
```

### Problema 4: Modelos compilados em local diferente

**Solução:**
O `schema-sync` agora procura modelos automaticamente em:
- Primeiro: `dist/models/`, `dist/core/domain/models/`
- Depois: `src/models/`, `src/core/domain/models/`

Se usar estrutura diferente, ajuste o `outDir` no `tsconfig.json` para `./dist`.

## 📚 Documentação Atualizada

A documentação foi atualizada em:
- [MANUAL.md](./MANUAL.md) - Seção "Schema Sync" com instruções completas
- [README.md](./README.md) - Referência aos comandos CLI

## 🏆 Resultado

✅ **Schema-sync agora funciona corretamente em projetos externos!**

- Detecta automaticamente se modelos estão compilados
- Mensagens de erro claras com instruções
- Suporta múltiplas estruturas de diretórios
- Feedback visual aprimorado

---

**Data**: 17 de Outubro de 2025
**Issue**: Schema sync com TypeScript em projetos externos
**Status**: ✅ Resolvido
