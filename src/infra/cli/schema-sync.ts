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
    
    // Tentar encontrar diretório de modelos (diferentes estruturas possíveis)
    const possibleModelsPaths = [
      path.join(process.cwd(), 'src', 'core', 'domain', 'models'),
      path.join(process.cwd(), 'src', 'models'),
      path.join(process.cwd(), 'models')
    ];
    
    // Usar o primeiro diretório de modelos que existir
    const modelsDir = possibleModelsPaths.find(dir => fs.existsSync(dir));
    
    if (!modelsDir) {
      console.error('\x1b[31mErro: Diretório de modelos não encontrado. Verifique sua estrutura de projeto.\x1b[0m');
      process.exit(1);
    }
    
    // Carregar e registrar todos os modelos encontrados
    console.log(`\x1b[33mCarregando modelos de ${modelsDir}...\x1b[0m`);
    
    let hasErrors = false;
    const files = fs.readdirSync(modelsDir);
    
    for (const file of files) {
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
        } catch (error) {
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

// Executar o script
main().catch(error => {
  console.error('\x1b[31mErro fatal:\x1b[0m', error);
  process.exit(1);
});