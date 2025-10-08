#!/usr/bin/env node

const { syncSchema } = require('../dist/infra/cli/schema-sync');

// Obtenha o diretório do projeto do usuário
const projectDir = process.cwd();

// Executar sincronização de esquema
(async () => {
  try {
    console.log(`Sincronizando esquema do banco de dados no diretório: ${projectDir}`);
    
    // Execute a função de sincronização
    await syncSchema();
    
    console.log('✅ Esquema sincronizado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao sincronizar esquema:', error);
    process.exit(1);
  }
})();