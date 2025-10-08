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
          // Note: Isso funciona apenas em runtime. Para desenvolvimento,
          // importações estáticas são preferíveis.
          // Por exemplo, no caso do UserModel:
          if (file === 'UserModel.ts') {
            const { UserModel } = require('../../core/domain/models/UserModel');
            orm.registerModel(UserModel as typeof BaseModel);
            console.log(`\x1b[32mModelo ${file} registrado com sucesso!\x1b[0m`);
          }
          // Adicione outros modelos conforme necessário
          
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