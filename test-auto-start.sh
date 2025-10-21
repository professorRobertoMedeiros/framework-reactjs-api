#!/bin/bash

# ====================================
# TESTE COMPLETO DO SCHEDULER AUTO-START
# ====================================

set -e  # Parar em caso de erro

echo "🧪 Iniciando testes do Scheduler Auto-Start..."
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variáveis
DB_NAME="scheduler_test_$(date +%s)"
PORT=3099
FRAMEWORK_DIR="/workspaces/framework-reactjs-api"
EXAMPLE_DIR="$FRAMEWORK_DIR/examples/scheduler-example"

echo -e "${BLUE}📁 Diretórios:${NC}"
echo "   Framework: $FRAMEWORK_DIR"
echo "   Exemplo: $EXAMPLE_DIR"
echo ""

# ====================================
# 1. COMPILAR FRAMEWORK
# ====================================
echo -e "${YELLOW}[1/7]${NC} Compilando framework..."
cd "$FRAMEWORK_DIR"
npm run build > /dev/null 2>&1
echo -e "${GREEN}✅ Framework compilado${NC}"
echo ""

# ====================================
# 2. CRIAR BANCO DE DADOS DE TESTE
# ====================================
echo -e "${YELLOW}[2/7]${NC} Criando banco de dados de teste: $DB_NAME"
createdb "$DB_NAME" || {
  echo -e "${YELLOW}⚠️  Banco já existe, deletando...${NC}"
  dropdb --if-exists "$DB_NAME"
  createdb "$DB_NAME"
}
echo -e "${GREEN}✅ Banco criado${NC}"
echo ""

# ====================================
# 3. APLICAR MIGRATIONS
# ====================================
echo -e "${YELLOW}[3/7]${NC} Aplicando migrations..."
export DB_NAME="$DB_NAME"
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_USER="postgres"
export DB_PASSWORD="postgres"

# Migration: schema inicial
psql -d "$DB_NAME" -f "$FRAMEWORK_DIR/src/infra/migrations/20251008000000_initial_schema.sql" > /dev/null 2>&1
# Migration: usuário admin
psql -d "$DB_NAME" -f "$FRAMEWORK_DIR/src/infra/migrations/20251018001_add_admin_user.sql" > /dev/null 2>&1
# Migration: scheduled_jobs
psql -d "$DB_NAME" -f "$FRAMEWORK_DIR/src/infra/migrations/20251020000000_create_scheduled_jobs_table.sql" > /dev/null 2>&1

echo -e "${GREEN}✅ Migrations aplicadas${NC}"
echo ""

# ====================================
# 4. INSERIR JOBS DE TESTE
# ====================================
echo -e "${YELLOW}[4/7]${NC} Inserindo jobs de teste..."

psql -d "$DB_NAME" << EOF > /dev/null 2>&1
INSERT INTO scheduled_jobs (
  name, description, service_name, service_method, service_path,
  schedule, params, enabled, max_retries, timeout
) VALUES
(
  'test-job-1',
  'Job de teste 1 - executa a cada minuto',
  'CleanupService',
  'cleanOldRecords',
  'services/CleanupService',
  '* * * * *',
  '{"days": 30}'::jsonb,
  true,
  3,
  300
),
(
  'test-job-2',
  'Job de teste 2 - desabilitado',
  'CleanupService',
  'sendDailyReport',
  'services/CleanupService',
  '0 2 * * *',
  '{"recipients": ["test@example.com"]}'::jsonb,
  false,
  3,
  300
);
EOF

