"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigration = runMigration;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CustomORM_1 = require("../db/CustomORM");
// Função para executar migrações SQL a partir do diretório de migrações
async function runMigration(customMigrationsDir) {
    console.log('\x1b[34m=== Framework TypeScript DDD - Executor de Migrações ===\x1b[0m');
    const errors = [];
    try {
        console.log('\x1b[34mIniciando execução de migrações...\x1b[0m');
        // Inicializar ORM
        const orm = (0, CustomORM_1.initializeORM)();
        console.log('\x1b[32mConexão estabelecida com o banco de dados\x1b[0m');
        // Lista para armazenar todos os diretórios de migrações a serem processados
        const migrationDirs = [];
        // 1. Adicionar diretório de migrações do framework (se existir)
        // Para determinar o diretório do framework, usamos o módulo atual
        const frameworkDir = path.dirname(path.dirname(path.dirname(__dirname)));
        const frameworkMigrationsDir = path.join(frameworkDir, 'dist', 'infra', 'migrations');
        if (fs.existsSync(frameworkMigrationsDir) &&
            fs.readdirSync(frameworkMigrationsDir).some(file => file.endsWith('.sql'))) {
            migrationDirs.push(frameworkMigrationsDir);
            console.log(`\x1b[34mEncontrado diretório de migrações do framework: ${frameworkMigrationsDir}\x1b[0m`);
        }
        // 2. Adicionar diretório de migrações do projeto (personalizado ou padrão)
        const projectDir = process.cwd();
        const projectMigrationsDir = customMigrationsDir || path.join(projectDir, 'src', 'infra', 'migrations');
        // Tentar diretório alternativo se o padrão não existir
        if (fs.existsSync(projectMigrationsDir)) {
            migrationDirs.push(projectMigrationsDir);
            console.log(`\x1b[34mUsando diretório de migrações do projeto: ${projectMigrationsDir}\x1b[0m`);
        }
        else {
            const altProjectMigrationsDir = path.join(projectDir, 'migrations');
            if (fs.existsSync(altProjectMigrationsDir)) {
                migrationDirs.push(altProjectMigrationsDir);
                console.log(`\x1b[34mUsando diretório alternativo de migrações do projeto: ${altProjectMigrationsDir}\x1b[0m`);
            }
            else {
                console.log('\x1b[33mNenhum diretório de migrações do projeto encontrado\x1b[0m');
            }
        }
        // Verificar se temos diretórios para processar
        if (migrationDirs.length === 0) {
            console.log('\x1b[33mNenhum diretório de migrações encontrado\x1b[0m');
            return { success: true, errors: [] };
        }
        // Processar cada diretório de migrações
        let totalMigrations = 0;
        for (const dir of migrationDirs) {
            const migrationFiles = fs.readdirSync(dir)
                .filter(file => file.endsWith('.sql'));
            if (migrationFiles.length > 0) {
                totalMigrations += migrationFiles.length;
                console.log(`\x1b[34mEncontradas ${migrationFiles.length} migrações em ${dir}\x1b[0m`);
                try {
                    // Executar migrações de cada diretório
                    await orm.runMigrations(dir);
                }
                catch (sqlError) {
                    // Formatar uma mensagem de erro mais clara
                    let errorMessage;
                    if (sqlError.code === 'ECONNREFUSED') {
                        errorMessage = 'Erro de conexão com o banco de dados. Verifique se o banco está disponível e as credenciais estão corretas no arquivo .env';
                    }
                    else if (sqlError.message) {
                        errorMessage = `Erro ao executar migração SQL em ${dir}: ${sqlError.message}`;
                    }
                    else if (typeof sqlError === 'object') {
                        errorMessage = `Erro ao executar migração SQL em ${dir}: ${JSON.stringify(sqlError)}`;
                    }
                    else {
                        errorMessage = `Erro ao executar migração SQL em ${dir}: ${sqlError}`;
                    }
                    console.error(`\x1b[31m${errorMessage}\x1b[0m`);
                    errors.push(errorMessage);
                    return { success: false, errors };
                }
            }
        }
        if (totalMigrations === 0) {
            console.log('\x1b[33mNenhuma migração encontrada em nenhum diretório\x1b[0m');
        }
        else {
            console.log(`\x1b[32mProcesso de migração finalizado com sucesso! Total de ${totalMigrations} migrações processadas.\x1b[0m`);
        }
        return { success: true, errors: [] };
    }
    catch (error) {
        const errorMsg = `Erro ao executar migrações: ${error.message || error}`;
        console.error(`\x1b[31m${errorMsg}\x1b[0m`);
        errors.push(errorMsg);
        return { success: false, errors };
    }
}
// Função para sincronizar esquema com base nos modelos
async function syncSchema() {
    console.log('\x1b[34m=== Framework TypeScript DDD - Sincronização de Esquema ===\x1b[0m');
    try {
        // Inicializar ORM
        const orm = (0, CustomORM_1.initializeORM)();
        // Diretório de modelos
        const modelsDir = path.join(process.cwd(), 'src', 'core', 'domain', 'models');
        // Carregar e registrar todos os modelos encontrados
        console.log('\x1b[33mCarregando modelos...\x1b[0m');
        let hasErrors = false;
        const files = fs.readdirSync(modelsDir);
        for (const file of files) {
            if (file.endsWith('Model.ts') && file !== 'BaseModel.ts') {
                try {
                    // Caminho relativo para importação
                    const relativePath = path.relative(process.cwd(), path.join(modelsDir, file)).replace('.ts', '');
                    const modulePath = `../../${relativePath}`;
                    console.log(`\x1b[33mCarregando modelo: ${file}\x1b[0m`);
                    // Importar dinamicamente o modelo
                    const modelModule = require(modulePath);
                    // Buscar a classe correta (assumindo que é a primeira classe exportada)
                    const modelClass = Object.values(modelModule)[0];
                    // Registrar modelo no ORM
                    if (modelClass && typeof modelClass === 'function' &&
                        'getTableName' in modelClass && 'getColumns' in modelClass) {
                        orm.registerModel(modelClass);
                        console.log(`\x1b[32mModelo ${file} registrado com sucesso!\x1b[0m`);
                    }
                    else {
                        console.error(`\x1b[31mErro: ${file} não exporta um modelo válido\x1b[0m`);
                        hasErrors = true;
                    }
                }
                catch (error) {
                    console.error(`\x1b[31mErro ao carregar modelo ${file}:\x1b[0m`, error);
                    hasErrors = true;
                }
            }
        }
        if (hasErrors) {
            console.error('\x1b[31mEncontrados erros ao carregar modelos. Abortando sincronização de esquema.\x1b[0m');
            process.exit(1);
        }
        // Sincronizar esquema
        console.log('\x1b[33mSincronizando esquema...\x1b[0m');
        await orm.syncSchema();
        console.log('\x1b[32mEsquema sincronizado com sucesso!\x1b[0m');
    }
    catch (error) {
        console.error('\x1b[31mErro ao sincronizar esquema:\x1b[0m', error);
        process.exit(1);
    }
}
// Função principal
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    if (command === 'sync') {
        await syncSchema();
    }
    else {
        await runMigration();
    }
}
// Executar o script apenas se for chamado diretamente (não quando importado)
if (require.main === module) {
    main().catch(error => {
        console.error('\x1b[31mErro fatal:\x1b[0m', error);
        process.exit(1);
    });
}
//# sourceMappingURL=migration-runner.js.map