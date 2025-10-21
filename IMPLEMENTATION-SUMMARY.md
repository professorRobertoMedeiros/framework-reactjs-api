# 📋 Resumo das Implementações

## 🆕 Última Implementação: Sistema de Mensageria RabbitMQ

### ✅ Implementado em: 20 de Janeiro de 2025

#### 📌 Objetivo
Criar uma implementação completa e prática de **RabbitMQ** para o framework, permitindo que cada projeto crie facilmente seus **producers** e **consumers** de mensagens. Implementação simples, objetiva e baseada em classes base abstratas.

#### 🎯 Problema Resolvido
Antes: Projetos precisavam implementar RabbitMQ do zero, com código repetitivo e boilerplate
Depois: Classes base (BaseProducer, BaseConsumer) permitem criar producers/consumers em minutos

---

### 📦 Componentes Criados

#### 1. **RabbitMQConnection.ts** (Singleton)
**Arquivo:** `src/infra/messaging/RabbitMQConnection.ts`

**Funcionalidades:**
- ✅ Singleton - uma única conexão para toda a aplicação
- ✅ Gerenciamento automático de reconexão
- ✅ Prefetch configurável (controle de mensagens)
- ✅ Event handlers para erros e fechamento
- ✅ Canal compartilhado entre producers/consumers
- ✅ Configuração via variáveis de ambiente

```typescript
const connection = RabbitMQConnection.getInstance();
await connection.connect();
const channel = await connection.getChannel();
```

**Configurações (.env):**
```bash
RABBITMQ_URL=amqp://user:pass@localhost:5672
RABBITMQ_PREFETCH=10
RABBITMQ_MAX_RECONNECT_ATTEMPTS=10
RABBITMQ_RECONNECT_DELAY=5000
```

---

#### 2. **BaseProducer.ts** (Classe Abstrata)
**Arquivo:** `src/infra/messaging/BaseProducer.ts`

**Funcionalidades:**
- ✅ Classe base para criar producers personalizados
- ✅ Suporte a exchanges (topic, direct, fanout, headers)
- ✅ Publicação com routing keys
- ✅ Headers personalizados (inclui requestId automaticamente)
- ✅ Mensagens persistentes por padrão
- ✅ Conexão automática ao RabbitMQ

**Uso:**
```typescript
export class EmailProducer extends BaseProducer {
  constructor() {
    super('email.queue', {
      exchange: 'notifications',
      exchangeType: 'topic'
    });
  }

  async sendEmail(to: string, subject: string, body: string) {
    return this.publish('email.send', { to, subject, body });
  }

  async sendBulkEmail(recipients: string[]) {
    return this.publish('email.bulk', { recipients });
  }
}
```

**Métodos Protegidos:**
- `publish(routingKey, message, options?)` - Publica mensagem
- `getChannel()` - Obtém canal RabbitMQ
- `connect()` - Conecta ao RabbitMQ

---

#### 3. **BaseConsumer.ts** (Classe Abstrata)
**Arquivo:** `src/infra/messaging/BaseConsumer.ts`

**Funcionalidades:**
- ✅ Classe base para criar consumers personalizados
- ✅ Método abstrato `handleMessage()` para implementar lógica
- ✅ ACK/NACK manual de mensagens
- ✅ Tratamento de erros com retry automático
- ✅ Suporte a exchanges e routing keys
- ✅ Dead Letter Queue (DLQ) configurável
- ✅ Propagação do requestId para logging

**Uso:**
```typescript
export class EmailConsumer extends BaseConsumer {
  constructor() {
    super('email.queue', {
      exchange: 'notifications',
      exchangeType: 'topic',
      routingKey: 'email.*',
      deadLetterExchange: 'dlx.notifications'
    });
  }

  protected async handleMessage(message: any, originalMessage: ConsumeMessage) {
    const { to, subject, body } = message;
    
    // Enviar email
    await this.emailService.send(to, subject, body);
    
    LoggingService.info('Email sent successfully', { to });
  }
}
```

**Métodos:**
- `start()` - Inicia consumo de mensagens
- `stop()` - Para consumo gracefully
- `abstract handleMessage(message, originalMessage)` - Implementar processamento

**Tratamento de Erros:**
- ✅ Erros lançados → mensagem vai para DLQ
- ✅ Sucesso → ACK automático
- ✅ Falha → NACK com requeue=false (vai para DLQ)

---

#### 4. **MessagingService.ts** (Gerenciador de Consumers)
**Arquivo:** `src/infra/messaging/MessagingService.ts`

**Funcionalidades:**
- ✅ Registra múltiplos consumers
- ✅ Inicia todos os consumers de uma vez
- ✅ Shutdown graceful de todos os consumers
- ✅ Gerenciamento centralizado

**Uso:**
```typescript
const messagingService = new MessagingService();

// Registrar consumers
messagingService.registerConsumer('email', new EmailConsumer());
messagingService.registerConsumer('notification', new NotificationConsumer());
messagingService.registerConsumer('sms', new SMSConsumer());

// Iniciar todos
await messagingService.startConsumers();

// Parar todos (shutdown graceful)
await messagingService.close();
```

---

#### 5. **Exemplo Completo** (rabbitmq-example/)
**Pasta:** `examples/rabbitmq-example/`

Criado exemplo funcional com API REST completa demonstrando producers e consumers:

