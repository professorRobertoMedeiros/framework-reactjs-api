import { Router } from 'express';
import { OrderService } from '../OrderService';
import { AuthMiddleware } from '../../../core/auth/AuthMiddleware';

// Criação do roteador para Order
const orderRouter = Router();
const orderService = new OrderService();
const authMiddleware = new AuthMiddleware();

/**
 * @route GET /api/orders
 * @description Buscar todos os registros de Order com paginação
 * @access Public
 */
orderRouter.get('/', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await orderService.getAll(page, limit);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route GET /api/orders/:id
 * @description Buscar um registro específico de Order por ID
 * @access Public
 */
orderRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validar se ID é um número válido
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido fornecido',
        error: 'INVALID_ID'
      });
    }
    
    const result = await orderService.getById(id);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(500).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route POST /api/orders
 * @description Criar um novo registro de Order
 * @access Private (requer autenticação)
 */
orderRouter.post('/', authMiddleware.authenticate(), async (req, res) => {
  try {
    const data = req.body;
    
    // Validação básica - verificar se body não está vazio
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados não fornecidos',
        error: 'INVALID_DATA'
      });
    }
    
    const result = await orderService.create(data);
    
    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/orders/:id
 * @description Atualizar um registro existente de Order
 * @access Private (requer autenticação)
 */
orderRouter.put('/:id', authMiddleware.authenticate(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    
    // Validar se ID é um número válido
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido fornecido',
        error: 'INVALID_ID'
      });
    }
    
    // Validação básica - verificar se body não está vazio
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados não fornecidos para atualização',
        error: 'INVALID_DATA'
      });
    }
    
    const result = await orderService.update(id, data);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/orders/:id
 * @description Excluir um registro de Order
 * @access Private (requer autenticação)
 */
orderRouter.delete('/:id', authMiddleware.authenticate(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validar se ID é um número válido
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido fornecido',
        error: 'INVALID_ID'
      });
    }
    
    const result = await orderService.delete(id);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(500).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

export default orderRouter;

/**
 * Exemplo de uso em um app Express:
 * 
 * import express from 'express';
 * import orderRouter from './use-cases/order/routes/OrderRoutes';
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * // Registrar as rotas
 * app.use('/api/orders', orderRouter);
 * 
 * app.listen(3000, () => {
 *   console.log('Servidor rodando na porta 3000');
 * });
 */