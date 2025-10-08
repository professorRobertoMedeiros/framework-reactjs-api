#!/usr/bin/env node

const { scaffoldUseCase } = require('../dist/infra/cli/usecase-scaffold');

// Obtenha o diretório do projeto do usuário
const projectDir = process.cwd();

// Obter os argumentos da linha de comando
const args = process.argv.slice(2);
const modelName = args[0];

if (!modelName) {
  console.error('❌ Erro: Nome do modelo não fornecido.');
  console.log('Uso: npx framework-reactjs-api-scaffold <NomeDoModelo>');
  console.log('Exemplo: npx framework-reactjs-api-scaffold Product');
  process.exit(1);
}

// Executar o scaffolding
try {
  console.log(`Gerando scaffolding para o modelo "${modelName}" no diretório: ${projectDir}`);
  scaffoldUseCase(modelName);
  console.log(`✅ Scaffolding para ${modelName} criado com sucesso!`);
} catch (error) {
  console.error('❌ Erro ao gerar scaffolding:', error);
  process.exit(1);
}