##### 📁 Estrutura:
```
examples/rabbitmq-example/
├── .env.example                              # Configurações
├── package.json                              # Dependências
├── tsconfig.json                             # TypeScript config
├── README.md                                 # Documentação
├── test-messaging.sh                         # Script de teste
└── src/
    ├── index.ts                              # Express app
    ├── producers/
    │   ├── EmailProducer.ts                 # Producer de emails
    │   └── NotificationProducer.ts          # Producer de notificações
    ├── consumers/
    │   ├── EmailConsumer.ts                 # Consumer de emails
    │   └── NotificationConsumer.ts          # Consumer de notificações
    └── routes/
        └── messaging.ts                      # Rotas REST
```

##### 📄 Arquivos Criados:

**1. Producers:**

`EmailProducer.ts`:
- `sendEmail()` - Envia email único
- `sendBulkEmail()` - Envia emails em massa
- `sendWelcomeEmail()` - Email de boas-vindas
- Routing keys: `email.send`, `email.bulk`, `email.welcome`

`NotificationProducer.ts`:
- `sendNotification()` - Notificação genérica
- `sendPushNotification()` - Push notification
- `sendInAppNotification()` - Notificação in-app
- Routing keys: `notification.*`, `notification.push`, `notification.inapp`

**2. Consumers:**

`EmailConsumer.ts`:
- Consome fila `email.queue`
- Processa emails (send, bulk, welcome)
- Logging com requestId

`NotificationConsumer.ts`:
- Consome fila `notification.queue`
- Processa notificações (push, in-app)
- Logging com requestId

**3. Routes:**

`messaging.ts`:
- `POST /api/messaging/email` - Envia email
- `POST /api/messaging/email/bulk` - Envia emails em massa
- `POST /api/messaging/email/welcome` - Envia email de boas-vindas
- `POST /api/messaging/notification` - Envia notificação
- `POST /api/messaging/notification/push` - Envia push notification
- `POST /api/messaging/notification/inapp` - Envia notificação in-app

**4. `index.ts`:**
- Express app configurado
- TracingMiddleware para requestId
- HTTPLoggerMiddleware para logs
- Inicia consumers automaticamente
- Shutdown graceful

**5. `test-messaging.sh`:**
- Script bash para testar todos os endpoints
- Envia mensagens via API
- Mostra logs de producers e consumers

---

### 🎯 Como Funciona

#### Fluxo de uma Mensagem:

```
1. Cliente → POST /api/messaging/email
   Body: { to: "user@example.com", subject: "Hello", body: "World" }
              ↓
2. Route Handler (messaging.ts)
   - Cria instância de EmailProducer
   - Chama emailProducer.sendEmail()
              ↓
3. EmailProducer (extends BaseProducer)
   - Conecta ao RabbitMQ
   - Publica mensagem na exchange 'notifications'
   - Routing key: 'email.send'
   - Adiciona requestId ao header
              ↓
4. RabbitMQ
   - Roteia mensagem para fila 'email.queue'
   - Mensagem aguarda consumo
              ↓
5. EmailConsumer (extends BaseConsumer)
   - Consome mensagem da fila
   - Chama handleMessage() com payload
   - Processa email
   - ACK automático se sucesso
              ↓
6. Logging
   - Log Producer: [INFO] Publishing message to email.send
   - Log Consumer: [INFO] Email sent successfully
   - Ambos com o MESMO requestId
```

---

### 📊 Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                       Aplicação Express                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   Producer   │         │   Consumer   │                     │
│  │   (Routes)   │         │  (Auto Init) │                     │
│  └──────┬───────┘         └──────┬───────┘                     │
│         │                        │                              │
│         ▼                        ▼                              │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │BaseProducer  │         │BaseConsumer  │                     │
│  │ - publish()  │         │ - start()    │                     │
│  └──────┬───────┘         └──────┬───────┘                     │
│         │                        │                              │
│         └────────┬───────────────┘                              │
│                  ▼                                               │
│         ┌─────────────────┐                                     │
│         │RabbitMQConnection│                                    │
│         │   (Singleton)    │                                    │
│         │  - getChannel()  │                                    │
│         └────────┬─────────┘                                    │
│                  │                                               │
└──────────────────┼───────────────────────────────────────────────┘
                   │
                   ▼
           ┌───────────────┐
           │   RabbitMQ    │
           │   Server      │
           └───────────────┘
```

---

### 📝 Exemplos de Uso

#### Criar um Producer Personalizado:

```typescript
import { BaseProducer } from 'framework-reactjs-api/infra/messaging';

export class OrderProducer extends BaseProducer {
  constructor() {
    super('orders.queue', {
      exchange: 'orders',
      exchangeType: 'topic'
    });
  }

  async createOrder(order: any) {
    return this.publish('order.created', order);
  }

  async cancelOrder(orderId: string) {
    return this.publish('order.cancelled', { orderId });
  }

  async completeOrder(orderId: string) {
    return this.publish('order.completed', { orderId });
  }
}
```

#### Criar um Consumer Personalizado:

```typescript
import { BaseConsumer } from 'framework-reactjs-api/infra/messaging';
import { LoggingService } from 'framework-reactjs-api/core/tracing';

export class OrderConsumer extends BaseConsumer {
  constructor(private orderService: OrderService) {
    super('orders.queue', {
      exchange: 'orders',
      exchangeType: 'topic',
      routingKey: 'order.*',
      deadLetterExchange: 'dlx.orders'
    });
  }

