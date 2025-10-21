# 🐰 Guia de Mensageria com RabbitMQ

## Visão Geral

O framework fornece uma integração **simples, prática e objetiva** com RabbitMQ através de classes base para **Producers** e **Consumers**.

### Benefícios

✅ **Simples**: Apenas estenda `BaseProducer` ou `BaseConsumer`  
✅ **UUID Tracking**: Rastreamento automático de mensagens  
✅ **Type-Safe**: TypeScript com tipos bem definidos  
✅ **Resiliente**: Reconexão automática  
✅ **Observável**: Logs completos com requestId  

## Quick Start

### 1. Instalar Dependências

As dependências já estão incluídas no framework:
- `amqplib` - Cliente RabbitMQ
- `@types/amqplib` - Tipos TypeScript

### 2. Configurar .env

```bash
# RabbitMQ Connection
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_PREFETCH=1
RABBITMQ_MAX_RECONNECT_ATTEMPTS=10
RABBITMQ_RECONNECT_DELAY=5000
```

### 3. Criar um Producer

```typescript
import { BaseProducer } from 'framework-reactjs-api';

export class EmailProducer extends BaseProducer {
  constructor() {
    super('email.queue', {
      exchange: 'notifications',
      exchangeType: 'topic',
      durable: true,
      persistent: true
    });
  }

  async sendEmail(to: string, subject: string, body: string) {
    return this.publish('email.send', {
      to,
      subject,
      body,
      sentAt: new Date()
    });
  }
}
```

### 4. Criar um Consumer

```typescript
import { BaseConsumer } from 'framework-reactjs-api';
import { LoggingService } from 'framework-reactjs-api';

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

  protected async handleMessage(message: any): Promise<void> {
    LoggingService.info('Sending email', { to: message.to });
    
    // Sua lógica de envio de email aqui
    await emailService.send(message);
    
    LoggingService.info('Email sent successfully');
  }
}
```

### 5. Registrar e Iniciar

```typescript
import { MessagingService } from 'framework-reactjs-api';

// Conectar ao RabbitMQ
const messagingService = MessagingService.getInstance();
await messagingService.connect();

// Registrar consumer
const emailConsumer = new EmailConsumer();
messagingService.registerConsumer(emailConsumer);

// Iniciar consumers
await messagingService.startConsumers();

// Usar producer
const emailProducer = new EmailProducer();
await emailProducer.sendEmail('user@example.com', 'Hello', 'Message');
```

## Arquitetura

```
┌─────────────────┐
│  HTTP Request   │
│  (Publisher)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Producer       │ ◄── Estende BaseProducer
│  (EmailProducer)│
└────────┬────────┘
         │ publish('email.send', data)
         ▼
┌─────────────────┐
│  RabbitMQ       │
│  Exchange       │ ◄── Topic Exchange: 'notifications'
│  + Queue        │
└────────┬────────┘
         │ routing key: 'email.*'
         ▼
┌─────────────────┐
│  Consumer       │ ◄── Estende BaseConsumer
│  (EmailConsumer)│
└────────┬────────┘
         │ handleMessage(data)
         ▼
┌─────────────────┐
│  Business Logic │
│  (Send Email)   │
└─────────────────┘
```

## API Reference

### BaseProducer

#### Constructor

```typescript
constructor(queueName: string, options?: ProducerOptions)
```

**Options:**
```typescript
interface ProducerOptions {
  exchange?: string;               // Nome do exchange
  exchangeType?: 'direct' | 'topic' | 'fanout' | 'headers';
  durable?: boolean;               // Padrão: true
  persistent?: boolean;            // Mensagens persistentes (padrão: true)
}
```

#### Método `publish`

```typescript
protected async publish(
  routingKey: string,
  message: any,
  options?: any
): Promise<boolean>
```

**Exemplo:**
```typescript
await this.publish('user.created', {
  userId: 123,
  email: 'user@example.com'
});
```

### BaseConsumer

#### Constructor

```typescript
constructor(queueName: string, options?: ConsumerOptions)
```

**Options:**
```typescript
interface ConsumerOptions {
  exchange?: string;
  exchangeType?: 'direct' | 'topic' | 'fanout' | 'headers';
  routingKey?: string;             // Pattern para binding
  durable?: boolean;               // Padrão: true
  autoAck?: boolean;               // Padrão: false (manual ack)
  prefetch?: number;               // Padrão: 1
}
```

#### Método `handleMessage` (abstrato)

```typescript
protected abstract handleMessage(
  message: any,
  originalMessage?: ConsumeMessage
): Promise<void>
```

Você **deve implementar** este método nas classes filhas.

#### Métodos públicos

```typescript
async start(): Promise<void>      // Inicia consumo
async stop(): Promise<void>       // Para consumo
isActive(): boolean               // Verifica se está ativo
```

### MessagingService

Gerencia conexão e consumers.

```typescript
// Singleton
const messagingService = MessagingService.getInstance();

// Conectar
await messagingService.connect();

// Registrar consumer(s)
messagingService.registerConsumer(consumer);
messagingService.registerConsumers([consumer1, consumer2]);

// Iniciar todos os consumers
await messagingService.startConsumers();

// Parar todos os consumers
await messagingService.stopConsumers();

// Verificar conexão
messagingService.isConnected(); // boolean

// Fechar tudo
await messagingService.close();
```

## Patterns e Boas Práticas

### 1. Topic Exchange (Recomendado)

Use para roteamento flexível baseado em patterns:

