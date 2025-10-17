#!/usr/bin/env node

const { runMigration } = require('../dist/infra/cli/migration-runner');

// Obtenha o diretório do projeto do usuário
const projectDir = process.cwd();

// Executar as migrações com as opções do CLI
(async () => {
  try {
    console.log(`Executando migrações no diretório: ${projectDir}`);
    
    // Passe os argumentos da linha de comando para a função
    const result = await runMigration();
    
    if (result.success) {
      console.log('✅ Migrações concluídas com sucesso!');
      process.exit(0);
    } else {
      console.error('❌ Migrações concluídas com erros:');
      result.errors.forEach((err, index) => {
        console.error(`   ${index + 1}. ${err}`);
      });
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro fatal ao executar migrações:', error);
    process.exit(1);
  }
})();