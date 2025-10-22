import 'reflect-metadata';

export const TIMESTAMPS_METADATA_KEY = Symbol('timestamps');

export interface TimestampsOptions {
    createdAt?: string;
    updatedAt?: string;
}

export function Timestamps(options?: TimestampsOptions) {
    const defaultOptions: TimestampsOptions = {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    };

    const finalOptions = { ...defaultOptions, ...options };

    return function (target: Function) {
        Reflect.defineMetadata(TIMESTAMPS_METADATA_KEY, finalOptions, target);
    };
}

export function getTimestampsMetadata(target: Function): TimestampsOptions | undefined {
    return Reflect.getMetadata(TIMESTAMPS_METADATA_KEY, target);
}