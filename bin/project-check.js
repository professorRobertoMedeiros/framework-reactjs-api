#!/usr/bin/env node

/**
 * Ferramenta de verificação de integridade para projetos usando framework-reactjs-api
 * Verifica a estrutura do projeto, configuração e problemas comuns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Projeto atual
const projectDir = process.cwd();
console.log(`${colors.blue}=== Framework ReactJS API - Verificação de Projeto ===${colors.reset}`);
console.log(`Verificando projeto em: ${projectDir}`);

// Status de erros
let errors = [];
let warnings = [];
let success = [];

// Função para verificar se um arquivo/diretório existe
function checkExists(filePath, description, isDirectory = false, isRequired = true) {
  const fullPath = path.join(projectDir, filePath);
  const exists = fs.existsSync(fullPath);
  const type = isDirectory ? "diretório" : "arquivo";
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    const isCorrectType = isDirectory ? stats.isDirectory() : stats.isFile();
    
    if (isCorrectType) {
      success.push(`✅ ${description} encontrado: ${filePath}`);
      return true;
    } else {
      const wrongType = isDirectory ? "arquivo" : "diretório";
      errors.push(`❌ ${description} deveria ser um ${type}, mas é um ${wrongType}: ${filePath}`);
      return false;
    }
  } else if (isRequired) {
    errors.push(`❌ ${description} não encontrado: ${filePath}`);
    return false;
  } else {
    warnings.push(`⚠️ ${description} não encontrado (opcional): ${filePath}`);
    return false;
  }
}

// Verificar package.json
function checkPackageJson() {
  const packageJsonPath = path.join(projectDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    errors.push('❌ package.json não encontrado');
    return;
  }
  
  try {
    const packageJson = require(packageJsonPath);
    
    // Verificar dependências
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Verificar framework-reactjs-api
    if (dependencies['framework-reactjs-api']) {
      success.push(`✅ framework-reactjs-api encontrado na versão ${dependencies['framework-reactjs-api']}`);
    } else {
      errors.push('❌ framework-reactjs-api não encontrado nas dependências');
    }
    
    // Verificar express
    if (dependencies['express']) {
      success.push(`✅ express encontrado na versão ${dependencies['express']}`);
    } else {
      warnings.push('⚠️ express não encontrado nas dependências');
    }
    
    // Verificar typescript
    if (dependencies['typescript']) {
      success.push(`✅ typescript encontrado na versão ${dependencies['typescript']}`);
    } else {
      warnings.push('⚠️ typescript não encontrado nas dependências');
    }
    
  } catch (error) {
    errors.push(`❌ Erro ao analisar package.json: ${error.message}`);
  }
}

// Verificar estrutura de diretórios
function checkDirectoryStructure() {
  console.log(`\n${colors.blue}Verificando estrutura de diretórios...${colors.reset}`);
  
  // Verificar src
  checkExists('src', 'Diretório de código-fonte', true);
  
  // Verificar modelos
  const modelDirs = [
    'src/models',
    'src/core/domain/models',
    'models'
  ];
  
  let modelDirFound = false;
  for (const dir of modelDirs) {
    if (fs.existsSync(path.join(projectDir, dir))) {
      success.push(`✅ Diretório de modelos encontrado: ${dir}`);
      modelDirFound = true;
      
      // Verificar arquivos de modelo
      const modelFiles = fs.readdirSync(path.join(projectDir, dir))
        .filter(file => file.endsWith('Model.ts') || file.endsWith('Model.js'));
      
      if (modelFiles.length > 0) {
        success.push(`✅ Encontrados ${modelFiles.length} arquivos de modelo em ${dir}`);
        
        // Verificar conteúdo dos modelos
        checkModelFiles(dir, modelFiles);
      } else {
        warnings.push(`⚠️ Nenhum arquivo de modelo encontrado em ${dir}`);
      }
      
      break;
    }
  }
  
  if (!modelDirFound) {
    warnings.push('⚠️ Diretório de modelos não encontrado');
  }
  
  // Verificar diretório de migrações
  const migrationDirs = [
    'migrations',
    'src/infra/migrations'
  ];
  
  let migrationDirFound = false;
  for (const dir of migrationDirs) {
    if (fs.existsSync(path.join(projectDir, dir))) {
      success.push(`✅ Diretório de migrações encontrado: ${dir}`);
      migrationDirFound = true;
      
      // Verificar arquivos de migração
      const migrationFiles = fs.readdirSync(path.join(projectDir, dir))
        .filter(file => file.endsWith('.sql'));
      
      if (migrationFiles.length > 0) {
        success.push(`✅ Encontrados ${migrationFiles.length} arquivos de migração em ${dir}`);
      } else {
        warnings.push(`⚠️ Nenhum arquivo de migração (.sql) encontrado em ${dir}`);
      }
      
      break;
    }
  }
  
  if (!migrationDirFound) {
    warnings.push('⚠️ Diretório de migrações não encontrado');
  }
}

// Verificar arquivos de modelo
function checkModelFiles(dir, modelFiles) {
  for (const file of modelFiles) {
    const filePath = path.join(projectDir, dir, file);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Verificar decoradores básicos
      const hasEntityDecorator = content.includes('@Entity(');
      const hasIdDecorator = content.includes('@Id(');
      const hasColumnDecorator = content.includes('@Column(');
      const extendsBaseModel = content.includes('extends BaseModel');
      
      if (!hasEntityDecorator) {
        warnings.push(`⚠️ Modelo ${file} pode não ter o decorador @Entity`);
      }
      
      if (!hasIdDecorator) {
        warnings.push(`⚠️ Modelo ${file} pode não ter o decorador @Id`);
      }
      
      if (!hasColumnDecorator) {
        warnings.push(`⚠️ Modelo ${file} pode não ter decoradores @Column`);
      }
      
      if (!extendsBaseModel) {
        errors.push(`❌ Modelo ${file} não estende BaseModel`);
      }
      
      // Verificar erros de sintaxe
      try {
        // Não podemos executar completamente o TypeScript aqui
        // Mas podemos verificar erros básicos de sintaxe
        const syntaxErrors = checkBasicSyntax(content);
        if (syntaxErrors) {
          errors.push(`❌ Possíveis erros de sintaxe em ${file}: ${syntaxErrors}`);
        } else {
          success.push(`✅ Nenhum erro básico de sintaxe encontrado em ${file}`);
        }
      } catch (syntaxError) {
        errors.push(`❌ Erro ao verificar sintaxe em ${file}: ${syntaxError.message}`);
      }
      
    } catch (error) {
      errors.push(`❌ Erro ao ler modelo ${file}: ${error.message}`);
    }
  }
}

// Verificar erros básicos de sintaxe
function checkBasicSyntax(content) {
  // Verificar parênteses e chaves desbalanceados
  let openParens = 0, openBraces = 0, openBrackets = 0;
  
  for (let i = 0; i < content.length; i++) {
    switch (content[i]) {
      case '(': openParens++; break;
      case ')': openParens--; break;
      case '{': openBraces++; break;
      case '}': openBraces--; break;
      case '[': openBrackets++; break;
      case ']': openBrackets--; break;
    }
    
    // Se algum contador ficar negativo, há um erro de fechamento
    if (openParens < 0) return "Parêntese fechando sem abertura";
    if (openBraces < 0) return "Chave fechando sem abertura";
    if (openBrackets < 0) return "Colchete fechando sem abertura";
  }
  
  // No final, todos os contadores devem ser zero
  if (openParens > 0) return `${openParens} parênteses não fechados`;
  if (openBraces > 0) return `${openBraces} chaves não fechadas`;
  if (openBrackets > 0) return `${openBrackets} colchetes não fechados`;
  
  return null;
}

// Verificar configuração TypeScript
function checkTypeScriptConfig() {
  console.log(`\n${colors.blue}Verificando configuração do TypeScript...${colors.reset}`);
  
  const tsConfigPath = path.join(projectDir, 'tsconfig.json');
  
  if (!fs.existsSync(tsConfigPath)) {
    errors.push('❌ tsconfig.json não encontrado');
    return;
  }
  
  try {
    const tsConfig = require(tsConfigPath);
    
    // Verificar opções essenciais
    const compilerOptions = tsConfig.compilerOptions || {};
    
    // Verificar experimentalDecorators
    if (compilerOptions.experimentalDecorators === true) {
      success.push('✅ experimentalDecorators está habilitado');
    } else {
      errors.push('❌ experimentalDecorators não está habilitado em tsconfig.json');
    }
    
    // Verificar emitDecoratorMetadata
    if (compilerOptions.emitDecoratorMetadata === true) {
      success.push('✅ emitDecoratorMetadata está habilitado');
    } else {
      errors.push('❌ emitDecoratorMetadata não está habilitado em tsconfig.json');
    }
    
  } catch (error) {
    errors.push(`❌ Erro ao analisar tsconfig.json: ${error.message}`);
  }
}

// Verificar configuração de ambiente (.env)
function checkEnvConfig() {
  console.log(`\n${colors.blue}Verificando configuração de ambiente...${colors.reset}`);
  
  const envPath = path.join(projectDir, '.env');
  
  if (!fs.existsSync(envPath)) {
    warnings.push('⚠️ Arquivo .env não encontrado');
    return;
  }
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n').filter(line => line.trim().length > 0);
    
    // Verificar variáveis essenciais
    const envVars = {
      'DB_HOST': false,
      'DB_PORT': false,
      'DB_NAME': false,
      'DB_USER': false,
      'DB_PASSWORD': false,
      'JWT_SECRET': false
    };
    
    for (const line of envLines) {
      if (line.startsWith('#')) continue; // Pular comentários
      
      const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (match) {
        const key = match[1];
        const value = match[2];
        
        if (key in envVars) {
          envVars[key] = true;
          
          // Verificar valores vazios
          if (!value.trim()) {
            warnings.push(`⚠️ Variável de ambiente ${key} tem valor vazio`);
          }
        }
      }
    }
    
    // Verificar variáveis ausentes
    for (const [key, found] of Object.entries(envVars)) {
      if (found) {
        success.push(`✅ Variável de ambiente ${key} encontrada`);
      } else {
        warnings.push(`⚠️ Variável de ambiente ${key} não encontrada`);
      }
    }
    
  } catch (error) {
    errors.push(`❌ Erro ao ler arquivo .env: ${error.message}`);
  }
}

// Executar todas as verificações
function runChecks() {
  console.log(`\n${colors.blue}Verificando dependências e configuração...${colors.reset}`);
  
  // Verificar package.json
  checkPackageJson();
  
  // Verificar estrutura de diretórios
  checkDirectoryStructure();
  
  // Verificar configuração TypeScript
  checkTypeScriptConfig();
  
  // Verificar configuração de ambiente
  checkEnvConfig();
  
  // Exibir resultados
  console.log(`\n${colors.blue}=== Relatório de Verificação ===${colors.reset}`);
  
  if (success.length > 0) {
    console.log(`\n${colors.green}Verificações bem-sucedidas:${colors.reset}`);
    success.forEach(msg => console.log(`  ${msg}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n${colors.yellow}Avisos:${colors.reset}`);
    warnings.forEach(msg => console.log(`  ${msg}`));
  }
  
  if (errors.length > 0) {
    console.log(`\n${colors.red}Erros:${colors.reset}`);
    errors.forEach(msg => console.log(`  ${msg}`));
  }
  
  console.log(`\n${colors.blue}Resumo:${colors.reset}`);
  console.log(`  ${colors.green}${success.length} verificações bem-sucedidas${colors.reset}`);
  console.log(`  ${colors.yellow}${warnings.length} avisos${colors.reset}`);
  console.log(`  ${colors.red}${errors.length} erros${colors.reset}`);
  
  if (errors.length > 0) {
    console.log(`\n${colors.red}Seu projeto tem erros que precisam ser corrigidos.${colors.reset}`);
    return false;
  } else if (warnings.length > 0) {
    console.log(`\n${colors.yellow}Seu projeto tem avisos que podem ser melhorados.${colors.reset}`);
    return true;
  } else {
    console.log(`\n${colors.green}Seu projeto está configurado corretamente!${colors.reset}`);
    return true;
  }
}

// Executar verificações
const checkResult = runChecks();

// Saída com código adequado
process.exit(checkResult ? 0 : 1);