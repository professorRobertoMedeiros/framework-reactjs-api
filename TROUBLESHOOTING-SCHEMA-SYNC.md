# 🔧 Troubleshooting: Schema Sync - Erro "Invalid or unexpected token"

## ❌ Problema Relatado

Ao executar `npx framework-reactjs-api-sync` em um projeto externo:

```
Erro ao carregar modelo ClienteNovoModel.ts: SyntaxError: Invalid or unexpected token
```

## 🎯 Solução Definitiva

O framework agora procura **PRIMEIRO** pelos arquivos compilados (`.js`) em `dist/`:

### ✅ Ordem Correta de Execução:

```bash
# 1. Compile seu projeto
npm run build

# 2. Execute o schema-sync
npx framework-reactjs-api-sync
```

## 📁 Onde o Schema-Sync Procura os Modelos

O comando agora procura nesta ordem:

1. ✅ `dist/core/domain/models/` (DDD completo compilado)
2. ✅ `dist/models/` (estrutura simples compilada)
3. ✅ `dist/src/models/` (quando rootDir não está configurado)
4. ✅ `dist/src/core/domain/models/`
5. ⚠️ `src/core/domain/models/` (apenas dev interno do framework)
6. ⚠️ `src/models/` (apenas dev interno)
7. ⚠️ `models/` (apenas dev interno)

## 🔍 Verificações Necessárias

### 1. Verificar se o projeto foi compilado

```bash
npm run build

# Verificar se gerou arquivos .js
ls -la dist/models/
# OU
ls -la dist/core/domain/models/
```

**Saída esperada:**
```
ClienteModel.js
ProductModel.js
...
```

### 2. Verificar tsconfig.json

O `tsconfig.json` **deve** ter:

```json
{
  "compilerOptions": {
    "outDir": "./dist",      // ✅ OBRIGATÓRIO
    "rootDir": "./src",      // ✅ RECOMENDADO
    "module": "commonjs",    // ✅ OBRIGATÓRIO para Node.js
    "target": "ES2020",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Estrutura ANTES vs DEPOIS da compilação

**ANTES (Código-fonte TypeScript):**
```
seu-projeto/
├── package.json
├── tsconfig.json
└── src/
    └── models/
        ├── ClienteModel.ts  ⚠️ TypeScript
        └── ProductModel.ts  ⚠️ TypeScript
```

**DEPOIS (Compilado):**
```
seu-projeto/
├── package.json
├── tsconfig.json
├── src/
│   └── models/
│       ├── ClienteModel.ts
│       └── ProductModel.ts
└── dist/                     ✅ CRIADO PELO npm run build
    └── models/
        ├── ClienteModel.js   ✅ JavaScript - USADO pelo schema-sync
        └── ProductModel.js   ✅ JavaScript - USADO pelo schema-sync
```

## 🚀 Solução Rápida

### Opção 1: Comando Único

Adicione ao `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "db:sync": "npm run build && npx framework-reactjs-api-sync"
  }
}
```

Execute:
```bash
npm run db:sync
```

### Opção 2: Passo a Passo

```bash
# 1. Limpar compilação anterior (opcional)
rm -rf dist/

# 2. Compilar
npm run build

