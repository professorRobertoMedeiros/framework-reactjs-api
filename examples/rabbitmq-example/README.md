# Exemplo de RabbitMQ - Mensageria

Este exemplo demonstra como usar o sistema de mensageria (RabbitMQ) do framework de forma **prática, simples e objetiva**.

## 📋 O que este exemplo mostra

✅ **Producers**: Como criar producers para publicar mensagens  
✅ **Consumers**: Como criar consumers para processar mensagens  
✅ **Exchanges e Routing Keys**: Uso de topic exchange para roteamento  
✅ **UUID Tracking**: Rastreamento de mensagens com RequestID  
✅ **Error Handling**: Tratamento de erros com ACK/NACK  
✅ **Graceful Shutdown**: Fechamento adequado de conexões  

## 🏗️ Estrutura

```
rabbitmq-example/
├── src/
│   ├── index.ts                          # Servidor principal
│   ├── test-producer.ts                  # Script de teste de producers
│   ├── producers/
│   │   ├── EmailProducer.ts             # Producer de emails
│   │   └── NotificationProducer.ts      # Producer de notificações
│   ├── consumers/
│   │   ├── EmailConsumer.ts             # Consumer de emails
│   │   └── NotificationConsumer.ts      # Consumer de notificações
│   └── routes/
│       └── messaging.ts                  # Rotas HTTP para publicar mensagens
├── .env.example
├── package.json
├── tsconfig.json
├── test-messaging.sh                     # Script de teste via HTTP
└── README.md
```

## 🚀 Quick Start

### 1. Pré-requisitos

- Node.js 18+
- RabbitMQ rodando (Docker recomendado)

**Iniciar RabbitMQ com Docker:**

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management

# Acessar interface web: http://localhost:15672
# User: guest
# Password: guest
```

### 2. Setup

```bash
cd examples/rabbitmq-example

# Copiar .env
cp .env.example .env

# Instalar dependências
npm install
```

### 3. Executar

```bash
# Iniciar servidor (consumers)
npm run dev
```

Você verá:

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🐰 RabbitMQ Example Server                                  ║
║                                                                ║
║   Server running on: http://localhost:3000                     ║
║   RabbitMQ: ✅ Connected                                      ║
║   Consumers: 2 active                                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

## 📝 Como Usar

### Opção 1: Via HTTP (recomendado)

```bash
# Tornar executável
chmod +x test-messaging.sh

# Executar testes
./test-messaging.sh
```

### Opção 2: Via Script de Producer

```bash
# Publica mensagens sem iniciar servidor
npm run producer
```

### Opção 3: Manualmente via cURL

```bash
# Enviar email
curl -X POST http://localhost:3000/api/messaging/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Hello",
    "body": "Test message"
  }'

# Enviar email de boas-vindas
curl -X POST http://localhost:3000/api/messaging/email/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "João Silva"
  }'

# Enviar notificação push
curl -X POST http://localhost:3000/api/messaging/notification/push \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "title": "Nova Mensagem",
    "message": "Você tem uma nova mensagem!"
  }'
```

## 🎯 Como Funciona

### 1. **Producers** (Publicam Mensagens)

```typescript
// EmailProducer.ts
export class EmailProducer extends BaseProducer {
  constructor() {
    super('email.queue', {
      exchange: 'notifications',
      exchangeType: 'topic',
      durable: true,
      persistent: true
    });
  }

  async sendEmail(data: any) {
    return this.publish('email.send', data);
  }
}
```

**Uso:**

```typescript
const emailProducer = new EmailProducer();
await emailProducer.sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  body: 'Message'
});
```

### 2. **Consumers** (Processam Mensagens)

```typescript
// EmailConsumer.ts
export class EmailConsumer extends BaseConsumer {
  constructor() {
    super('email.queue', {
      exchange: 'notifications',
      exchangeType: 'topic',
      routingKey: 'email.*',
      durable: true,
      autoAck: false
    });
  }

  protected async handleMessage(message: any) {
    // Processar email
    console.log('Sending email to:', message.to);
    
    // Simular envio
    await sendEmailService(message);
  }
}
```

**Registro:**

```typescript
const messagingService = MessagingService.getInstance();
await messagingService.connect();

const emailConsumer = new EmailConsumer();
messagingService.registerConsumer(emailConsumer);

await messagingService.startConsumers();
```

## 🔑 Conceitos Importantes

### Exchange Types

Este exemplo usa **Topic Exchange**:

- `email.send` → Roteado para EmailConsumer
- `email.welcome` → Roteado para EmailConsumer
- `notification.push` → Roteado para NotificationConsumer
- `notification.sms` → Roteado para NotificationConsumer

### Routing Keys

Pattern matching com `*` e `#`:

