# Guia de Compatibilidade de Decoradores

Este guia explica como usar os decoradores do framework com diferentes versões do TypeScript.

> **NOTA IMPORTANTE:** Sempre use os parênteses com os decoradores `@Id()` e `@Column()`, mesmo na versão TypeScript 5.0+. A sintaxe `@Id` sem parênteses não é suportada corretamente.

## Decoradores no TypeScript 4.x (Experimental)

Para projetos usando TypeScript 4.x, você deve usar os decoradores originais:

```typescript
import { BaseModel, Entity, Column, Id } from 'framework-reactjs-api';

@Entity('clientes')
export class ClienteModel extends BaseModel {
  @Id()
  id: number = 0;
  
  @Column({
    type: 'VARCHAR',
    length: 100,
    nullable: false
  })
  nome: string = '';
  
  // ... outros campos
  
  static getTableName(): string {
    return 'clientes';
  }
  
  static getConstraints() {
    // ...
  }
  
  toJSON() {
    // ...
  }
}
```

## Decoradores no TypeScript 5.0+ (Estágio 2)

Para projetos usando TypeScript 5.0 ou superior, você deve usar os decoradores compatíveis com a nova sintaxe:

```typescript
import { BaseModel, Entity, Column5 as Column, Id5 as Id } from 'framework-reactjs-api';

@Entity('clientes')
export class ClienteModel extends BaseModel {
  @Id()  // IMPORTANTE: Sempre inclua os parênteses!
  id: number = 0;
  
  @Column({
    type: 'VARCHAR',
    length: 100,
    nullable: false
  })
  nome: string = '';
  
  // ... outros campos
  
  static getTableName(): string {
    return 'clientes';
  }
  
  static getConstraints() {
    // ...
  }
  
  toJSON() {
    // ...
  }
}
```

## Configuração do TypeScript

### Para TypeScript 4.x

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    // outras configurações...
  }
}
```

### Para TypeScript 5.0+

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    // Se estiver usando os decoradores estágio 3 (padrão mais recente)
    "useDefineForClassFields": false,
    // outras configurações...
  }
}
```

## Compatibilidade entre Versões

Se você estiver migrando um projeto de TypeScript 4.x para 5.x, recomendamos:

1. Atualizar as importações para usar os decoradores compatíveis com a versão 5.0+
2. Ajustar o `tsconfig.json` conforme necessário
3. Verificar todos os arquivos que usam decoradores

## Detecção Automática

O framework tentará detectar automaticamente a versão do TypeScript em tempo de execução e usar os decoradores apropriados, mas é recomendado seguir as diretrizes acima para garantir total compatibilidade.