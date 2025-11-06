"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoutesTemplate = generateRoutesTemplate;
const utils_1 = require("./utils");
/**
 * Função auxiliar para gerar exemplo do modelo baseado nas propriedades
 */
function generateModelExample(properties) {
    if (properties.length === 0) {
        return '         field: value';
    }
    return properties
        .filter(p => !p.isId && !p.isTimestamp) // Excluir id e campos de timestamp
        .slice(0, 5) // Máximo de 5 campos no exemplo
        .map(p => {
        let exampleValue;
        // Gerar valor de exemplo baseado no tipo
        if (p.type === 'string') {
            exampleValue = `"exemplo de ${p.name}"`;
        }
        else if (p.type === 'number') {
            exampleValue = p.name.includes('price') || p.name.includes('preco') ? '99.90' : '1';
        }
        else if (p.type === 'boolean') {
            exampleValue = 'true';
        }
        else if (p.type === 'Date') {
            exampleValue = '"2025-11-05T12:00:00Z"';
        }
        else {
            exampleValue = 'null';
        }
        return `         ${p.name}: ${exampleValue}`;
    })
        .join('\n');
}
/**
 * Função auxiliar para gerar o template de rotas
 * @param modelName Nome do modelo
 * @param properties Propriedades do modelo (opcional)
 * @returns Template de arquivo de rotas
 */
