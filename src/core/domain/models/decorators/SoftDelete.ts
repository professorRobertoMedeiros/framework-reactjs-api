import 'reflect-metadata';

export const SOFT_DELETE_METADATA_KEY = Symbol('soft-delete');

export interface SoftDeleteOptions {
    deletedAt?: string;
}

export function SoftDelete(options?: SoftDeleteOptions) {
    const defaultOptions: SoftDeleteOptions = {
        deletedAt: 'deleted_at'
    };

    const finalOptions = { ...defaultOptions, ...options };

    return function (target: Function) {
        Reflect.defineMetadata(SOFT_DELETE_METADATA_KEY, finalOptions, target);
    };
}

export function getSoftDeleteMetadata(target: Function): SoftDeleteOptions | undefined {
    return Reflect.getMetadata(SOFT_DELETE_METADATA_KEY, target);
}