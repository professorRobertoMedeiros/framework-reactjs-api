export declare function runMigration(customMigrationsDir?: string): Promise<{
    success: boolean;
    errors: string[];
}>;