  protected async handleMessage(message: any) {
    const { type, orderId, ...data } = message;

    switch (type) {
      case 'order.created':
        await this.orderService.processNewOrder(orderId, data);
        LoggingService.info('Order created', { orderId });
        break;

      case 'order.cancelled':
        await this.orderService.cancelOrder(orderId);
        LoggingService.info('Order cancelled', { orderId });
        break;

      case 'order.completed':
        await this.orderService.completeOrder(orderId);
        LoggingService.info('Order completed', { orderId });
        break;

      default:
        throw new Error(`Unknown order type: ${type}`);
    }
  }
}
```

#### Usar no Express:

```typescript
import express from 'express';
import { MessagingService } from 'framework-reactjs-api/infra/messaging';
import { OrderProducer } from './producers/OrderProducer';
import { OrderConsumer } from './consumers/OrderConsumer';

const app = express();

// Inicializar messaging
const messagingService = new MessagingService();
messagingService.registerConsumer('orders', new OrderConsumer());
await messagingService.startConsumers();

// Rotas
app.post('/api/orders', async (req, res) => {
  const producer = new OrderProducer();
  await producer.createOrder(req.body);
  res.json({ success: true });
});

// Shutdown graceful
process.on('SIGTERM', async () => {
  await messagingService.close();
  process.exit(0);
});
```

---

### ✅ Benefícios

#### 1. **Simplicidade**
- ✅ Herdar `BaseProducer` ou `BaseConsumer`
- ✅ Implementar apenas a lógica de negócio
- ✅ Conexão e configuração automáticas

#### 2. **Rastreabilidade**
- ✅ RequestId propagado automaticamente
- ✅ Logs correlacionados entre producer e consumer
- ✅ Fácil debug de mensagens

#### 3. **Confiabilidade**
- ✅ Reconexão automática
- ✅ ACK/NACK manual
- ✅ Dead Letter Queue para mensagens com erro
- ✅ Shutdown graceful

#### 4. **Flexibilidade**
- ✅ Suporte a múltiplos exchanges
- ✅ Routing keys personalizadas
- ✅ Headers customizáveis
- ✅ Configuração via .env

#### 5. **Produção-Ready**
- ✅ Prefetch configurável
- ✅ Event handlers para erros
- ✅ Logging estruturado
- ✅ Gestão de conexão robusta

---

### 📋 Arquivos Criados

#### Core (src/infra/messaging/):
1. ✅ `RabbitMQConnection.ts` - Singleton de conexão (194 linhas)
2. ✅ `BaseProducer.ts` - Classe base para producers (137 linhas)
3. ✅ `BaseConsumer.ts` - Classe base para consumers (165 linhas)
4. ✅ `MessagingService.ts` - Gerenciador de consumers (74 linhas)
5. ✅ `index.ts` - Exports públicos

#### Exemplo (examples/rabbitmq-example/):
1. ✅ `src/index.ts` - Express app (94 linhas)
2. ✅ `src/producers/EmailProducer.ts` - Producer de emails (62 linhas)
3. ✅ `src/producers/NotificationProducer.ts` - Producer de notificações (62 linhas)
4. ✅ `src/consumers/EmailConsumer.ts` - Consumer de emails (50 linhas)
5. ✅ `src/consumers/NotificationConsumer.ts` - Consumer de notificações (50 linhas)
6. ✅ `src/routes/messaging.ts` - Rotas REST (116 linhas)
7. ✅ `.env.example` - Configurações
8. ✅ `package.json` - Dependências
9. ✅ `tsconfig.json` - Config TypeScript
10. ✅ `test-messaging.sh` - Script de teste (91 linhas)
11. ✅ `README.md` - Documentação completa (322 linhas)

#### Documentação:
1. ✅ `docs/RABBITMQ-GUIDE.md` - Guia completo (348 linhas)

#### Dependências (package.json):
1. ✅ `amqplib: ^0.10.3` - Cliente RabbitMQ
2. ✅ `@types/amqplib: ^0.10.5` - Types TypeScript

---

### 🚀 Como Testar o Exemplo

```bash
# 1. Iniciar RabbitMQ
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management

# 2. Ir para a pasta do exemplo
cd examples/rabbitmq-example

# 3. Copiar .env
cp .env.example .env

# 4. Instalar dependências
npm install

# 5. Iniciar servidor (consumers iniciam automaticamente)
npm run dev

# 6. Em outro terminal, rodar testes
chmod +x test-messaging.sh
./test-messaging.sh
```

**Output Esperado:**
```
🚀 Servidor rodando na porta 3000
✅ RabbitMQ connected successfully
📬 EmailConsumer iniciado
📬 NotificationConsumer iniciado

[INFO] [APP] Publishing message to email.send
[INFO] [APP] Email sent successfully to: user@example.com
[INFO] [APP] Publishing message to notification.push
[INFO] [APP] Push notification sent: New order
```

---

### 🎓 Padrões Implementados

1. ✅ **Abstract Factory**: BaseProducer e BaseConsumer como templates
2. ✅ **Singleton**: RabbitMQConnection única instância
3. ✅ **Template Method**: `handleMessage()` abstrato
4. ✅ **Dependency Injection**: Consumers recebem services no construtor
5. ✅ **Event-Driven Architecture**: Mensageria assíncrona
6. ✅ **Graceful Shutdown**: Fechamento limpo de conexões
7. ✅ **Correlation IDs**: RequestId propagado entre serviços

---

### 🔧 Configurações Disponíveis

#### Variáveis de Ambiente:
```bash
# RabbitMQ Connection
RABBITMQ_URL=amqp://user:pass@localhost:5672
RABBITMQ_PREFETCH=10                      # Mensagens por consumer
RABBITMQ_MAX_RECONNECT_ATTEMPTS=10        # Tentativas de reconexão
RABBITMQ_RECONNECT_DELAY=5000             # Delay entre tentativas (ms)