```typescript
// Producer
await producer.publish('order.created', data);
await producer.publish('order.shipped', data);
await producer.publish('order.delivered', data);

// Consumer 1: Todos os eventos de order
constructor() {
  super('order.events.queue', {
    exchange: 'orders',
    routingKey: 'order.*'
  });
}

// Consumer 2: Apenas created e shipped
constructor() {
  super('order.processing.queue', {
    exchange: 'orders',
    routingKey: 'order.{created,shipped}'
  });
}
```

### 2. Direct Exchange

Para roteamento direto 1:1:

```typescript
constructor() {
  super('critical.queue', {
    exchange: 'logs',
    exchangeType: 'direct',
    routingKey: 'error'
  });
}
```

### 3. Fanout Exchange

Para broadcast (todos os consumers recebem):

```typescript
constructor() {
  super('broadcast.queue', {
    exchange: 'notifications',
    exchangeType: 'fanout'
    // routingKey não é necessário
  });
}
```

### 4. Manual ACK (Recomendado em Produção)

```typescript
constructor() {
  super('my.queue', {
    autoAck: false  // ⬅️ Importante!
  });
}

protected async handleMessage(message: any): Promise<void> {
  try {
    await processMessage(message);
    // ACK é feito automaticamente pelo BaseConsumer em caso de sucesso
  } catch (error) {
    // NACK + requeue é feito automaticamente em caso de erro
    throw error;
  }
}
```

### 5. Prefetch Control

Controla quantas mensagens não confirmadas cada consumer pode ter:

```typescript
constructor() {
  super('my.queue', {
    prefetch: 5  // Processa até 5 mensagens simultaneamente
  });
}
```

**Recomendações:**
- `prefetch: 1` → Distribuição justa, processamento sequencial
- `prefetch: 5-10` → Melhor throughput, menos distribuição
- `prefetch: 0` → Sem limite (não recomendado)

### 6. Retry Logic

```typescript
protected async handleMessage(message: any): Promise<void> {
  const maxRetries = 3;
  const currentRetry = message._metadata?.retryCount || 0;

  if (currentRetry >= maxRetries) {
    LoggingService.error('Max retries reached', { message });
    // Mover para dead letter queue ou descartar
    return;
  }

  try {
    await processMessage(message);
  } catch (error) {
    LoggingService.warn('Retry will be attempted', {
      retry: currentRetry + 1,
      maxRetries
    });
    throw error; // NACK + requeue
  }
}
```

### 7. Dead Letter Queue

Configure no RabbitMQ:

```typescript
// No constructor, após assertQueue
await this.channel.assertQueue(this.queueName, {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': 'dlx.exchange',
    'x-dead-letter-routing-key': 'failed.messages'
  }
});
```

## UUID Tracking

### Propagação Automática

O framework automaticamente propaga o `requestId`:

```typescript
// HTTP Request → Producer
POST /api/users
RequestID: 550e8400-e29b-41d4...

// Producer adiciona aos headers
{
  headers: {
    'x-request-id': '550e8400-e29b-41d4...'
  }
}

// Consumer recebe e usa no contexto
TracingService.runWithTrace(() => {
  // Todos os logs aqui terão o mesmo requestId
  LoggingService.info('Processing message');
}, { originalRequestId: requestId });
```

### Metadados da Mensagem

Cada mensagem recebe metadados automáticos:

```typescript
{
  // Seus dados
  to: 'user@example.com',
  subject: 'Hello',
  
  // Metadados adicionados automaticamente
  _metadata: {
    requestId: '550e8400-e29b-41d4...',
    producedAt: '2025-10-20T14:30:15.123Z',
    producer: 'EmailProducer'
  }
}
```

## Monitoramento

### Via Logs

```typescript
// Producer
[INFO] [APP] [RequestID: 550e8400...] Message published
  queue: email.queue
  routingKey: email.send
  messageSize: 256

// Consumer
[INFO] [APP] [RequestID: 550e8400...] Processing message
  queue: email.queue
  routingKey: email.send
[INFO] [APP] [RequestID: 550e8400...] Message processed successfully
  duration: 1234ms
```

### Via RabbitMQ Management

Acesse: http://localhost:15672

- Ver filas e mensagens
- Monitorar consumers
- Ver throughput
- Purgar filas
- Mover mensagens

## Graceful Shutdown

```typescript
// Em index.ts ou app.ts
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  
  const messagingService = MessagingService.getInstance();
  await messagingService.close();
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  
  const messagingService = MessagingService.getInstance();
  await messagingService.close();
  
  process.exit(0);
});
```

## Exemplo Completo

Veja o exemplo funcional em:
```
examples/rabbitmq-example/
```

Execute:
```bash
cd examples/rabbitmq-example
npm install
npm run dev
```

## Troubleshooting

### Erro: Connection refused

```bash
# Verificar se RabbitMQ está rodando
docker ps | grep rabbitmq

# Iniciar RabbitMQ
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

### Mensagens não são consumidas

1. Verificar se consumer está registrado e ativo
2. Verificar routing key e binding
3. Ver logs para erros
4. Verificar ACK/NACK

### Memory Leak

- Use `autoAck: false` com ACK manual
- Implemente timeout em `handleMessage`
- Configure `prefetch` adequadamente
- Monitore uso de memória

### Performance Issues

- Aumente `prefetch` (cuidado com distribuição)
- Use múltiplos consumers (scale horizontal)
- Otimize `handleMessage` (async/await)
- Configure connection pool se necessário

## Recursos Adicionais

- **RabbitMQ Docs**: https://www.rabbitmq.com/documentation.html
- **amqplib**: https://github.com/amqp-node/amqplib
- **Exemplo completo**: `examples/rabbitmq-example/`

---

**Pronto!** Sistema de mensageria simples e robusto! 🐰🚀
