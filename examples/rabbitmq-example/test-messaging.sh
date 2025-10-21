#!/bin/bash

# Script de teste para demonstrar o sistema de mensageria RabbitMQ

echo "=========================================="
echo "  Teste do Sistema de Mensageria RabbitMQ"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Health Check${NC}"
curl -s "$BASE_URL/health" | jq '.'
echo ""
sleep 1

echo -e "${BLUE}2. Enviar Email Genérico${NC}"
curl -s -X POST "$BASE_URL/api/messaging/email/send" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Test Email",
    "body": "This is a test email from RabbitMQ example"
  }' | jq '.'
echo ""
sleep 1

echo -e "${BLUE}3. Enviar Email de Boas-vindas${NC}"
curl -s -X POST "$BASE_URL/api/messaging/email/welcome" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "João Silva"
  }' | jq '.'
echo ""
sleep 1

echo -e "${BLUE}4. Enviar Email de Recuperação de Senha${NC}"
curl -s -X POST "$BASE_URL/api/messaging/email/password-reset" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "token": "abc123xyz789"
  }' | jq '.'
echo ""
sleep 1

echo -e "${BLUE}5. Enviar Notificação Push${NC}"
curl -s -X POST "$BASE_URL/api/messaging/notification/push" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "title": "Nova Mensagem",
    "message": "Você recebeu uma nova mensagem!",
    "data": {
      "messageId": 456,
      "from": "João"
    }
  }' | jq '.'
echo ""
sleep 1

echo -e "${BLUE}6. Enviar SMS${NC}"
curl -s -X POST "$BASE_URL/api/messaging/notification/sms" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5511999999999",
    "message": "Seu código de verificação é: 123456"
  }' | jq '.'
echo ""

echo ""
echo "=========================================="
echo "  Teste Concluído!"
echo "=========================================="
echo ""
echo -e "${YELLOW}Dica:${NC} Veja os logs do servidor para acompanhar"
echo "      o processamento das mensagens pelos consumers!"
echo ""
echo "      As mensagens são processadas de forma assíncrona,"
echo "      então o processamento acontece em background."
echo ""