# Logging
LOG_ENABLED=true
LOG_LEVEL=debug
```

#### Opções do BaseProducer:
```typescript
{
  exchange?: string;           // Nome da exchange
  exchangeType?: 'topic' | 'direct' | 'fanout' | 'headers';
  durable?: boolean;           // Fila persistente (padrão: true)
}
```

#### Opções do BaseConsumer:
```typescript
{
  exchange?: string;           // Nome da exchange
  exchangeType?: 'topic' | 'direct' | 'fanout' | 'headers';
  routingKey?: string;         // Routing key para bind
  deadLetterExchange?: string; // DLX para mensagens com erro
  durable?: boolean;           // Fila persistente (padrão: true)
  prefetch?: number;           // Override do prefetch global
}
```

---

### 📊 Casos de Uso

#### 1. **Processamento Assíncrono**
```typescript
// Producer: Criar job pesado
await jobProducer.createJob({ userId, reportType: 'annual' });

// Consumer: Processar em background
async handleMessage(job) {
  await this.reportService.generate(job.userId, job.reportType);
}
```

#### 2. **Notificações em Tempo Real**
```typescript
// Producer: Enviar notificação
await notificationProducer.notify(userId, 'New message!');

// Consumer: Push para websocket/FCM
async handleMessage(notification) {
  await this.pushService.send(notification.userId, notification.message);
}
```

#### 3. **Integração entre Microserviços**
```typescript
// Service A: Publicar evento
await eventProducer.publish('user.registered', { userId, email });

// Service B: Reagir ao evento
async handleMessage(event) {
  await this.emailService.sendWelcome(event.email);
}
```

#### 4. **Processamento em Lote**
```typescript
// Producer: Enviar lote
await batchProducer.processBatch(items);

// Consumer: Processar com retry
async handleMessage(batch) {
  for (const item of batch.items) {
    await this.itemService.process(item);
  }
}
```

---

## 📋 Histórico de Implementações

### ✅ 3. Sistema de Logging com UUID Único por Requisição (Outubro 2025)

#### 📌 Objetivo
Implementar um sistema de logging robusto onde **cada requisição HTTP possui um UUID único** que é propagado automaticamente para **todos os logs**, incluindo:
- ✅ Logs de aplicação (info, debug, warn, error)
- ✅ Logs HTTP (entrada e saída de requisições)
- ✅ **Logs SQL (todas as queries executadas no banco de dados)**
- ✅ Logs de erro e exceções

#### 🎯 Problema Resolvido
Antes: Logs desconectados, difícil rastrear o fluxo completo de uma requisição
Depois: Todos os logs possuem o mesmo UUID, permitindo rastreamento completo end-to-end

---

### 📦 Componentes Modificados/Criados

#### 1. **Logger.ts** (Modificado)
**Arquivo:** `src/infra/logger/Logger.ts`

**Mudanças:**
- ✅ Importado `TracingService` para obter o UUID da requisição
- ✅ Adicionado campo `requestId` na interface `LogEntry`
- ✅ Método `log()` agora obtém automaticamente o `requestId` do contexto
- ✅ Console output mostra o UUID em cor magenta para destaque
- ✅ Logs em arquivo JSON incluem o `requestId`

```typescript
// Antes
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  // ...
}

// Depois
export interface LogEntry {
  timestamp: string;
  requestId: string;  // ⬅️ NOVO!
  level: LogLevel;
  // ...
}

private log(entry: Partial<LogEntry>): void {
  const requestId = TracingService.getRequestId(); // ⬅️ NOVO!
  const fullEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    requestId,  // ⬅️ NOVO!
    // ...
  };
}
```

---

#### 2. **CustomORM.ts** (Modificado)
**Arquivo:** `src/infra/db/CustomORM.ts`

**Mudanças:**
- ✅ Importado `TracingService`
- ✅ Todas as queries SQL agora incluem automaticamente o `requestId` nos logs

```typescript
import { TracingService } from '../../core/tracing/TracingService'; // ⬅️ NOVO!

public async query(text: string, params: any[] = []): Promise<any> {
  // ... código existente
  logger.logSQL(text, params, duration, this.currentUser);
  // O logger agora pega o requestId automaticamente do TracingService
}
```

---

#### 3. **HTTPLoggerMiddleware.ts** (Modificado)
**Arquivo:** `src/infra/logger/HTTPLoggerMiddleware.ts`

**Mudanças:**
- ✅ Importado `TracingService`
- ✅ Documentação atualizada alertando que deve ser usado APÓS o `TracingMiddleware`
- ✅ Captura o `requestId` no início da requisição

```typescript
import { TracingService } from '../../core/tracing/TracingService'; // ⬅️ NOVO!

/**
 * IMPORTANTE: Este middleware deve ser usado APÓS o TracingMiddleware
 * para garantir que o requestId esteja disponível no contexto
 */
