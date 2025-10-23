#!/bin/bash

echo "========================================="
echo "Testando RequestContext - Auditoria Automática"
echo "========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

echo -e "${BLUE}1. Login para obter token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Falha no login. Certifique-se de que o servidor está rodando e o usuário existe."
  echo "Resposta: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso!${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

echo -e "${BLUE}2. Criando produto (auditoria automática)...${NC}"
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook Dell",
    "price": 3500.00,
    "description": "Notebook para desenvolvimento"
  }')

echo "$CREATE_RESPONSE" | jq '.'
PRODUCT_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo ""

echo -e "${BLUE}3. Atualizando produto (auditoria automática)...${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT $BASE_URL/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook Dell XPS 15",
    "price": 4200.00,
    "description": "Notebook premium para desenvolvimento"
  }')

echo "$UPDATE_RESPONSE" | jq '.'
echo ""

echo -e "${BLUE}4. Listando todos os produtos...${NC}"
LIST_RESPONSE=$(curl -s -X GET $BASE_URL/api/products \
  -H "Authorization: Bearer $TOKEN")

echo "$LIST_RESPONSE" | jq '.'
echo ""

echo "========================================="
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo "========================================="
echo ""
echo "Agora verifique a tabela audit_logs no banco de dados:"
echo ""
echo "docker exec -it context-example-postgres psql -U postgres -d contextdb -c \"SELECT tablename, recordid, columnname, actiontype, oldvalue, newvalue, userid, useremail FROM audit_logs ORDER BY createdat DESC LIMIT 10;\""
echo ""
