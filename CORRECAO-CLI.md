# Correção: Scripts CLI Executando Automaticamente

## Problema Identificado

Ao executar `npm run dev` ou `npm run build`, os scripts CLI do framework (scaffold, migration, schema-sync) estavam sendo executados automaticamente, exibindo mensagens como:

```
=== Framework TypeScript DDD - Scaffolding de Use Cases ===
```

## Causa do Problema

Os arquivos CLI tinham chamadas diretas às funções `main()` no final do arquivo:

```typescript
// ❌ ANTES - Executava sempre que o módulo era importado
main();
```

Isso fazia com que o script fosse executado toda vez que o módulo era importado, mesmo quando usado como biblioteca.

## Solução Aplicada

Adicionamos uma verificação para executar o script **apenas quando chamado diretamente**, não quando importado como módulo:

```typescript
// ✅ DEPOIS - Executa apenas quando chamado diretamente
if (require.main === module) {
  main();
}
```

## Arquivos Corrigidos

### 1. `/src/infra/cli/usecase-scaffold.ts`

**Antes:**
```typescript
// Executar o script
main();
```

**Depois:**
```typescript
// Executar o script apenas se for chamado diretamente (não quando importado)
if (require.main === module) {
  main();
}
```

### 2. `/src/infra/cli/migration-runner.ts`

**Antes:**
```typescript
// Executar o script
main().catch(error => {
  console.error('\x1b[31mErro fatal:\x1b[0m', error);
  process.exit(1);
});
```

**Depois:**
```typescript
// Executar o script apenas se for chamado diretamente (não quando importado)
if (require.main === module) {
  main().catch(error => {
    console.error('\x1b[31mErro fatal:\x1b[0m', error);
    process.exit(1);
  });
}
```

### 3. `/src/infra/cli/schema-sync.ts`

**Antes:**
```typescript
// Executar o script
main().catch(error => {
  console.error('\x1b[31mErro fatal:\x1b[0m', error);
  process.exit(1);
});
```

**Depois:**
```typescript
// Executar o script apenas se for chamado diretamente (não quando importado)
if (require.main === module) {
  main().catch(error => {
    console.error('\x1b[31mErro fatal:\x1b[0m', error);
    process.exit(1);
  });
}
```

## Como Funciona

A verificação `require.main === module` retorna:
- `true` quando o arquivo é executado diretamente (ex: `node arquivo.js` ou `npx comando`)
- `false` quando o arquivo é importado como módulo (ex: `import { funcao } from './arquivo'`)

Isso permite que:
1. ✅ Os comandos CLI funcionem normalmente quando executados via `npx`
2. ✅ As funções possam ser importadas e usadas programaticamente
3. ✅ O `npm run dev` e `npm run build` não executem os scripts automaticamente

## Testado e Validado

### ✅ npm run dev
```bash
npm run dev
# Não exibe mais mensagens dos scripts CLI
```

### ✅ npm run build
```bash
npm run build
# Compila sem executar os scripts
```

### ✅ Comandos CLI continuam funcionando
```bash
npx framework-reactjs-api-scaffold Cliente
# Executa normalmente e exibe:
# === Framework TypeScript DDD - Scaffolding de Use Cases ===
```

## Impacto

- ✅ Nenhuma quebra de funcionalidade
- ✅ Scripts CLI continuam funcionando perfeitamente
- ✅ Framework pode ser usado como biblioteca sem efeitos colaterais
- ✅ `npm run dev` e `npm run build` agora são limpos

## Data da Correção

14 de Outubro de 2025