export class HTTPLoggerMiddleware {
  public static log() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const requestId = TracingService.getRequestId(); // ⬅️ NOVO!
      // ...
    };
  }
}
```

---

#### 4. **Documentação Completa** (Novo)
**Arquivo:** `docs/LOGGING-WITH-UUID.md`

Documentação extensiva incluindo:
- ✅ Visão geral e arquitetura do sistema
- ✅ Diagrama de fluxo do UUID
- ✅ Descrição de cada componente (TracingService, TracingMiddleware, Logger, CustomORM)
- ✅ Configuração via .env
- ✅ Formato dos logs (console e arquivo)
- ✅ Exemplos de rastreamento e análise de performance
- ✅ Uso em business logic com LoggingService
- ✅ Exemplo completo de fluxo de requisição
- ✅ Integração com ELK Stack e Grafana Loki
- ✅ Boas práticas
- ✅ Troubleshooting

**Seções principais:**
1. Arquitetura (diagrama ASCII)
2. Componentes (TracingService, TracingMiddleware, Logger, CustomORM)
3. Configuração (.env)
4. Formato dos Logs (console + JSON)
5. Rastreamento de Requisições (grep, jq)
6. LoggingService para Business Logic
7. Exemplo Completo de Fluxo
8. Integração com Ferramentas
9. Boas Práticas
10. Troubleshooting

---

#### 5. **Exemplo Prático Completo** (Novo)
**Pasta:** `examples/logging-example/`

Criado exemplo funcional com API REST completa:

##### 📁 Estrutura:
```
examples/logging-example/
├── .env.example                              # Configurações
├── package.json                              # Dependências
├── tsconfig.json                             # TypeScript config
├── README.md                                 # Documentação
├── test-logging.sh                           # Script de teste
├── migrations/
│   └── 001_create_products_table.sql        # Schema do exemplo
└── src/
    ├── index.ts                             # Express app
    ├── routes/
    │   └── products.ts                      # Rotas CRUD
    ├── business/
    │   └── ProductBusiness.ts               # Lógica de negócio
    └── repository/
        └── ProductRepository.ts             # Acesso ao banco
```

##### 📄 Arquivos Criados:

**1. `index.ts`**: 
- Express app configurado
- TracingMiddleware como primeiro middleware
- HTTPLoggerMiddleware em seguida
- Rotas de produtos
- Health check endpoint

**2. `routes/products.ts`**:
- GET /api/products (listar)
- GET /api/products/:id (buscar por ID)
- POST /api/products (criar)
- PUT /api/products/:id (atualizar)
- DELETE /api/products/:id (deletar)
- Todos os endpoints incluem logs com `LoggingService`

**3. `business/ProductBusiness.ts`**:
- Métodos: listAll, findById, create, update, delete, findByPriceRange
- Validações de negócio
- Logs em cada operação
- Tratamento de erros

**4. `repository/ProductRepository.ts`**:
- Acesso ao banco via CustomORM
- Métodos: findAll, findById, findByName, create, update, delete, findByPriceRange, count
- Logs de debug em cada query
- **Todas as queries SQL automaticamente incluem requestId**

**5. `migrations/001_create_products_table.sql`**:
- Tabela products com campos completos
- Índices para performance
- Dados de exemplo (5 produtos)
- Trigger para updated_at

**6. `test-logging.sh`**:
- Script bash para testar todos os endpoints
- Mostra o requestId de cada operação
- Sugere comandos para filtrar logs
- Demonstra rastreamento completo

---

### 🎯 Como Funciona

#### Fluxo de uma Requisição:

```
1. Cliente → POST /api/products
              ↓
2. TracingMiddleware
   - Gera UUID: 550e8400-e29b-41d4-a716-446655440000
   - Armazena em AsyncLocalStorage
              ↓
3. HTTPLoggerMiddleware
   - Log: [INFO] [HTTP] [RequestID: 550e8400...] Received POST request
              ↓
4. Route Handler (products.ts)
   - Log: [INFO] [APP] [RequestID: 550e8400...] Creating new product
              ↓
5. ProductBusiness
   - Log: [INFO] [APP] [RequestID: 550e8400...] Business: Starting product creation
   - Validações...
              ↓
6. ProductRepository
   - Log: [DEBUG] [APP] [RequestID: 550e8400...] Repository: Inserting new product
              ↓
7. CustomORM
   - Log: [DEBUG] [SQL] [RequestID: 550e8400...] SQL INSERT executed
   - Query: INSERT INTO products (name, price) VALUES ($1, $2)
              ↓
8. Response
   - Log: [INFO] [HTTP] [RequestID: 550e8400...] POST /api/products 201 - 45ms