# 3. Verificar compilação
ls dist/models/*.js

# 4. Sincronizar schema
npx framework-reactjs-api-sync
```

## 📝 Exemplo Completo

### 1. Criar Modelo TypeScript

```typescript
// src/models/ClienteModel.ts
import { BaseModel } from 'framework-reactjs-api';

export class ClienteModel extends BaseModel {
  static tableName = 'clientes';
  
  id!: number;
  nome!: string;
  email!: string;
  telefone?: string;
  created_at!: Date;
  updated_at?: Date;
  
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
```

### 2. Compilar

```bash
npm run build
```

### 3. Verificar Compilação

```bash
$ ls dist/models/
ClienteModel.js  # ✅ Deve existir
```

### 4. Executar Schema Sync

```bash
$ npx framework-reactjs-api-sync

Sincronizando esquema do banco de dados no diretório: /seu-projeto
=== Framework TypeScript DDD - Sincronização de Esquema ===
Carregando modelos de /seu-projeto/dist/models...
Carregando modelo: ClienteModel.js
✓ Modelo ClienteModel carregado com sucesso
Sincronizando esquema...
✓ Tabela 'clientes' criada/atualizada
Esquema sincronizado com sucesso!
```

## ❗ Mensagens de Erro e Soluções

### Erro: "Modelos TypeScript encontrados, mas não compilados"

```
❌ Erro: Modelos TypeScript encontrados, mas não compilados!
⚠️  O comando schema-sync requer que os modelos sejam compilados primeiro.

Por favor, execute:
  npm run build
E depois execute novamente:
  npx framework-reactjs-api-sync
```

**Solução:**
```bash
npm run build
npx framework-reactjs-api-sync
```

### Erro: "Diretório de modelos não encontrado"

```
❌ Erro: Diretório de modelos não encontrado.

Estrutura esperada:
  • dist/models/ (após compilar com npm run build)
  • dist/core/domain/models/
  • src/models/ (apenas desenvolvimento)

Verifique:
  1. O projeto foi compilado? Execute: npm run build
  2. O tsconfig.json tem "outDir": "./dist" configurado?
  3. Os modelos estão em src/models/ ou src/core/domain/models/?
```

**Soluções:**

1. **Compilar o projeto:**
   ```bash
   npm run build
   ```

2. **Verificar tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "outDir": "./dist"  // ✅ Deve apontar para dist/
     }
   }
   ```

3. **Verificar estrutura:**
   ```bash
   # Modelos devem estar em:
   src/models/              # OU
   src/core/domain/models/
   ```

### Erro: "SyntaxError: Invalid or unexpected token"

**Causa:** Tentando carregar `.ts` em vez de `.js`

**Solução:**
```bash
npm run build
npx framework-reactjs-api-sync
```

## 🔧 Comandos de Diagnóstico

```bash
# 1. Verificar estrutura de diretórios
tree dist/ -L 3

# 2. Verificar arquivos compilados
ls -la dist/models/

# 3. Verificar conteúdo de arquivo compilado
head -20 dist/models/ClienteModel.js

# 4. Verificar tsconfig
cat tsconfig.json | grep -A 3 compilerOptions

# 5. Limpar e recompilar
rm -rf dist/ && npm run build && ls -la dist/models/

# 6. Executar schema-sync com debug
DEBUG=* npx framework-reactjs-api-sync
```

## 📚 Recursos Adicionais

- [MANUAL.md - Seção Schema Sync](./MANUAL.md#schema-sync)
- [CORRECAO-SCHEMA-SYNC.md](./CORRECAO-SCHEMA-SYNC.md) - Explicação detalhada
- [SOLUCAO-RAPIDA-SCHEMA-SYNC.md](./SOLUCAO-RAPIDA-SCHEMA-SYNC.md) - Solução rápida

## ✅ Checklist Final

Antes de executar `npx framework-reactjs-api-sync`:

- [ ] Modelos criados em `src/models/` ou `src/core/domain/models/`
- [ ] Modelos estendem `BaseModel` do framework
- [ ] `tsconfig.json` configurado com `outDir: "./dist"`
- [ ] Projeto compilado com `npm run build`
- [ ] Diretório `dist/models/` existe com arquivos `.js`
- [ ] Arquivo `.env` configurado com credenciais do banco
- [ ] PostgreSQL está rodando e acessível

Se todos os itens estiverem ✅, execute:

```bash
npx framework-reactjs-api-sync
```

---

**Última atualização:** 17 de Outubro de 2025  
**Versão do Framework:** 1.0.0  
**Status:** ✅ Corrigido - Schema sync agora procura arquivos compilados em `dist/`
