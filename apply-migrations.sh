#!/bin/bash

# Script para executar migrações do banco de dados
echo "🚀 Executando migrações SQL..."

# Navegar para o diretório do projeto
cd /workspaces/framework-reactjs-api

# Executar a migração usando o CLI do framework
# Tentando primeiro o script na pasta bin, que deve estar no PATH
node /workspaces/framework-reactjs-api/bin/migration-runner.js

# Verificar se a execução foi bem-sucedida
if [ $? -eq 0 ]; then
  echo "✅ Migrações aplicadas com sucesso!"
  echo "O usuário admin@sistema.com com senha 601034 está agora disponível para login"
else
  echo "❌ Erro ao aplicar migrações. Verifique os logs acima para detalhes."
fi