import 'reflect-metadata';
export declare const SOFT_DELETE_METADATA_KEY: unique symbol;
export interface SoftDeleteOptions {
    deletedAt?: string;
}
export declare function SoftDelete(options?: SoftDeleteOptions): (target: Function) => void;
export declare function getSoftDeleteMetadata(target: Function): SoftDeleteOptions | undefined;
