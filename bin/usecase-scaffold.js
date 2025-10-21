#!/usr/bin/env node

const { scaffoldUseCase } = require('../dist/infra/cli/usecase-scaffold');

// Obtenha o diretório do projeto do usuário
const projectDir = process.cwd();

// Obter os argumentos da linha de comando
const args = process.argv.slice(2);

// Verificar se o primeiro argumento é um comando especial
let command = 'create';
let modelName;

if (args.length >= 2 && args[0] === 'update-dom') {
  command = 'update-dom';
  modelName = args[1];
} else {
  modelName = args[0];
}

if (!modelName) {
  console.error('❌ Erro: Nome do modelo não fornecido.');
  console.log('Uso: npx framework-reactjs-api-scaffold <NomeDoModelo>');
  console.log('     npx framework-reactjs-api-scaffold update-dom <NomeDoModelo>');
  console.log('Exemplo: npx framework-reactjs-api-scaffold Product');
  console.log('         npx framework-reactjs-api-scaffold update-dom Product');
  process.exit(1);
}

// Executar o scaffolding
try {
  if (command === 'update-dom') {
    console.log(`Atualizando Dom para o modelo "${modelName}" no diretório: ${projectDir}`);
    // Como o update-dom ainda não está exportado, usamos o scaffoldUseCase com o flag especial
    process.argv = [process.argv[0], process.argv[1], 'update-dom', modelName];
    scaffoldUseCase(modelName);
    console.log(`✅ Dom para ${modelName} atualizado com sucesso!`);
  } else {
    console.log(`Gerando scaffolding para o modelo "${modelName}" no diretório: ${projectDir}`);
    scaffoldUseCase(modelName);
    console.log(`✅ Scaffolding para ${modelName} criado com sucesso!`);
  }
} catch (error) {
  console.error('❌ Erro:', error);
  process.exit(1);
}