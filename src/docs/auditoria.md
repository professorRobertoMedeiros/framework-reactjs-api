# Sistema de Auditoria

O sistema de auditoria permite rastrear alterações em modelos específicos, registrando quem criou, alterou ou deletou dados, bem como os valores antigos e novos. Apenas as colunas marcadas para auditoria serão rastreadas.

## Tabela `audit_logs`

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(255) NOT NULL,
  record_id INTEGER NOT NULL,
  column_name VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  old_value TEXT,
  new_value TEXT,
  user_id INTEGER,
  user_email VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Configurando Colunas Auditáveis

Use o decorador `@Auditable()` para marcar as colunas que devem ser auditadas:

```typescript
import { BaseModel, Entity, Column, Id } from 'framework-reactjs-api';
import { Auditable } from 'framework-reactjs-api';

@Entity('produtos')
export class ProdutoModel extends BaseModel {
  @Id()
  id!: number;
  
  @Column({ type: 'VARCHAR', nullable: false })
  @Auditable() // Auditar em todas as operações (create, update, delete)
  nome!: string;
  
  @Column({ type: 'TEXT', nullable: true })
  @Auditable({ onCreate: true, onUpdate: true, onDelete: false }) // Não auditar na deleção
  descricao?: string;
  
  @Column({ type: 'DECIMAL', nullable: false })
  @Auditable({ onCreate: false, onUpdate: true, onDelete: true }) // Não auditar na criação
  preco!: number;
  
  @Column({ type: 'INTEGER', nullable: false })
  estoque!: number; // Sem decorador @Auditable - não será auditada
}
```

### Opções do Decorador `@Auditable`

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `onCreate` | boolean | `true` | Auditar quando o registro for criado |
| `onUpdate` | boolean | `true` | Auditar quando o registro for atualizado |
| `onDelete` | boolean | `true` | Auditar quando o registro for excluído |

## Habilitando Auditoria no Repositório

```typescript
import { BaseRepository, AuditUser } from 'framework-reactjs-api';
import { ProdutoModel } from './ProdutoModel';

export class ProdutoRepository extends BaseRepository<ProdutoModel> {
  constructor(currentUser?: AuditUser) {
    // Parâmetros: Modelo, habilitar auditoria, usuário atual
    super(ProdutoModel, true, currentUser);
  }
}
```

## Definindo o Usuário Atual

```typescript
// Ao criar o repositório
const userLogado = { id: 1, email: 'usuario@example.com' };
const produtoRepo = new ProdutoRepository(userLogado);

// Ou posteriormente
produtoRepo.setAuditUser({ id: 2, email: 'outro@example.com' });
```

## Consultando o Histórico de Alterações

```typescript
import { AuditService } from 'framework-reactjs-api';

// Criar serviço de auditoria
const auditService = new AuditService();

// Obter histórico completo de um registro
const historico = await auditService.getRecordHistory('produtos', 123);

// Obter histórico de uma coluna específica
const historicoPreco = await auditService.getColumnHistory('produtos', 123, 'preco');

// Exemplo de saída:
// [
//   {
//     id: 1,
//     tableName: 'produtos',
//     recordId: 123,
//     columnName: 'preco',
//     actionType: 'UPDATE',
//     oldValue: '29.90',
//     newValue: '34.90',
//     userId: 1,
//     userEmail: 'usuario@example.com',
//     createdAt: '2025-10-21T14:30:15.123Z'
//   },
//   ...
// ]
```

## Comportamento Padrão

- Apenas colunas marcadas com `@Auditable` serão auditadas
- Alterações em colunas não marcadas não geram registros de auditoria
- O sistema audita automaticamente nas operações CRUD do BaseRepository
- A auditoria funciona tanto para exclusão física quanto para soft delete