import * as fs from 'fs';
import * as path from 'path';
import { BaseModel } from '../../core/domain/models/BaseModel';
import { CustomORM, initializeORM } from '../db/CustomORM';

// Função para executar migrações SQL a partir do diretório de migrações
async function runMigrations() {
  console.log('\x1b[34m=== Framework TypeScript DDD - Executor de Migrações ===\x1b[0m');
  
  try {
    // Inicializar ORM
    const orm = initializeORM();
    
    // Diretório de migrações
    const migrationsDir = path.join(process.cwd(), 'src', 'infra', 'migrations');
    
    // Verificar se o diretório existe
    if (!fs.existsSync(migrationsDir)) {
      console.log('\x1b[33mDiretório de migrações não encontrado. Criando...\x1b[0m');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Executar migrações
    await orm.runMigrations(migrationsDir);
    
    console.log('\x1b[32mProcesso de migração finalizado com sucesso!\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mErro ao executar migrações:\x1b[0m', error);
    process.exit(1);
  }
}

// Função para sincronizar esquema com base nos modelos
export async function syncSchema() {
  console.log('\x1b[34m=== Framework TypeScript DDD - Sincronização de Esquema ===\x1b[0m');
  
  try {
    // Inicializar ORM
    const orm = initializeORM();
    
    // Tentar encontrar diretório de modelos COMPILADOS (diferentes estruturas possíveis)
    // Prioriza arquivos .js (compilados) em dist/
    const possibleModelsPaths = [
      // Primeiro: tentar diretórios compilados (dist/)
      path.join(process.cwd(), 'dist', 'core', 'domain', 'models'),
      path.join(process.cwd(), 'dist', 'models'),
      path.join(process.cwd(), 'dist', 'src', 'models'),
      path.join(process.cwd(), 'dist', 'src', 'core', 'domain', 'models'),
      // Depois: tentar diretórios de código-fonte (src/) - apenas para desenvolvimento
      path.join(process.cwd(), 'src', 'core', 'domain', 'models'),
      path.join(process.cwd(), 'src', 'models'),
      path.join(process.cwd(), 'models')
    ];
    
    // Usar o primeiro diretório de modelos que existir
    let modelsDir = possibleModelsPaths.find(dir => fs.existsSync(dir));
    
    if (!modelsDir) {
      console.error('\x1b[31m❌ Erro: Diretório de modelos não encontrado.\x1b[0m');
      console.log('\x1b[33m\nEstrutura esperada:\x1b[0m');
      console.log('  • \x1b[36mdist/models/\x1b[0m (após compilar com npm run build)');
      console.log('  • \x1b[36mdist/core/domain/models/\x1b[0m');
      console.log('  • \x1b[36msrc/models/\x1b[0m (apenas desenvolvimento)');
      console.log('\n\x1b[33mVerifique:\x1b[0m');
      console.log('  1. O projeto foi compilado? Execute: \x1b[32mnpm run build\x1b[0m');
      console.log('  2. O tsconfig.json tem \x1b[32m"outDir": "./dist"\x1b[0m configurado?');
      console.log('  3. Os modelos estão em src/models/ ou src/core/domain/models/?');
      process.exit(1);
    }
    
    // Carregar e registrar todos os modelos encontrados
    console.log(`\x1b[33mCarregando modelos de ${modelsDir}...\x1b[0m`);
    
    // Verificar se existem arquivos compilados (.js) ou apenas TypeScript (.ts)
    const files = fs.readdirSync(modelsDir);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const tsFiles = files.filter(f => f.endsWith('.ts'));
    
    if (jsFiles.length === 0 && tsFiles.length > 0) {
      console.error('\x1b[31m❌ Erro: Modelos TypeScript encontrados, mas não compilados!\x1b[0m');
      console.log('\x1b[33m⚠️  O comando schema-sync requer que os modelos sejam compilados primeiro.\x1b[0m');
      console.log('\x1b[36m\nPor favor, execute:\x1b[0m');
      console.log('\x1b[32m  npm run build\x1b[0m');
      console.log('\x1b[36mE depois execute novamente:\x1b[0m');
      console.log('\x1b[32m  npx framework-reactjs-api-sync\x1b[0m\n');
      process.exit(1);
    }
    
    let hasErrors = false;
    const modelsToLoad = jsFiles.length > 0 ? jsFiles : tsFiles;
    
    for (const file of modelsToLoad) {
      const isModelFile = file.endsWith('Model.ts') || file.endsWith('Model.js');
      const isNotBaseModel = file !== 'BaseModel.ts' && file !== 'BaseModel.js';
      
      if (isModelFile && isNotBaseModel) {
        try {
          const absoluteModulePath = path.join(modelsDir, file);
          const moduleName = file.replace(/\.(ts|js)$/, '');
          console.log(`\x1b[33mCarregando modelo: ${file}\x1b[0m`);

          // Importa o modelo
          const modelModule = require(absoluteModulePath);
          const modelName = Object.keys(modelModule).find(key => key.includes('Model'));
          
          if (!modelName) {
            console.warn(`\x1b[31mNenhuma classe Model encontrada em ${file}\x1b[0m`);
            continue;
          }
          
          const Model = modelModule[modelName];
          const model = new Model();
          console.log(`\x1b[32m✓ Modelo ${modelName} carregado com sucesso\x1b[0m`);
        } catch (error) {
          console.error(`\x1b[31m✗ Erro ao carregar modelo ${file}:\x1b[0m`, error);
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
  } catch (error) {
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
  } else {
    await runMigrations();
  }
}

// Executar o script apenas se for chamado diretamente (não quando importado)
if (require.main === module) {
  main().catch(error => {
    console.error('\x1b[31mErro fatal:\x1b[0m', error);
    process.exit(1);
  });
}