```

**Resultado:** Todos os 7+ logs possuem o **MESMO requestId**!

---

### 📊 Exemplos de Output

#### Console (Desenvolvimento):
```
[2025-10-20 14:30:15] [INFO] [HTTP] [RequestID: 550e8400-e29b-41d4-a716-446655440000] Received POST request for /api/products
[2025-10-20 14:30:15] [INFO] [APP] [RequestID: 550e8400-e29b-41d4-a716-446655440000] Creating new product
Data: { name: "SSD Samsung", price: 450 }
[2025-10-20 14:30:15] [DEBUG] [SQL] [RequestID: 550e8400-e29b-41d4-a716-446655440000] SQL INSERT executed
SQL: {
  query: "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *",
  params: ["SSD Samsung", 450],
  duration: 5,
  operation: "INSERT"
}
[2025-10-20 14:30:15] [INFO] [HTTP] [RequestID: 550e8400-e29b-41d4-a716-446655440000] POST /api/products 201 - 45ms
```

#### Arquivo JSON (logs/sql-2025-10-20.log):
```json
{
  "timestamp": "2025-10-20T14:30:15.125Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "level": "debug",
  "type": "sql",
  "message": "SQL INSERT executed",
  "sql": {
    "query": "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *",
    "params": ["SSD Samsung", 450],
    "duration": 5,
    "operation": "INSERT"
  }
}
```

---

### 🔍 Rastreamento de Logs

#### Filtrar todos os logs de uma requisição específica:

```bash
# No console
grep "550e8400-e29b-41d4-a716-446655440000" logs/*.log

# Em arquivos JSON
cat logs/http-2025-10-20.log | jq 'select(.requestId == "550e8400-e29b-41d4-a716-446655440000")'

# Encontrar queries SQL de uma requisição
cat logs/sql-2025-10-20.log | jq 'select(.requestId == "550e8400-e29b-41d4-a716-446655440000")'
```

#### Análise de Performance:

```bash
# Requisições lentas (> 1 segundo)
cat logs/http-*.log | jq 'select(.data.duration > 1000)'

# Queries SQL lentas de uma requisição
cat logs/sql-*.log | jq 'select(.requestId == "550e8400..." and .sql.duration > 100)'
```

---

### ⚙️ Configuração

#### .env
```bash
# Logs habilitados
LOG_ENABLED=true
LOG_LEVEL=debug        # debug, info, warn, error
LOG_SQL=true           # Logar queries SQL
LOG_HTTP=true          # Logar requisições HTTP
LOG_FILE_PATH=./logs   # Pasta dos logs
```

#### Express Setup
```typescript
import { TracingMiddleware } from 'framework-reactjs-api/core/tracing/TracingMiddleware';
import { HTTPLoggerMiddleware } from 'framework-reactjs-api/infra/logger/HTTPLoggerMiddleware';

// IMPORTANTE: TracingMiddleware DEVE ser o primeiro!
app.use(TracingMiddleware.addRequestId());
app.use(HTTPLoggerMiddleware.log());
```

---

### ✅ Benefícios

#### 1. **Rastreabilidade Total**
- ✅ Cada requisição tem um UUID único
- ✅ Fácil correlacionar logs de diferentes camadas
- ✅ Debug muito mais rápido em produção

#### 2. **Logs SQL Rastreáveis**
- ✅ Todas as queries incluem o requestId
- ✅ Possível ver todas as queries de uma requisição específica
- ✅ Análise de performance por requisição

#### 3. **Zero Configuração Manual**
- ✅ UUID gerado automaticamente
- ✅ Propagado via AsyncLocalStorage (sem passar parâmetros)
- ✅ Funciona em toda a aplicação

#### 4. **Integração com Ferramentas**
- ✅ Logs em formato JSON para ELK Stack
- ✅ Compatível com Grafana Loki
- ✅ Fácil integração com APM tools

#### 5. **Exemplo Prático Completo**
- ✅ API REST funcional
- ✅ Todas as camadas (Route → Business → Repository → ORM)
- ✅ Script de teste automatizado
- ✅ Pronto para copiar e usar

---

### 📝 Arquivos Modificados/Criados

#### Modificados:
1. `src/infra/logger/Logger.ts` - Adicionado requestId
2. `src/infra/db/CustomORM.ts` - Import TracingService
3. `src/infra/logger/HTTPLoggerMiddleware.ts` - Import TracingService

#### Criados:
1. `docs/LOGGING-WITH-UUID.md` - Documentação completa
2. `examples/logging-example/README.md` - Guia do exemplo
3. `examples/logging-example/package.json`
4. `examples/logging-example/tsconfig.json`
5. `examples/logging-example/.env.example`
6. `examples/logging-example/src/index.ts`
7. `examples/logging-example/src/routes/products.ts`
8. `examples/logging-example/src/business/ProductBusiness.ts`
9. `examples/logging-example/src/repository/ProductRepository.ts`
10. `examples/logging-example/migrations/001_create_products_table.sql`
11. `examples/logging-example/test-logging.sh`

---

### 🎓 Aprendizados/Técnicas Utilizadas

1. ✅ **AsyncLocalStorage**: Contexto assíncrono sem poluir parâmetros
2. ✅ **UUID v4**: IDs únicos e globalmente reconhecidos
3. ✅ **Structured Logging**: JSON para facilitar parsing
4. ✅ **Correlation IDs**: Padrão de rastreamento distribuído
5. ✅ **Middleware Pipeline**: TracingMiddleware → HTTPLoggerMiddleware
6. ✅ **Separation of Concerns**: Logger não precisa saber de HTTP
7. ✅ **Backward Compatible**: Não quebra código existente

---

### 🚀 Como Testar o Exemplo

```bash
# 1. Ir para a pasta do exemplo
cd examples/logging-example

# 2. Copiar .env
cp .env.example .env

# 3. Criar banco de dados
createdb logging_example

# 4. Rodar migração
psql -d logging_example -f migrations/001_create_products_table.sql

# 5. Instalar dependências
npm install

# 6. Iniciar servidor
npm run dev

# 7. Em outro terminal, rodar testes
chmod +x test-logging.sh
./test-logging.sh

# 8. Ver logs
cat ../../logs/http-*.log | tail -50
cat ../../logs/sql-*.log | tail -50
```

---

### 🎯 Casos de Uso

#### 1. **Debugging em Produção**
```bash
# Cliente reporta erro em requisição específica
# Você obtém o requestId do header de resposta
curl -I https://api.exemplo.com/api/products
# X-Request-ID: 550e8400-e29b-41d4-a716-446655440000

# Agora você pode ver TUDO que aconteceu nessa requisição
cat logs/*.log | grep "550e8400-e29b-41d4-a716-446655440000"
```

#### 2. **Análise de Performance**
```bash
# Identificar requisições lentas
cat logs/http-*.log | jq 'select(.data.duration > 1000)' > slow-requests.json

# Para cada requisição lenta, ver suas queries SQL
cat logs/sql-*.log | jq 'select(.requestId == "abc-123")'
```

#### 3. **Auditoria**
```bash
# Rastrear todas as operações de um usuário
cat logs/*.log | jq 'select(.user.id == 42)'

# Ver todas as queries SQL executadas por um usuário
cat logs/sql-*.log | jq 'select(.user.id == 42)'
```

---

## 📋 Histórico de Implementações

### ✅ 2. Auto-Start do Scheduler (Outubro 2025)

## ✅ Implementações Concluídas

### 1. **Variáveis de Ambiente** (.env.example)

Adicionadas 5 novas variáveis de ambiente para controlar o scheduler:

```bash
SCHEDULER_ENABLED=true              # Habilitar/desabilitar scheduler
SCHEDULER_AUTO_START=true           # Iniciar automaticamente
SCHEDULER_MAX_CONCURRENT=5          # Máximo de jobs simultâneos
SCHEDULER_CHECK_INTERVAL=60000      # Intervalo de verificação (ms)
SCHEDULER_STUCK_THRESHOLD=30        # Limite para job travado (min)
```

**Arquivo:** `/workspaces/framework-reactjs-api/.env.example`

---

### 2. **Configuração Automática** (FrameworkSetup.ts)

Modificado `defaultOptions` para ler variáveis de ambiente:

```typescript
const defaultOptions: FrameworkOptions = {
  enableScheduler: process.env.SCHEDULER_ENABLED === 'true',
  schedulerOptions: {
    enabled: process.env.SCHEDULER_ENABLED === 'true',
    autoStart: process.env.SCHEDULER_AUTO_START !== 'false', // true por padrão
    maxConcurrent: parseInt(process.env.SCHEDULER_MAX_CONCURRENT || '5', 10),
    checkInterval: parseInt(process.env.SCHEDULER_CHECK_INTERVAL || '60000', 10),
    stuckJobThreshold: parseInt(process.env.SCHEDULER_STUCK_THRESHOLD || '30', 10)
  }
};
```

**Arquivo:** `src/core/setup/FrameworkSetup.ts` (linhas 61-70)

---

### 3. **Auto-Start Inteligente** (FrameworkSetup.ts)

Adicionada lógica de inicialização automática:

```typescript
if (config.enableScheduler) {
  schedulerServiceInstance = new SchedulerService(config.schedulerOptions);
  registerSchedulerInstance(schedulerServiceInstance);
  
  // 🚀 NOVO: Iniciar automaticamente se configurado
  if (config.schedulerOptions?.autoStart !== false) {
    schedulerServiceInstance.start()
      .then(() => {
        console.log('🚀 Scheduler iniciado automaticamente');
      })
      .catch((error) => {
        console.error('❌ Erro ao iniciar scheduler:', error);
      });
  } else {
    console.log('⏸️  Scheduler criado mas não iniciado (autoStart=false)');
    console.log('   Para iniciar: POST /api/scheduler/start');
  }
  
  // Configurar rotas...
}
```

**Arquivo:** `src/core/setup/FrameworkSetup.ts` (linhas 126-146)

---

### 4. **Exemplo Completo** (scheduler-example/)

Criado exemplo funcional demonstrando o auto-start:

#### 📁 Estrutura:
```
examples/scheduler-example/
├── .env.example                     # ✅ Variáveis de ambiente
├── package.json                     # ✅ Dependências
├── tsconfig.json                    # ✅ Config TypeScript
├── src/
│   ├── index.ts                     # ✅ Servidor Express
│   └── services/
│       └── CleanupService.ts        # ✅ Service de exemplo
└── seeds/
    └── 001_insert_example_jobs.sql  # ✅ Jobs de exemplo
```

#### 📄 Arquivos Criados:

1. **`.env.example`**: Configurações completas do scheduler
2. **`src/index.ts`**: Express app com auto-start configurado
3. **`src/services/CleanupService.ts`**: Service com 4 métodos de exemplo
4. **`seeds/001_insert_example_jobs.sql`**: 5 jobs de exemplo para testar
5. **`package.json`**: Dependências e scripts
6. **`tsconfig.json`**: Configuração TypeScript
7. **`README.md`**: Documentação completa (atualizada)

---

### 5. **Documentação** (docs/)

Criados/atualizados 3 documentos:

#### 📄 AUTO-START-SCHEDULER.md (NOVO)
Guia completo sobre auto-start:
- Configuração de variáveis de ambiente
- Exemplos de uso
- Casos de uso (produção, dev, testes)
- Troubleshooting
- Checklist

#### 📄 SCHEDULER-API.md (ATUALIZADO)
Adicionado seção de configuração:
- Setup com variáveis de ambiente
- Output esperado com auto-start
- Exemplos atualizados

---

## 🎯 Comportamento

### ✅ Com `SCHEDULER_AUTO_START=true` (padrão)

```bash
npm run dev
```

**Output:**
```
🚀 Servidor rodando na porta 3000
✅ Scheduler habilitado e rotas configuradas em: /api/scheduler
🚀 Scheduler iniciado automaticamente
📅 10 jobs carregados e agendados
   - Job 'cleanup-users' agendado: 0 2 * * *
   - Job 'send-reports' agendado: 0 8 * * *
   ...
```

**Resultado:**
- ✅ Scheduler inicia sozinho
- ✅ Jobs são carregados do banco
- ✅ Execuções começam conforme schedule
- ✅ **Zero intervenção manual necessária**

---

### ⏸️ Com `SCHEDULER_AUTO_START=false`

```bash
npm run dev
```

**Output:**
```
🚀 Servidor rodando na porta 3000
✅ Scheduler habilitado e rotas configuradas em: /api/scheduler
⏸️  Scheduler criado mas não iniciado (autoStart=false)
   Para iniciar: POST /api/scheduler/start
```

**Resultado:**
- ⏸️  Scheduler não inicia
- 🔧 Precisa ser iniciado via API: `POST /api/scheduler/start`
- 🎯 Útil para desenvolvimento/testes

---

## 📊 Comparação

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Inicialização** | Manual via código | Automática via .env |
| **Configuração** | Hardcoded | Variáveis de ambiente |
| **Jobs** | Precisava chamar `start()` | Iniciam sozinhos |
| **Controle** | Apenas programático | .env + API REST |
| **Produção** | Configurar no código | Apenas mudar .env |

---

## 🚀 Como Usar (Guia Rápido)

### 1. Configurar .env

```bash
cp .env.example .env

# Editar .env
SCHEDULER_ENABLED=true
SCHEDULER_AUTO_START=true
```

### 2. Configurar Express

```typescript
import { setupFramework } from 'framework-reactjs-api';

setupFramework(app, {
  enableScheduler: true  // Usa configs do .env
});
```

### 3. Cadastrar Jobs

```sql
INSERT INTO scheduled_jobs (
  name, service_name, service_method, 
  service_path, schedule, enabled
) VALUES (
  'my-job', 'MyService', 'myMethod',
  'services/MyService', '0 2 * * *', true
);
```

### 4. Rodar

```bash
npm run dev
```

**Pronto! Jobs executam automaticamente** 🎉

---

## ✅ Checklist Final

- [x] Variáveis de ambiente documentadas
- [x] Auto-start implementado
- [x] Logs informativos (iniciado/não iniciado)
- [x] Exemplo funcional criado
- [x] Documentação completa
- [x] Compilação bem-sucedida
- [x] Backward compatible (não quebra código existente)
- [x] Configurável via .env
- [x] Controle manual disponível (POST /start)
- [x] Shutdown graceful mantido

---

## 📝 Arquivos Modificados

### Modificados:
1. `/workspaces/framework-reactjs-api/.env.example` (linhas 58-80)
2. `src/core/setup/FrameworkSetup.ts` (linhas 61-70, 126-146)
3. `docs/SCHEDULER-API.md` (linhas 1-80)

### Criados:
1. `docs/AUTO-START-SCHEDULER.md` (novo)
2. `examples/scheduler-example/.env.example` (novo)
3. `examples/scheduler-example/src/index.ts` (novo)
4. `examples/scheduler-example/src/services/CleanupService.ts` (novo)
5. `examples/scheduler-example/seeds/001_insert_example_jobs.sql` (novo)
6. `examples/scheduler-example/package.json` (novo)
7. `examples/scheduler-example/tsconfig.json` (novo)
8. `examples/scheduler-example/README.md` (atualizado)

---

## 🎓 O Que Foi Aprendido/Implementado

1. ✅ **Configuração via Environment Variables**: Boa prática para diferentes ambientes
2. ✅ **Auto-Start Inteligente**: Scheduler inicia automaticamente ou sob demanda
3. ✅ **Logs Informativos**: Usuário sabe exatamente o que está acontecendo
4. ✅ **Documentação Completa**: 3 documentos cobrindo todos os aspectos
5. ✅ **Exemplo Prático**: Projeto funcional pronto para copiar/colar
6. ✅ **Backward Compatibility**: Não quebra projetos existentes
7. ✅ **Shutdown Graceful**: Manutenção do comportamento anterior
8. ✅ **Flexibilidade**: Auto-start pode ser desabilitado quando necessário

---

## 🎯 Benefícios

### Para o Desenvolvedor:
- ✅ **Zero configuração** em produção (apenas .env)
- ✅ **Controle total** em desenvolvimento (auto-start=false)
- ✅ **Feedback imediato** via logs
- ✅ **Exemplo pronto** para usar

### Para a Aplicação:
- ✅ **Alta disponibilidade** (jobs iniciam sozinhos)
- ✅ **Configuração flexível** (dev vs prod)
- ✅ **Menos erros** (não esquecer de iniciar)
- ✅ **Monitoramento fácil** (via logs e API)

---

**Versão:** 1.0.2  
**Data:** 20 de Outubro de 2025  
**Status:** ✅ Implementado, testado e documentado  
**Compilação:** ✅ Sucesso (0 erros)
