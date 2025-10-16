import { Router, Request, Response } from 'express';
import { UserService } from '../UserService';

const router = Router();
const service = new UserService();

/**
 * GET /user
 * Listar todos os registros
 */
router.get('/', async (req: Request, res: Response) => {
  const { limit, offset, orderBy, ...conditions } = req.query;
  
  const result = await service.findAll({
    conditions: Object.keys(conditions).length > 0 ? conditions as Record<string, any> : undefined,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
    orderBy: orderBy as string,
    includes: req.query.includes ? String(req.query.includes).split(',') : undefined,
  });

  return res.status(result.status).json(result);
});

/**
 * GET /user/:id
 * Buscar registro por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  const result = await service.findById(id);
  
  return res.status(result.status).json(result);
});

/**
 * POST /user
 * Criar novo registro
 */
router.post('/', async (req: Request, res: Response) => {
  const result = await service.create(req.body);
  
  return res.status(result.status).json(result);
});

/**
 * PUT /user/:id
 * Atualizar registro existente
 */
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  const result = await service.update(id, req.body);
  
  return res.status(result.status).json(result);
});

/**
 * DELETE /user/:id
 * Deletar registro
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  const result = await service.delete(id);
  
  return res.status(result.status).json(result);
});

/**
 * GET /user/count
 * Contar registros
 */
router.get('/count', async (req: Request, res: Response) => {
  const result = await service.count(req.query as Record<string, any>);
  
  return res.status(result.status).json(result);
});

export default router;

/**
 * Exemplo de uso em um app Express:
 * 
 * import express from 'express';
 * import userRouter from './use-cases/user/routes/UserRoutes';
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * // Registrar as rotas
 * app.use('/api/user', userRouter);
 * 
 * app.listen(3000, () => {
 *   console.log('Servidor rodando na porta 3000');
 * });
 */