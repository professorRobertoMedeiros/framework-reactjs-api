import express, { Express, Request, Response } from 'express';
import { 
  initializeORM,
  requestContextMiddleware,
  captureUserMiddleware,
  AuthMiddleware,
  authRoutes
} from 'framework-reactjs-api';
import { ProductModel } from './models/ProductModel';
import { ProductRepository } from './repositories/ProductRepository';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middlewares do Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ORDEM CRÍTICA DOS MIDDLEWARES =====
// 1. RequestContext PRIMEIRO (inicializa AsyncLocalStorage)
app.use(requestContextMiddleware);

// 2. Autenticação (define req.user)
const authMiddleware = new AuthMiddleware();

// 3. Captura do usuário para o contexto (após autenticação)
app.use(captureUserMiddleware);

// ===== ROTAS PÚBLICAS (sem autenticação) =====
app.use('/api/auth', authRoutes);

// ===== ROTAS PROTEGIDAS (requerem autenticação) =====
// Rota de teste: criar produto com auditoria automática
app.post('/api/products', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    // Repository busca usuário AUTOMATICAMENTE do RequestContext
    const productRepo = new ProductRepository(ProductModel, true);
    
    const product = await productRepo.create({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description
    });
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Produto criado com sucesso. Verifique audit_logs!'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Rota de teste: atualizar produto
app.put('/api/products/:id', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const productRepo = new ProductRepository(ProductModel, true);
    
    const product = await productRepo.update(parseInt(req.params.id), {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: product,
      message: 'Produto atualizado. Verifique audit_logs!'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Rota de teste: listar produtos
app.get('/api/products', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const productRepo = new ProductRepository(ProductModel, false); // Sem auditoria em SELECT
    const products = await productRepo.findAll();
    
    res.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Health check (sem autenticação)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Inicializar ORM e servidor
async function startServer() {
  try {
    // Inicializar banco de dados
    await initializeORM();
    console.log('✅ Database connected');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📝 API Docs:`);
      console.log(`   POST /api/auth/login - Login (público)`);
      console.log(`   POST /api/products - Criar produto (protegido)`);
      console.log(`   PUT /api/products/:id - Atualizar produto (protegido)`);
      console.log(`   GET /api/products - Listar produtos (protegido)`);
      console.log(`   GET /health - Health check (público)`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
