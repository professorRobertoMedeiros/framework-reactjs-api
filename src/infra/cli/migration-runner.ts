import * as fs from 'fs';
import * as path from 'path';
import { CustomORM, initializeORM } from '../db/CustomORM';
import { BaseModel } from '../../core/domain/models/BaseModel';

// Função para executar migrações SQL a partir do diretório de migrações
export async function runMigration(customMigrationsDir?: string) {
  console.log('\x1b[34m=== Framework TypeScript DDD - Executor de Migrações ===\x1b[0m');
  
  try {
    // Inicializar ORM
    const orm = initializeORM();
    
    // Diretório de migrações (padrão ou personalizado)
    const migrationsDir = customMigrationsDir || 
                         path.join(process.cwd(), 'src', 'infra', 'migrations');
    
    // Tentar diretório alternativo se o padrão não existir
    let migrationsDirToUse = migrationsDir;
    if (!fs.existsSync(migrationsDir)) {
      const altMigrationsDir = path.join(process.cwd(), 'migrations');
      if (fs.existsSync(altMigrationsDir)) {
        migrationsDirToUse = altMigrationsDir;
        console.log(`\x1b[33mUsando diretório de migrações alternativo: ${altMigrationsDir}\x1b[0m`);
      } else {
        console.log('\x1b[33mDiretório de migrações não encontrado. Criando...\x1b[0m');
        fs.mkdirSync(migrationsDir, { recursive: true });
        migrationsDirToUse = migrationsDir;
      }
    }
    
    // Executar migrações
    await orm.runMigrations(migrationsDirToUse);
    
    // Registrar os modelos
    console.log('\x1b[34mRegistrando modelos de domínio...\x1b[0m');
    
    // Tentar encontrar diretório de modelos (diferentes estruturas possíveis)
    const possibleModelsPaths = [
      path.join(process.cwd(), 'src', 'core', 'domain', 'models'),
      path.join(process.cwd(), 'src', 'models'),
      path.join(process.cwd(), 'models')
    ];
    
    // Usar o primeiro diretório de modelos que existir
    const modelsDir = possibleModelsPaths.find(dir => fs.existsSync(dir));
    
    if (!modelsDir) {
      console.log('\x1b[33mDiretório de modelos não encontrado. Verifique sua estrutura de projeto.\x1b[0m');
      return;
    }
    
    console.log(`\x1b[34mUsando diretório de modelos: ${modelsDir}\x1b[0m`);
    
    // Processar todos os modelos
    const modelFiles = fs.readdirSync(modelsDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
    console.log(`\x1b[34mEncontrados ${modelFiles.length} arquivos de modelo\x1b[0m`);
    
    let hasErrors = false;
    
    for (const file of modelFiles) {
      try {
        const modulePath = path.join(modelsDir, file);
        console.log(`\x1b[34mProcessando modelo: ${file}...\x1b[0m`);
        
        // Importar dinamicamente o modelo
        const modelModule = require(modulePath);
        
        // Buscar a classe correta (assumindo que é a primeira classe exportada)
        const modelClass = Object.values(modelModule)[0];
        
        // Registrar modelo no ORM
        if (modelClass && typeof modelClass === 'function' && 
            'getTableName' in modelClass && 'getColumns' in modelClass) {
          orm.registerModel(modelClass as typeof BaseModel);
          console.log(`\x1b[32mModelo ${file} registrado com sucesso!\x1b[0m`);
        } else {
          console.error(`\x1b[31mErro: ${file} não exporta um modelo válido\x1b[0m`);
          hasErrors = true;
        }
      } catch (error) {
        console.error(`\x1b[31mErro ao processar modelo ${file}:\x1b[0m`, error);
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      console.warn('\x1b[33mAlguns modelos não puderam ser registrados\x1b[0m');
    }
    
    console.log('\x1b[32mProcesso de migração finalizado com sucesso!\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mErro ao executar migrações:\x1b[0m', error);
    process.exit(1);
  }
}

// Função para sincronizar esquema com base nos modelos
async function syncSchema() {
  console.log('\x1b[34m=== Framework TypeScript DDD - Sincronização de Esquema ===\x1b[0m');
  
  try {
    // Inicializar ORM
    const orm = initializeORM();
    
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
          const relativePath = path.relative(
            process.cwd(),
            path.join(modelsDir, file)
          ).replace('.ts', '');
          
          const modulePath = `../../${relativePath}`;
          console.log(`\x1b[33mCarregando modelo: ${file}\x1b[0m`);
          
          // Importar dinamicamente o modelo
          const modelModule = require(modulePath);
          
          // Buscar a classe correta (assumindo que é a primeira classe exportada)
          const modelClass = Object.values(modelModule)[0];
          
          // Registrar modelo no ORM
          if (modelClass && typeof modelClass === 'function' && 
              'getTableName' in modelClass && 'getColumns' in modelClass) {
            orm.registerModel(modelClass as typeof BaseModel);
            console.log(`\x1b[32mModelo ${file} registrado com sucesso!\x1b[0m`);
          } else {
            console.error(`\x1b[31mErro: ${file} não exporta um modelo válido\x1b[0m`);
            hasErrors = true;
          }
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
    await runMigration();
  }
}

// Executar o script
main().catch(error => {
  console.error('\x1b[31mErro fatal:\x1b[0m', error);
  process.exit(1);
});