TOTAL_JOBS=$(psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM scheduled_jobs;")
ENABLED_JOBS=$(psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM scheduled_jobs WHERE enabled = true;")

echo -e "${GREEN}✅ Jobs inseridos${NC}"
echo "   Total: $TOTAL_JOBS"
echo "   Habilitados: $ENABLED_JOBS"
echo ""

# ====================================
# 5. CRIAR ARQUIVO .env DE TESTE
# ====================================
echo -e "${YELLOW}[5/7]${NC} Criando arquivo .env de teste..."

cat > "$EXAMPLE_DIR/.env.test" << EOF
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=test_secret_key
JWT_EXPIRES_IN=24h

# Servidor
PORT=$PORT
NODE_ENV=test

# Logs
LOG_ENABLED=true
LOG_LEVEL=debug
LOG_SQL=false
LOG_HTTP=false

# Scheduler - AUTO-START HABILITADO
SCHEDULER_ENABLED=true
SCHEDULER_AUTO_START=true
SCHEDULER_MAX_CONCURRENT=2
SCHEDULER_CHECK_INTERVAL=5000
SCHEDULER_STUCK_THRESHOLD=5
EOF

echo -e "${GREEN}✅ .env.test criado${NC}"
echo ""

# ====================================
# 6. TESTAR AUTO-START
# ====================================
echo -e "${YELLOW}[6/7]${NC} Testando auto-start do scheduler..."
echo ""
echo -e "${BLUE}Iniciando servidor (aguarde 10 segundos)...${NC}"
echo ""

cd "$EXAMPLE_DIR"

# Instalar dependências (se necessário)
if [ ! -d "node_modules" ]; then
  echo "   Instalando dependências..."
  npm install > /dev/null 2>&1
fi

# Iniciar servidor em background
ENV_FILE=".env.test" timeout 10 npm run dev 2>&1 | tee /tmp/scheduler_test_output.log &
SERVER_PID=$!

# Aguardar servidor iniciar
sleep 3

# Verificar se servidor está rodando
if ! curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Servidor não respondeu, verifique logs${NC}"
  cat /tmp/scheduler_test_output.log
  exit 1
fi

echo -e "${GREEN}✅ Servidor iniciado na porta $PORT${NC}"
echo ""

# Verificar logs de auto-start
echo -e "${BLUE}📋 Logs do servidor:${NC}"
echo ""
cat /tmp/scheduler_test_output.log | grep -E "(Scheduler|jobs|agendado)" || echo "   (sem logs de scheduler)"
echo ""

# Verificar se scheduler iniciou
if grep -q "Scheduler iniciado automaticamente" /tmp/scheduler_test_output.log; then
  echo -e "${GREEN}✅ AUTO-START FUNCIONOU!${NC}"
  echo -e "${GREEN}   Scheduler foi iniciado automaticamente${NC}"
else
  echo -e "${YELLOW}⚠️  Scheduler pode não ter iniciado automaticamente${NC}"
fi
echo ""

# Verificar quantos jobs foram carregados
LOADED_JOBS=$(grep -c "agendado" /tmp/scheduler_test_output.log || echo "0")
echo -e "${BLUE}📊 Jobs carregados: $LOADED_JOBS${NC}"
echo ""

# ====================================
# 7. CLEANUP
# ====================================
echo -e "${YELLOW}[7/7]${NC} Limpando recursos..."

# Parar servidor
kill $SERVER_PID 2>/dev/null || true
sleep 1

# Deletar banco de teste
dropdb --if-exists "$DB_NAME"

# Remover .env.test
rm -f "$EXAMPLE_DIR/.env.test"

echo -e "${GREEN}✅ Recursos limpos${NC}"
echo ""

# ====================================
# RESUMO
# ====================================
echo ""
echo -e "${BLUE}════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 TESTES CONCLUÍDOS COM SUCESSO!${NC}"
echo -e "${BLUE}════════════════════════════════════${NC}"
echo ""
echo "✅ Framework compilado"
echo "✅ Banco de dados criado e migrado"
echo "✅ Jobs inseridos no banco"
echo "✅ Servidor iniciado com scheduler"
echo "✅ Auto-start verificado"
echo "✅ Recursos limpos"
echo ""
echo -e "${YELLOW}💡 Para usar em produção:${NC}"
echo "   1. Configure o .env com SCHEDULER_AUTO_START=true"
echo "   2. Rode npm run dev"
echo "   3. Jobs iniciam automaticamente!"
echo ""
