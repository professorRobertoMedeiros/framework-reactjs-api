#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Obtenha o diretório do projeto do usuário
const projectDir = process.cwd();

(async () => {
  try {
    // Verificar se existe package.json no projeto do usuário
    const packageJsonPath = path.join(projectDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Verificar se o projeto tem script de build
      if (packageJson.scripts && packageJson.scripts.build) {
        console.log('🔨 Executando build do projeto...');
        
        try {
          execSync('npm run build', {
            cwd: projectDir,
            stdio: 'inherit'
          });
          console.log('✅ Build do projeto concluído com sucesso!');
        } catch (buildError) {
          console.error('❌ Erro ao executar build do projeto:', buildError);
          process.exit(1);
        }
      } else {
        console.log('⚠️  Nenhum script "build" encontrado no package.json do projeto.');
        console.log('   Continuando com a sincronização...');
      }
    }
    
    console.log(`\n🔄 Sincronizando esquema do banco de dados no diretório: ${projectDir}`);
    
    // Agora execute a sincronização
    const { syncSchema } = require('../dist/infra/cli/schema-sync');
    await syncSchema();
    
    console.log('✅ Esquema sincronizado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao sincronizar esquema:', error);
    process.exit(1);
  }
})();
