import 'reflect-metadata';
export declare const TIMESTAMPS_METADATA_KEY: unique symbol;
export interface TimestampsOptions {
    createdAt?: string;
    updatedAt?: string;
}
export declare function Timestamps(options?: TimestampsOptions): (target: Function) => void;
export declare function getTimestampsMetadata(target: Function): TimestampsOptions | undefined;
