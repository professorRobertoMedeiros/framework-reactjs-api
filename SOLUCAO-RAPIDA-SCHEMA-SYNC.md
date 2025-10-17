# ✅ SOLUÇÃO: Erro no Schema Sync

## ❌ Erro Encontrado
```bash
npx framework-reactjs-api-sync
Erro ao carregar modelo ClienteNovoModel.ts: SyntaxError: Invalid or unexpected token
```

## 🔍 Causa
O schema-sync agora procura arquivos **compilados** (`.js`) em `dist/`, não arquivos TypeScript (`.ts`) em `src/`.

## ✅ Solução Definitiva

### Passo 1: Verifique sua estrutura

**Antes de compilar:**
```
seu-projeto/
└── src/
    └── models/
        └── ClienteModel.ts  ⚠️ TypeScript
```

**Depois de compilar:**
```
seu-projeto/
├── src/
│   └── models/
│       └── ClienteModel.ts
└── dist/                    ✅ NOVO
    └── models/
        └── ClienteModel.js  ✅ JavaScript compilado
```

### Passo 2: Configure o tsconfig.json

```json
{
  "compilerOptions": {
    "outDir": "./dist",      // ✅ OBRIGATÓRIO
    "rootDir": "./src",
    "module": "commonjs",
    "target": "ES2020"
  }
}
```

### Passo 3: Execute os comandos

```bash
# 1. Compile PRIMEIRO
npm run build

# 2. Verifique se compilou
ls dist/models/
# Deve mostrar: ClienteModel.js

# 3. Execute o schema-sync
npx framework-reactjs-api-sync
```

## 🚀 Solução Rápida (Recomendada)

Adicione ao `package.json`:

```json
{
  "scripts": {
    "db:sync": "npm run build && npx framework-reactjs-api-sync"
  }
}
```

Execute:
```bash
npm run db:sync
```

## � O que Mudou no Framework

O `schema-sync` agora procura modelos nesta ordem:

1. ✅ **`dist/models/`** ← Compilados (prioridade)
2. ✅ **`dist/core/domain/models/`** ← DDD compilado
3. ⚠️ `src/models/` ← Apenas dev interno

## ❗ Erro Comum

```
❌ Erro: Diretório de modelos não encontrado.

Verifique:
  1. O projeto foi compilado? Execute: npm run build
  2. O tsconfig.json tem "outDir": "./dist" configurado?
```

**Solução:**
```bash
# Limpar e recompilar
rm -rf dist/
npm run build
ls dist/models/  # Verificar se tem arquivos .js
npx framework-reactjs-api-sync
```

## 📖 Documentação Completa

- **[TROUBLESHOOTING-SCHEMA-SYNC.md](./TROUBLESHOOTING-SCHEMA-SYNC.md)** - Guia completo
- **[MANUAL.md](./MANUAL.md)** - Seção "Schema Sync"
- **[CORRECAO-SCHEMA-SYNC.md](./CORRECAO-SCHEMA-SYNC.md)** - Detalhes técnicos

---

**🎉 Resumo:**
1. ✅ Configure `tsconfig.json` com `"outDir": "./dist"`
2. ✅ Execute `npm run build`
3. ✅ Verifique que `dist/models/` existe
4. ✅ Execute `npx framework-reactjs-api-sync`