function generateRoutesTemplate(modelName, properties = []) {
    const insideFramework = (0, utils_1.isInsideFramework)();
    // Determinar os caminhos de importação corretos baseado no contexto
    const authImport = insideFramework
        ? "import { AuthMiddleware } from '../../core/auth/AuthMiddleware';\n" +
            "import { TracingMiddleware, LoggingService } from '../../core/tracing';"
        : "import { AuthMiddleware, TracingMiddleware, LoggingService } from 'framework-reactjs-api';";
    const lowerModelName = modelName.toLowerCase();
    const pluralLowerModelName = `${lowerModelName}s`;
    // Gerar exemplos para os schemas
    const createExample = generateModelExample(properties);
    const updateExample = generateModelExample(properties);
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
 * @swagger
 * components:
 *   schemas:
 *     ${modelName}:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: ID único do ${lowerModelName}
 *       example:
 *         id: 1
 *     ${modelName}CreateRequest:
 *       type: object
 *       description: Dados para criar um ${lowerModelName}
 *       example:
${createExample}
 *     ${modelName}UpdateRequest:
 *       type: object
 *       description: Dados para atualizar um ${lowerModelName}
 *       example:
${updateExample}
 */

/**
 * @swagger
 * /api/${pluralLowerModelName}:
 *   get:
 *     tags:
 *       - ${modelName}
 *     summary: Listar todos os ${pluralLowerModelName}
 *     description: Retorna uma lista de ${pluralLowerModelName} com opções de filtro, paginação e ordenação
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Número máximo de registros a retornar
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *         description: Número de registros a pular
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Número da página (alternativa ao offset)
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Campo para ordenação (ex: 'created_at DESC')
 *       - in: query
 *         name: includes
 *         schema:
 *           type: string
 *         description: Relações para incluir (separadas por vírgula)
 *     responses:
 *       200:
 *         description: Lista de ${pluralLowerModelName} retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/${modelName}'
 *                 message:
 *                   type: string
 *                   example: Registros recuperados com sucesso
 *       401:
 *         description: Não autorizado - Token inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    LoggingService.info('Buscando registros', { 
      entity: '${modelName}',
      query: req.query
    });
    
    // Extrair parâmetros de query
    const { limit, offset, orderBy, includes, ...conditions } = req.query;
    
    // Montar opções de consulta - O BaseRepository trata tudo automaticamente
    const result = await service.findAll({
      conditions: Object.keys(conditions).length > 0 ? conditions as Record<string, any> : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      orderBy: orderBy as string,
      includes: includes ? String(includes).split(',') : undefined,
    });
    
    LoggingService.info('Registros encontrados', { 
      entity: '${modelName}',
      count: result.data ? result.data.length : 0,
      status: result.status
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
 * @swagger
 * /api/${pluralLowerModelName}/{id}:
 *   get:
 *     tags:
 *       - ${modelName}
 *     summary: Buscar ${lowerModelName} por ID
 *     description: Retorna um ${lowerModelName} específico pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do ${lowerModelName}
 *     responses:
 *       200:
 *         description: ${modelName} encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/${modelName}'
 *                 message:
 *                   type: string
 *                   example: Registro recuperado com sucesso
 *       404:
 *         description: ${modelName} não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
      found: !!result.data,
      status: result.status
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
 * @swagger
 * /api/${pluralLowerModelName}:
 *   post:
 *     tags:
 *       - ${modelName}
 *     summary: Criar novo ${lowerModelName}
 *     description: Cria um novo registro de ${lowerModelName}
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${modelName}CreateRequest'
 *     responses:
 *       201:
 *         description: ${modelName} criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/${modelName}'
 *                 message:
 *                   type: string
 *                   example: Registro criado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    LoggingService.info('Criando novo registro', { 
      entity: '${modelName}'
    });
    
    const result = await service.create(req.body);
    
    LoggingService.info('Registro criado', { 
      entity: '${modelName}',
      status: result.status,
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
 * @swagger
 * /api/${pluralLowerModelName}/{id}:
 *   put:
 *     tags:
 *       - ${modelName}
 *     summary: Atualizar ${lowerModelName}
 *     description: Atualiza os dados de um ${lowerModelName} existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do ${lowerModelName}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${modelName}UpdateRequest'
 *     responses:
 *       200:
 *         description: ${modelName} atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/${modelName}'
 *                 message:
 *                   type: string
 *                   example: Registro atualizado com sucesso
 *       404:
 *         description: ${modelName} não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
      status: result.status
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
 * @swagger
 * /api/${pluralLowerModelName}/{id}:
 *   delete:
 *     tags:
 *       - ${modelName}
 *     summary: Deletar ${lowerModelName}
 *     description: Remove um ${lowerModelName} do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do ${lowerModelName}
 *     responses:
 *       200:
 *         description: ${modelName} deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registro excluído com sucesso
 *       404:
 *         description: ${modelName} não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
      status: result.status
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
 * @swagger
 * /api/${pluralLowerModelName}/count:
 *   get:
 *     tags:
 *       - ${modelName}
 *     summary: Contar ${pluralLowerModelName}
 *     description: Retorna o número total de ${pluralLowerModelName} que correspondem aos filtros
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filters
 *         schema:
 *           type: object
 *         description: Filtros para aplicar na contagem
 *     responses:
 *       200:
 *         description: Contagem realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: number
 *                   example: 42
 *                 message:
 *                   type: string
 *                   example: Contagem realizada com sucesso
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * import { setupFramework } from 'framework-reactjs-api';
 * import ${modelName.toLowerCase()}Router from './use-cases/${modelName.toLowerCase()}/routes/${modelName}Routes';
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * // Configurar framework com Swagger
 * setupFramework(app, {
 *   enableSwagger: true,
 *   swaggerOptions: {
 *     title: 'My API',
 *     tags: [
 *       { name: '${modelName}', description: '${modelName} management endpoints' }
 *     ],
 *     apis: ['./src/**/*.ts'] // Path para escanear documentação Swagger
 *   }
 * });
 * 
 * // Rotas
 * app.use('/api/${pluralLowerModelName}', ${modelName.toLowerCase()}Router);
 * 
 * app.listen(3000, () => {
 *   console.log('Server running on port 3000');
 *   console.log('Swagger docs: http://localhost:3000/docs');
 * });
 */`;
}
//# sourceMappingURL=routes-template.js.map