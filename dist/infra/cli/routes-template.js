"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoutesTemplate = generateRoutesTemplate;
const utils_1 = require("./utils");
/**
 * Função auxiliar para gerar o template de rotas
 * @param modelName Nome do modelo
 * @returns Template de arquivo de rotas
 */
function generateRoutesTemplate(modelName) {
    const insideFramework = (0, utils_1.isInsideFramework)();
    // Determinar os caminhos de importação corretos baseado no contexto
    const authImport = insideFramework
        ? "import { AuthMiddleware } from '../../core/auth/AuthMiddleware';\n" +
            "import { TracingMiddleware, LoggingService } from '../../core/tracing';"
        : "import { AuthMiddleware, TracingMiddleware, LoggingService } from 'framework-reactjs-api';";
    // Criar o template
    return `import { Router, Request, Response } from 'express';
import { ${modelName}Service } from '../${modelName}Service';
${authImport}

const router = Router();
const service = new ${modelName}Service();
const authMiddleware = new AuthMiddleware();

// Aplicar middleware de rastreamento a todas as rotas
router.use(TracingMiddleware.addRequestId());

/**
 * GET /${modelName.toLowerCase()}
 * Listar todos os registros (PRIVADO - Requer autenticação)
 */
router.get('/', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    LoggingService.info('Buscando registros', { 
      entity: '${modelName}',
      query: req.query
    });
    
    const { limit, offset, orderBy, ...conditions } = req.query;
    
    const result = await service.findAll({
      conditions: Object.keys(conditions).length > 0 ? conditions as Record<string, any> : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      orderBy: orderBy as string,
      includes: req.query.includes ? String(req.query.includes).split(',') : undefined,
    });
    
    LoggingService.info('Registros encontrados', { 
      entity: '${modelName}',
      count: result.data ? result.data.length : 0 
    });
    
    return res.status(result.status).json(result);
  } catch (error) {
    // Garantir que error seja tratado como Error ou converter para um objeto Error
    const err = error instanceof Error ? error : new Error(String(error));
    
    LoggingService.error('Erro ao buscar registros', err, { entity: '${modelName}' });
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: err.message
    });
  }
});

/**
 * GET /${modelName.toLowerCase()}/:id
 * Buscar registro por ID (PRIVADO - Requer autenticação)
 */
router.get('/:id', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    LoggingService.info('Buscando registro por ID', { 
      entity: '${modelName}',
      id
    });
    
    const result = await service.findById(id);
    
    LoggingService.info('Resultado da busca por ID', { 
      entity: '${modelName}',
      id,
      found: result.success
    });
    
    return res.status(result.status).json(result);
  } catch (error) {
    // Converter para Error se não for
    const err = error instanceof Error ? error : new Error(String(error));
    
    LoggingService.error('Erro ao buscar registro por ID', err, { 
      entity: '${modelName}',
      id: req.params.id
    });
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: err.message
    });
  }
});

/**
 * POST /${modelName.toLowerCase()}
 * Criar novo registro (PRIVADO - Requer autenticação)
 */
router.post('/', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    LoggingService.info('Criando novo registro', { 
      entity: '${modelName}'
    });
    
    const result = await service.create(req.body);
    
    LoggingService.info('Registro criado', { 
      entity: '${modelName}',
      success: result.success,
      id: result.data?.id
    });
    
    return res.status(result.status).json(result);
  } catch (error) {
    // Converter para Error se não for
    const err = error instanceof Error ? error : new Error(String(error));
    
    LoggingService.error('Erro ao criar registro', err, { entity: '${modelName}' });
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: err.message
    });
  }
});

/**
 * PUT /${modelName.toLowerCase()}/:id
 * Atualizar registro existente (PRIVADO - Requer autenticação)
 */
router.put('/:id', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    LoggingService.info('Atualizando registro', { 
      entity: '${modelName}',
      id
    });
    
    const result = await service.update(id, req.body);
    
    LoggingService.info('Registro atualizado', { 
      entity: '${modelName}',
      id,
      success: result.success
    });
    
    return res.status(result.status).json(result);
  } catch (error) {
    // Converter para Error se não for
    const err = error instanceof Error ? error : new Error(String(error));
    
    LoggingService.error('Erro ao atualizar registro', err, { 
      entity: '${modelName}',
      id: req.params.id
    });
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: err.message
    });
  }
});

/**
 * DELETE /${modelName.toLowerCase()}/:id
 * Deletar registro (PRIVADO - Requer autenticação)
 */
router.delete('/:id', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    LoggingService.info('Excluindo registro', { 
      entity: '${modelName}',
      id
    });
    
    const result = await service.delete(id);
    
    LoggingService.info('Registro excluído', { 
      entity: '${modelName}',
      id,
      success: result.success
    });
    
    return res.status(result.status).json(result);
  } catch (error) {
    // Converter para Error se não for
    const err = error instanceof Error ? error : new Error(String(error));
    
    LoggingService.error('Erro ao excluir registro', err, { 
      entity: '${modelName}',
      id: req.params.id
    });
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: err.message
    });
  }
});

/**
 * GET /${modelName.toLowerCase()}/count
 * Contar registros (PRIVADO - Requer autenticação)
 */
router.get('/count', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    LoggingService.info('Contando registros', { 
      entity: '${modelName}',
      filters: req.query
    });
    
    const result = await service.count(req.query as Record<string, any>);
    
    LoggingService.info('Contagem concluída', { 
      entity: '${modelName}',
      count: result.data
    });
    
    return res.status(result.status).json(result);
  } catch (error) {
    // Converter para Error se não for
    const err = error instanceof Error ? error : new Error(String(error));
    
    LoggingService.error('Erro ao contar registros', err, { entity: '${modelName}' });
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: err.message
    });
  }
});

export default router;

/**
 * Exemplo de uso em um app Express:
 * 
 * import express from 'express';
 * import ${modelName.toLowerCase()}Router from './use-cases/${modelName.toLowerCase()}/routes/${modelName}Routes';
 * import authRouter from 'framework-reactjs-api/routes/auth';  // Rota de login do framework
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * // Aplicar middleware de rastreamento global
 * app.use(TracingMiddleware.addRequestId());
 * 
 * // Rotas
 * app.use('/api/${modelName.toLowerCase()}s', ${modelName.toLowerCase()}Router);
 * app.use('/api/auth', authRouter);
 * 
 * app.listen(3000);
 */`;
}
//# sourceMappingURL=routes-template.js.map