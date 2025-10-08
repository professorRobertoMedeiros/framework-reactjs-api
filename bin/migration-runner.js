#!/usr/bin/env node

const { runMigration } = require('../dist/infra/cli/migration-runner');

// Obtenha o diretório do projeto do usuário
const projectDir = process.cwd();

// Executar as migrações com as opções do CLI
(async () => {
  try {
    console.log(`Executando migrações no diretório: ${projectDir}`);
    
    // Passe os argumentos da linha de comando para a função
    await runMigration();
    
    console.log('✅ Migrações concluídas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    process.exit(1);
  }
})();