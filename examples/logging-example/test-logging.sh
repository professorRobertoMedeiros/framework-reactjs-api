#!/bin/bash

# Script de teste para demonstrar o sistema de logging com UUID

echo "=========================================="
echo "  Teste do Sistema de Logging com UUID"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Health Check${NC}"
echo "GET $BASE_URL/health"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/health")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
REQUEST_ID=$(echo "$BODY" | jq -r '.requestId // empty' 2>/dev/null || echo "N/A")
echo -e "${GREEN}Response:${NC} $BODY"
echo -e "${YELLOW}Request ID:${NC} $REQUEST_ID"
echo ""
sleep 1

echo -e "${BLUE}2. Criar novo produto${NC}"
echo "POST $BASE_URL/api/products"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SSD Samsung 1TB",
    "price": 450.00,
    "description": "SSD NVMe M.2 1TB"
  }')
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
REQUEST_ID=$(echo "$BODY" | jq -r '.requestId // empty' 2>/dev/null || echo "N/A")
PRODUCT_ID=$(echo "$BODY" | jq -r '.data.id // empty' 2>/dev/null || echo "N/A")
echo -e "${GREEN}Response:${NC} $BODY"
echo -e "${YELLOW}Request ID:${NC} $REQUEST_ID"
echo -e "${YELLOW}Product ID:${NC} $PRODUCT_ID"
echo ""
sleep 1

echo -e "${BLUE}3. Listar todos os produtos${NC}"
echo "GET $BASE_URL/api/products"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/products")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
REQUEST_ID=$(echo "$BODY" | jq -r '.requestId // empty' 2>/dev/null || echo "N/A")
COUNT=$(echo "$BODY" | jq -r '.data | length' 2>/dev/null || echo "N/A")
echo -e "${GREEN}Response:${NC} $BODY"
echo -e "${YELLOW}Request ID:${NC} $REQUEST_ID"
echo -e "${YELLOW}Products Count:${NC} $COUNT"
echo ""
sleep 1

if [ "$PRODUCT_ID" != "N/A" ]; then
  echo -e "${BLUE}4. Buscar produto por ID${NC}"
  echo "GET $BASE_URL/api/products/$PRODUCT_ID"
  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/products/$PRODUCT_ID")
  HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
  REQUEST_ID=$(echo "$BODY" | jq -r '.requestId // empty' 2>/dev/null || echo "N/A")
  echo -e "${GREEN}Response:${NC} $BODY"
  echo -e "${YELLOW}Request ID:${NC} $REQUEST_ID"
  echo ""
  sleep 1

  echo -e "${BLUE}5. Atualizar produto${NC}"
  echo "PUT $BASE_URL/api/products/$PRODUCT_ID"
  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PUT "$BASE_URL/api/products/$PRODUCT_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "price": 399.99,
      "description": "SSD NVMe M.2 1TB - PROMOÇÃO!"
    }')
  HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
  REQUEST_ID=$(echo "$BODY" | jq -r '.requestId // empty' 2>/dev/null || echo "N/A")
  echo -e "${GREEN}Response:${NC} $BODY"
  echo -e "${YELLOW}Request ID:${NC} $REQUEST_ID"
  echo ""
fi

echo ""
echo "=========================================="
echo "  Teste Concluído!"
echo "=========================================="
echo ""
echo -e "${YELLOW}Dica:${NC} Verifique os logs para ver que cada requisição"
echo "      tem um UUID único que aparece em TODOS os logs,"
echo "      incluindo logs SQL!"
echo ""
echo -e "Logs HTTP: ${GREEN}../../logs/http-$(date +%Y-%m-%d).log${NC}"
echo -e "Logs SQL:  ${GREEN}../../logs/sql-$(date +%Y-%m-%d).log${NC}"
echo ""
echo "Execute:"
echo -e "  ${BLUE}cat ../../logs/http-*.log | jq 'select(.requestId == \"$REQUEST_ID\")'${NC}"
echo ""