- `email.*` → Captura todas as routing keys que começam com `email.`
- `notification.*` → Captura todas que começam com `notification.`

### ACK/NACK

- **autoAck: false** → Manual acknowledgment
- ✅ Sucesso → `channel.ack(msg)`
- ❌ Erro → `channel.nack(msg, false, true)` (requeue)

### UUID Tracking

Cada mensagem recebe automaticamente o `requestId`:

```typescript
// Headers da mensagem
{
  'x-request-id': '550e8400-e29b-41d4-a716-446655440000'
}

// Metadados da mensagem
{
  _metadata: {
    requestId: '550e8400-e29b-41d4...',
    producedAt: '2025-10-20T14:30:15.123Z',
    producer: 'EmailProducer'
  }
}
```

Isso permite rastrear a mensagem desde a publicação até o processamento!

## 📊 Logs

### Producer

```
[INFO] [APP] [RequestID: 550e8400...] Publishing email message
[INFO] [APP] [RequestID: 550e8400...] Message published
```

### Consumer

```
[INFO] [APP] [RequestID: 550e8400...] Processing message
[INFO] [APP] [RequestID: 550e8400...] Sending generic email
[INFO] [APP] [RequestID: 550e8400...] Generic email sent successfully
[INFO] [APP] [RequestID: 550e8400...] Message processed successfully
```

## 🎨 Customização

### Criar Seu Próprio Producer

```typescript
import { BaseProducer } from '@framework/infra/messaging';

export class MyCustomProducer extends BaseProducer {
  constructor() {
    super('my.queue', {
      exchange: 'my.exchange',
      exchangeType: 'topic',
      durable: true
    });
  }

  async publishSomething(data: any) {
    return this.publish('my.routing.key', data);
  }
}
```

### Criar Seu Próprio Consumer

```typescript
import { BaseConsumer } from '@framework/infra/messaging';
import { LoggingService } from '@framework/core/tracing/LoggingService';

export class MyCustomConsumer extends BaseConsumer {
  constructor() {
    super('my.queue', {
      exchange: 'my.exchange',
      routingKey: 'my.*',
      autoAck: false,
      prefetch: 5
    });
  }

  protected async handleMessage(message: any): Promise<void> {
    LoggingService.info('Processing custom message', message);
    
    // Sua lógica aqui
    await processMessage(message);
    
    LoggingService.info('Custom message processed');
  }
}
```

## ⚙️ Configuração (.env)

```bash
# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_PREFETCH=1
RABBITMQ_MAX_RECONNECT_ATTEMPTS=10
RABBITMQ_RECONNECT_DELAY=5000

# Logs
LOG_ENABLED=true
LOG_LEVEL=debug
```

## 🐛 Troubleshooting

### RabbitMQ não conecta

```bash
# Verificar se RabbitMQ está rodando
docker ps | grep rabbitmq

# Ver logs do RabbitMQ
docker logs rabbitmq

# Reiniciar RabbitMQ
docker restart rabbitmq
```

### Mensagens não são processadas

1. Verificar se consumers estão ativos: `GET /health`
2. Ver logs do servidor
3. Verificar filas no RabbitMQ Management: http://localhost:15672

### Mensagens ficam travadas

- Verifique se o consumer está fazendo `ack()` ou `nack()`
- Com `autoAck: false`, você DEVE fazer ack manualmente
- Em caso de erro, faça `nack(msg, false, true)` para reprocessar

## 📖 Documentação Completa

- **Framework Messaging**: `../../docs/RABBITMQ-GUIDE.md` (será criado)
- **BaseProducer API**: `../../src/infra/messaging/BaseProducer.ts`
- **BaseConsumer API**: `../../src/infra/messaging/BaseConsumer.ts`

## 🎯 Próximos Passos

1. ✅ Rodar este exemplo
2. ✅ Ver mensagens sendo processadas
3. ✅ Criar seus próprios producers/consumers
4. ✅ Integrar no seu projeto

## 💡 Dicas

- Use `autoAck: false` em produção para garantir entrega
- Configure `prefetch` adequadamente (baixo = distribuição melhor)
- Implemente retry logic para falhas temporárias
- Use dead letter queues para mensagens problemáticas
- Monitore filas no RabbitMQ Management Console

---

**Pronto!** Sistema de mensageria funcionando de forma simples e objetiva! 🚀
