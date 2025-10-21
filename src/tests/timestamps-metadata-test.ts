// Teste para verificar os metadados dos decoradores Timestamps e SoftDelete
import 'reflect-metadata';
import { BaseModel, Entity, Column, Id } from '../core/domain/models/BaseModel';
import { Timestamps, SoftDelete, TIMESTAMPS_META_KEY, SOFT_DELETE_META_KEY } from '../core/domain/decorators/TimestampsDecorators';

// Modelo de teste
@Entity('test_table')
@Timestamps()
@SoftDelete()
class TestModel extends BaseModel {
  @Id()
  id!: number;
  
  @Column({ type: 'VARCHAR', nullable: false })
  name!: string;
}

// Verificar metadados
console.log('=== Teste de Metadados para Timestamps e SoftDelete ===');
console.log('TIMESTAMPS_META_KEY:', String(TIMESTAMPS_META_KEY));
console.log('SOFT_DELETE_META_KEY:', String(SOFT_DELETE_META_KEY));

// Verificar se os metadados estão sendo definidos corretamente
const timestampsMetadata = Reflect.getMetadata(TIMESTAMPS_META_KEY, TestModel);
const softDeleteMetadata = Reflect.getMetadata(SOFT_DELETE_META_KEY, TestModel);

console.log('Metadados de Timestamps:', timestampsMetadata);
console.log('Metadados de SoftDelete:', softDeleteMetadata);

// Verificar todas as chaves de metadados disponíveis
console.log('Todas as chaves de metadados:', Reflect.getMetadataKeys(TestModel).map(String));