"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductService_1 = require("../ProductService");
const AuthMiddleware_1 = require("../../../core/auth/AuthMiddleware");
// Criação do roteador para Product
const productRouter = (0, express_1.Router)();
const productService = new ProductService_1.ProductService();
const authMiddleware = new AuthMiddleware_1.AuthMiddleware();
/**
 * @route GET /api/products
 * @description Buscar todos os registros de Product com paginação
 * @access Public
 */
productRouter.get('/', async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const result = await productService.getAll(page, limit);
        if (result.success) {
            return res.status(200).json(result);
        }
        else {
            return res.status(500).json(result);
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
/**
 * @route GET /api/products/:id
 * @description Buscar um registro específico de Product por ID
 * @access Public
 */
productRouter.get('/:id', async (req, res) => {
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
        const result = await productService.getById(id);
        if (result.success) {
            return res.status(200).json(result);
        }
        else {
            if (result.error === 'NOT_FOUND') {
                return res.status(404).json(result);
            }
            return res.status(500).json(result);
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
/**
 * @route POST /api/products
 * @description Criar um novo registro de Product
 * @access Private (requer autenticação)
 */
productRouter.post('/', authMiddleware.authenticate(), async (req, res) => {
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
        const result = await productService.create(data);
        if (result.success) {
            return res.status(201).json(result);
        }
        else {
            return res.status(400).json(result);
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
/**
 * @route PUT /api/products/:id
 * @description Atualizar um registro existente de Product
 * @access Private (requer autenticação)
 */
productRouter.put('/:id', authMiddleware.authenticate(), async (req, res) => {
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
        const result = await productService.update(id, data);
        if (result.success) {
            return res.status(200).json(result);
        }
        else {
            if (result.error === 'NOT_FOUND') {
                return res.status(404).json(result);
            }
            return res.status(400).json(result);
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
/**
 * @route DELETE /api/products/:id
 * @description Excluir um registro de Product
 * @access Private (requer autenticação)
 */
productRouter.delete('/:id', authMiddleware.authenticate(), async (req, res) => {
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
        const result = await productService.delete(id);
        if (result.success) {
            return res.status(200).json(result);
        }
        else {
            if (result.error === 'NOT_FOUND') {
                return res.status(404).json(result);
            }
            return res.status(500).json(result);
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
exports.default = productRouter;
/**
 * Exemplo de uso em um app Express:
 *
 * import express from 'express';
 * import productRouter from './use-cases/product/routes/ProductRoutes';
 *
 * const app = express();
 * app.use(express.json());
 *
 * // Registrar as rotas
 * app.use('/api/products', productRouter);
 *
 * app.listen(3000, () => {
 *   console.log('Servidor rodando na porta 3000');
 * });
 */ 
//# sourceMappingURL=ProductRoutes.js.map