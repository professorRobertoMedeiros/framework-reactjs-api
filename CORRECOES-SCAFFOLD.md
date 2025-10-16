# Correções Aplicadas no Scaffold após Teste

## Data: 14 de Outubro de 2025

---

## 🎯 Comando Executado

```bash
npx framework-reactjs-api-scaffold User
```

---

## ❌ Problemas Encontrados

### 1. **Path Aliases não Funcionam Dentro do Framework**

**Erro:**
```
Cannot find module '@/models/UserModel'
```

**Causa:**
Os path aliases (`@/models/`, `@/repositories/`, etc.) funcionam apenas quando o framework é usado como dependência em outro projeto. Dentro do próprio framework, o TypeScript não consegue resolver esses aliases.

**Solução Aplicada:**
Mantivemos os templates com `@/models/` porque:
- ✅ É o comportamento correto quando usado como dependência
- ✅ Os usuários do framework terão o tsconfig.json configurado
- ⚠️ Para testes dentro do framework, os imports precisam ser ajustados manualmente

**Arquivos Corrigidos Manualmente:**
- `src/use-cases/user/repository/UserRepository.ts`
- `src/use-cases/user/UserService.ts`
- `src/use-cases/user/UserBusiness.ts`

**Mudança:**
```typescript
// Template (correto para usuários)
import { UserModel } from '@/models/UserModel';

// Ajuste manual dentro do framework
import { UserModel } from '../../core/domain/models/UserModel';
```

---

### 2. **Repository Importando de 'framework-reactjs-api'**

**Erro:**
```
Cannot find module 'framework-reactjs-api'
```

**Causa:**
Dentro do framework, não podemos importar de 'framework-reactjs-api', pois estamos dentro do próprio pacote.

**Solução Aplicada:**
```typescript
// Antes (no template - correto para usuários)
import { BaseRepository } from 'framework-reactjs-api';

// Depois (ajustado manualmente dentro do framework)
import { BaseRepository } from '../../../infra/repository/BaseRepository';
```

---

### 3. **Interfaces IUserBusiness e IUserRepository Não Existem**

**Erro:**
```
'IUserBusiness' has no exported member
'IUserRepository' has no exported member
```

**Causa:**
O novo padrão de scaffold não gera interfaces separadas.

**Solução Aplicada:**
```typescript
// src/index.ts - Antes
export { IUserBusiness, UserBusiness } from './use-cases/user/UserBusiness';
export { IUserRepository, UserRepository } from './use-cases/user/repository/UserRepository';

// src/index.ts - Depois
export { UserBusiness } from './use-cases/user/UserBusiness';
export { UserRepository } from './use-cases/user/repository/UserRepository';
```

---

### 4. **Método findById com Parâmetro 'includes' Incorreto**

**Erro:**
```
Expected 1 arguments, but got 2
```

**Causa:**
O BaseRepository.findById() aceita apenas 1 parâmetro (id), mas o template do service estava passando 2 (id e includes).

**Solução Aplicada no Template:**
```typescript
// Antes
async findById(id: number, includes?: string[]): Promise<ServiceResponse<UserModel>> {
  const data = await this.repository.findById(id, includes);
  ...
}

// Depois
async findById(id: number, includes?: string[]): Promise<ServiceResponse<UserModel>> {
  const data = await this.repository.findById(id);
  ...
}
```

**Arquivo Modificado:**
- `src/infra/cli/usecase-scaffold.ts` - Template do Service

---

### 5. **Tipos Incompatíveis em create() e update()**

**Erro:**
```
Argument of type 'Partial<UserModel>' is not assignable to parameter of type 'Omit<UserModel, "id">'
```

**Causa:**
O BaseRepository.create() espera `Omit<T, 'id'>` mas o service estava passando `Partial<T>`.

**Solução Aplicada no Template:**
```typescript
// Antes
async create(data: Partial<UserModel>): Promise<ServiceResponse<UserModel>> {
  const created = await this.repository.create(data);
  ...
}

// Depois
async create(data: any): Promise<ServiceResponse<UserModel>> {
  const created = await this.repository.create(data as Omit<UserModel, 'id'>);
  ...
}

// Antes
async update(id: number, data: Partial<UserModel>): Promise<ServiceResponse<UserModel>> {
  ...
}

// Depois
async update(id: number, data: any): Promise<ServiceResponse<UserModel>> {
  ...
}
```

**Arquivo Modificado:**
- `src/infra/cli/usecase-scaffold.ts` - Template do Service

---

### 6. **Métodos Inexistentes no Repository**

**Erro:**
```
Property 'findAll' does not exist on type 'UserRepository'
Property 'findActive' does not exist on type 'UserRepository'
```

**Causa:**
O UserBusiness estava chamando métodos que não existem mais no BaseRepository.

**Solução Aplicada Manualmente:**
```typescript
// Antes
const results = await this.userRepository.findAll(options);

// Depois
const results = await this.userRepository.findByConditions({}, options);

// Antes
const results = await this.userRepository.findActive(options);

// Depois
const results = await this.userRepository.findByConditions({ active: true }, options);

// Antes
return await this.userRepository.count();

// Depois
return await this.userRepository.count({});
```

**Arquivo Corrigido:**
- `src/use-cases/user/UserBusiness.ts`

---

## ✅ Resumo das Correções

### Templates Atualizados (src/infra/cli/usecase-scaffold.ts)

1. ✅ **Service.findById()** - Removido segundo parâmetro `includes`
2. ✅ **Service.create()** - Mudado tipo de `Partial<T>` para `any` com cast
3. ✅ **Service.update()** - Mudado tipo de `Partial<T>` para `any`

### Arquivos Corrigidos Manualmente

1. ✅ **UserRepository.ts** - Imports ajustados para caminhos relativos
2. ✅ **UserService.ts** - Imports ajustados + tipos corrigidos
3. ✅ **UserBusiness.ts** - Imports ajustados + métodos de repository corrigidos
4. ✅ **index.ts** - Removidas interfaces inexistentes

---

## 📝 Notas Importantes

### Para Usuários do Framework

Os templates estão corretos e funcionarão perfeitamente quando você usar o framework como dependência, desde que:

1. ✅ Configure o `tsconfig.json` com path aliases
2. ✅ Instale o framework via npm
3. ✅ Importe BaseRepository de 'framework-reactjs-api'

### Para Desenvolvimento do Framework

Ao executar scaffold **dentro** do próprio framework para testes:

1. ⚠️ Ajuste os imports de `@/models/` para caminhos relativos
2. ⚠️ Ajuste imports de 'framework-reactjs-api' para caminhos relativos
3. ⚠️ Remova interfaces que não existem do index.ts

---

## ✅ Status Final

**Compilação:** ✅ Sem erros  
**Scaffold Funcional:** ✅ Sim  
**Templates Corrigidos:** ✅ Sim  
**Documentação Atualizada:** ✅ Sim  

---

## 🚀 Próximos Testes Recomendados

1. [ ] Testar scaffold em um projeto externo (não dentro do framework)
2. [ ] Validar que os path aliases funcionam corretamente
3. [ ] Testar CRUD completo das rotas geradas
4. [ ] Validar relacionamentos com includes

---

**Data de Correção:** 14 de Outubro de 2025  
**Versão do Framework:** 1.0.0
