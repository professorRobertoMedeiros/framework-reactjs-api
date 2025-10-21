# 📋 Business: Método toDom Agora é Opcional

## 🎯 Mudança Implementada

O método `toDom` na classe `BaseBusiness` **não é mais obrigatório**. Agora você pode criar Business classes sem precisar implementá-lo, a menos que realmente precise transformar os dados.

---

## ✅ Antes (Obrigatório)

Antes, toda classe Business era obrigada a implementar o método `toDom`:

```typescript
export class ProdutoBusiness extends BaseBusiness<ProdutoModel, ProdutoDom> {
  constructor() {
    const repository = new ProdutoRepository();
    super(repository);
  }

  // ❌ ERA OBRIGATÓRIO - Mesmo quando não havia transformação
  protected toDom(model: ProdutoModel): ProdutoDom {
    return {
      id: model.id,
      nome: model.nome,
      preco: model.preco,
      ativo: model.ativo,
      created_at: model.created_at,
      updated_at: model.updated_at
    };
  }
}
```

---

## ✅ Agora (Opcional)

Agora você só implementa `toDom` se precisar **transformar** os dados:

### Caso 1: Sem Transformação (Mais Comum)

```typescript
export class ProdutoBusiness extends BaseBusiness<ProdutoModel, ProdutoModel> {
  constructor() {
    const repository = new ProdutoRepository();
    super(repository);
  }

  // ✅ Não precisa implementar toDom!
  // BaseBusiness retorna o próprio modelo sem transformação

  // Adicione apenas métodos de negócio específicos
  async desativar(id: number): Promise<void> {
    const produto = await this.repository.findById(id);
    if (!produto) throw new Error('Produto não encontrado');
    
    await this.repository.update(id, { ativo: false });
  }
}
```

### Caso 2: Com Transformação (Quando Necessário)

```typescript
interface ProdutoDom {
  id: number;
  nomeCompleto: string;  // Transformado
  precoFormatado: string; // Transformado
  statusAtivo: boolean;
}

export class ProdutoBusiness extends BaseBusiness<ProdutoModel, ProdutoDom> {
  constructor() {
    const repository = new ProdutoRepository();
    super(repository);
  }

  // ✅ Implementa toDom apenas quando precisa transformar
  protected toDom(model: ProdutoModel): ProdutoDom {
    return {
      id: model.id,
      nomeCompleto: `${model.nome} (${model.codigo})`,
      precoFormatado: `R$ ${model.preco.toFixed(2)}`,
      statusAtivo: model.ativo
    };
  }
}
```

---

## 🎓 Quando Usar Cada Abordagem

### ❌ Não implemente toDom quando:
- O Model e o Dom são idênticos
- Você apenas retorna os dados do banco sem transformação
- Não há lógica de formatação ou ocultação de campos

### ✅ Implemente toDom quando:
- Precisa formatar valores (ex: datas, moedas)
- Precisa ocultar campos sensíveis (ex: senha, tokens)
- Precisa combinar campos (ex: first_name + last_name)
- Precisa transformar estruturas complexas
- Precisa adicionar campos calculados

---

## 📊 Exemplos Práticos

### Exemplo 1: Business Simples (Sem toDom)

```typescript
// UserBusiness.ts
export class UserBusiness extends BaseBusiness<UserModel, UserModel> {
  constructor() {
    super(new UserRepository());
  }

  // Métodos de negócio específicos
  async ativarUsuario(id: number): Promise<void> {
    await this.repository.update(id, { active: true });
  }

  async desativarUsuario(id: number): Promise<void> {
    await this.repository.update(id, { active: false });
  }
}
```

### Exemplo 2: Business com Transformação (Com toDom)

```typescript
// UserPublicDom - Oculta dados sensíveis
interface UserPublicDom {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
  // password_hash NÃO é exposto
}

export class UserBusiness extends BaseBusiness<UserModel, UserPublicDom> {
  constructor() {
    super(new UserRepository());
  }

  // Implementa toDom para ocultar senha e combinar nome
  protected toDom(model: UserModel): UserPublicDom {
    return {
      id: model.id,
      fullName: `${model.first_name} ${model.last_name}`,
      email: model.email,
      isActive: model.active
      // password_hash é intencionalmente omitido
    };
  }
}
```

