import { Router } from 'express';
import { ClienteService } from '../ClienteService';
import { AuthMiddleware } from '../../../core/auth/AuthMiddleware';

// Criação do roteador para Cliente
const clienteRouter = Router();
const clienteService = new ClienteService();
const authMiddleware = new AuthMiddleware();

/**
 * @route GET /api/clientes
 * @description Buscar todos os registros de Cliente com paginação
 * @access Public
 */
clienteRouter.get('/', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await clienteService.getAll(page, limit);
    
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
 * @route GET /api/clientes/:id
 * @description Buscar um registro específico de Cliente por ID
 * @access Public
 */
clienteRouter.get('/:id', async (req, res) => {
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
    
    const result = await clienteService.getById(id);
    
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
 * @route POST /api/clientes
 * @description Criar um novo registro de Cliente
 * @access Private (requer autenticação)
 */
clienteRouter.post('/', authMiddleware.authenticate(), async (req, res) => {
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
    
    const result = await clienteService.create(data);
    
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
 * @route PUT /api/clientes/:id
 * @description Atualizar um registro existente de Cliente
 * @access Private (requer autenticação)
 */
clienteRouter.put('/:id', authMiddleware.authenticate(), async (req, res) => {
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
    
    const result = await clienteService.update(id, data);
    
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
 * @route DELETE /api/clientes/:id
 * @description Excluir um registro de Cliente
 * @access Private (requer autenticação)
 */
clienteRouter.delete('/:id', authMiddleware.authenticate(), async (req, res) => {
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
    
    const result = await clienteService.delete(id);
    
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

export default clienteRouter;

/**
 * Exemplo de uso em um app Express:
 * 
 * import express from 'express';
 * import clienteRouter from './use-cases/cliente/routes/ClienteRoutes';
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * // Registrar as rotas
 * app.use('/api/clientes', clienteRouter);
 * 
 * app.listen(3000, () => {
 *   console.log('Servidor rodando na porta 3000');
 * });
 */