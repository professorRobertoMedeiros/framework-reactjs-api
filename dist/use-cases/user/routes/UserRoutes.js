"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserService_1 = require("../UserService");
const router = (0, express_1.Router)();
const service = new UserService_1.UserService();
/**
 * GET /user
 * Listar todos os registros
 */
router.get('/', async (req, res) => {
    const { limit, offset, orderBy, ...conditions } = req.query;
    const result = await service.findAll({
        conditions: Object.keys(conditions).length > 0 ? conditions : undefined,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        orderBy: orderBy,
        includes: req.query.includes ? String(req.query.includes).split(',') : undefined,
    });
    return res.status(result.status).json(result);
});
/**
 * GET /user/:id
 * Buscar registro por ID
 */
router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const result = await service.findById(id);
    return res.status(result.status).json(result);
});
/**
 * POST /user
 * Criar novo registro
 */
router.post('/', async (req, res) => {
    const result = await service.create(req.body);
    return res.status(result.status).json(result);
});
/**
 * PUT /user/:id
 * Atualizar registro existente
 */
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const result = await service.update(id, req.body);
    return res.status(result.status).json(result);
});
/**
 * DELETE /user/:id
 * Deletar registro
 */
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const result = await service.delete(id);
    return res.status(result.status).json(result);
});
/**
 * GET /user/count
 * Contar registros
 */
router.get('/count', async (req, res) => {
    const result = await service.count(req.query);
    return res.status(result.status).json(result);
});
exports.default = router;
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
//# sourceMappingURL=UserRoutes.js.map