### Exemplo 3: Business com Cálculos (Com toDom)

```typescript
interface PedidoDom {
  id: number;
  numeroItens: number;
  subtotal: number;
  desconto: number;
  total: number;
  status: string;
}

export class PedidoBusiness extends BaseBusiness<PedidoModel, PedidoDom> {
  constructor() {
    super(new PedidoRepository());
  }

  protected toDom(model: PedidoModel): PedidoDom {
    const subtotal = model.itens.reduce((sum, item) => sum + item.preco, 0);
    const desconto = model.cupom_desconto || 0;
    const total = subtotal - desconto;

    return {
      id: model.id,
      numeroItens: model.itens.length,
      subtotal,
      desconto,
      total,
      status: model.status.toUpperCase()
    };
  }
}
```

---

## 🔧 Migração de Código Existente

### Opção 1: Manter toDom (Nada Muda)

Se você já tem um Business com toDom implementado, **não precisa mudar nada**. Continua funcionando perfeitamente:

```typescript
export class UserBusiness extends BaseBusiness<UserModel, UserDom> {
  // Sua implementação existente de toDom continua funcionando
  protected toDom(model: UserModel): UserDom {
    return { ...model };
  }
}
```

### Opção 2: Remover toDom Desnecessário

Se seu toDom apenas copia os campos sem transformação, você pode removê-lo:

**Antes:**
```typescript
export class UserBusiness extends BaseBusiness<UserModel, UserDom> {
  protected toDom(model: UserModel): UserDom {
    return {
      id: model.id,
      name: model.name,
      email: model.email,
      active: model.active
    };
  }
}
```

**Depois:**
```typescript
// Simplifique para UserModel = UserDom
export class UserBusiness extends BaseBusiness<UserModel, UserModel> {
  // Não precisa mais de toDom!
}
```

---

## ✅ Vantagens da Mudança

1. **Menos Código Boilerplate**: Não precisa escrever toDom quando não há transformação
2. **Mais Simples**: Business fica focado em lógica de negócio
3. **Retrocompatível**: Código existente continua funcionando
4. **Flexível**: Implementa toDom apenas quando necessário
5. **Scaffold Atualizado**: Novos use-cases gerados sem toDom obrigatório

---

## 🚀 Usando o Scaffold

Ao criar um novo use-case com o scaffold, o método toDom vem **comentado**:

```bash
npm run usecase-scaffold NomeDoModelo
```

Gera:

```typescript
export class NomeDoModeloBusiness extends BaseBusiness<NomeDoModeloModel, NomeDoModeloDom> {
  constructor() {
    super(new NomeDoModeloRepository());
  }

  /**
   * Converter modelo para Dom (DTO) - OPCIONAL
   * Por padrão, o BaseBusiness retorna o próprio modelo sem transformação.
   * Descomente e implemente apenas se precisar transformar os dados.
   */
  /*
  protected toDom(model: NomeDoModeloModel): NomeDoModeloDom {
    return {
      id: model.id,
      // TODO: Mapear outras propriedades
    };
  }
  */

  // Adicione métodos de negócio específicos aqui
}
```

---

## 📚 Implementação Técnica

### BaseBusiness.ts

```typescript
export abstract class BaseBusiness<T = any, TDom = T> {
  protected repository: BaseRepository<any>;

  constructor(repository: BaseRepository<any>) {
    this.repository = repository;
  }

  /**
   * Converter modelo para Dom (DTO)
   * Por padrão, retorna o próprio modelo sem transformação
   * Sobrescreva este método se precisar transformar os dados
   */
  protected toDom(model: T): TDom {
    return model as unknown as TDom;
  }

  // Resto dos métodos CRUD...
}
```

**O que mudou:**
- ❌ Antes: `protected abstract toDom(model: T): TDom;`
- ✅ Agora: `protected toDom(model: T): TDom { return model as unknown as TDom; }`

---

## 🎯 Conclusão

A mudança torna o framework **mais prático e objetivo**, removendo código desnecessário quando não há transformação de dados. Use `toDom` apenas quando realmente precisar transformar, formatar ou ocultar dados.

**Versão:** 1.0.3  
**Data:** 21 de Outubro de 2025  
**Status:** ✅ Implementado e retrocompatível
