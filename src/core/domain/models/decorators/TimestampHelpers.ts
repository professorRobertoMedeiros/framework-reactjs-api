import { TIMESTAMPS_METADATA_KEY, TimestampsOptions } from './Timestamps';
import { SOFT_DELETE_METADATA_KEY, SoftDeleteOptions } from './SoftDelete';

// Função para verificar se uma classe tem o decorador Timestamps
export function hasTimestamps(target: Function): boolean {
  return Reflect.getMetadata(TIMESTAMPS_METADATA_KEY, target) !== undefined;
}

// Função para verificar se uma classe tem o decorador SoftDelete
export function hasSoftDelete(target: Function): boolean {
  return Reflect.getMetadata(SOFT_DELETE_METADATA_KEY, target) !== undefined;
}

// Função para obter o nome do campo created_at
export function getCreatedAtField(target: Function): string {
  const metadata = Reflect.getMetadata(TIMESTAMPS_METADATA_KEY, target) as TimestampsOptions;
  return metadata?.createdAt || 'created_at';
}

// Função para obter o nome do campo updated_at
export function getUpdatedAtField(target: Function): string {
  const metadata = Reflect.getMetadata(TIMESTAMPS_METADATA_KEY, target) as TimestampsOptions;
  return metadata?.updatedAt || 'updated_at';
}

// Função para obter o nome do campo deleted_at
export function getDeletedAtField(target: Function): string {
  const metadata = Reflect.getMetadata(SOFT_DELETE_METADATA_KEY, target) as SoftDeleteOptions;
  return metadata?.deletedAt || 'deleted_at';
}