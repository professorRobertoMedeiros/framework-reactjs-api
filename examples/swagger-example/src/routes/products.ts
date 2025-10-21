import { Router, Request, Response } from 'express';
import { LoggingService } from 'framework-reactjs-api';

const router = Router();

// Simular banco de dados em memória
let products = [
  { id: 1, name: 'Notebook Dell', price: 3500.00, stock: 10, active: true },
  { id: 2, name: 'Mouse Logitech', price: 150.00, stock: 50, active: true },
  { id: 3, name: 'Teclado Mecânico', price: 450.00, stock: 25, active: true }
];

let nextId = 4;

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: number
 *           description: ID único do produto
 *         name:
 *           type: string
 *           description: Nome do produto
 *         price:
 *           type: number
 *           format: float
 *           description: Preço do produto
 *         stock:
 *           type: number
 *           description: Quantidade em estoque
 *         active:
 *           type: boolean
 *           description: Status do produto
 *       example:
 *         id: 1
 *         name: Notebook Dell
 *         price: 3500.00
 *         stock: 10
 *         active: true
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Listar todos os produtos
 *     description: Retorna lista de produtos com filtros opcionais
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo/inativo
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Preço mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Preço máximo
 *     responses:
 *       200:
 *         description: Lista de produtos
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
 *                     $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: Produtos recuperados com sucesso
 */
router.get('/', (req: Request, res: Response) => {
  LoggingService.info('Listando produtos');
  
  let filtered = [...products];
  
  // Filtros
  if (req.query.active !== undefined) {
    filtered = filtered.filter(p => p.active === (req.query.active === 'true'));
  }
  
  if (req.query.minPrice) {
    filtered = filtered.filter(p => p.price >= Number(req.query.minPrice));
  }
  
  if (req.query.maxPrice) {
    filtered = filtered.filter(p => p.price <= Number(req.query.maxPrice));
  }
  
  res.json({
    status: 200,
    data: filtered,
    message: 'Produtos recuperados com sucesso'
  });
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Buscar produto por ID
 *     description: Retorna um produto específico pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: Produto recuperado com sucesso
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    LoggingService.warn('Produto não encontrado', { id });
    return res.status(404).json({
      status: 404,
      message: 'Produto não encontrado'
    });
  }
  
  LoggingService.info('Produto recuperado', { id });
  res.json({
    status: 200,
    data: product,
    message: 'Produto recuperado com sucesso'
  });
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Criar novo produto
 *     description: Adiciona um novo produto ao catálogo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: SSD Samsung 1TB
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 550.00
 *               stock:
 *                 type: number
 *                 example: 15
 *               active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: Produto criado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', (req: Request, res: Response) => {
  const { name, price, stock, active = true } = req.body;
  
  // Validações
  if (!name || !price || stock === undefined) {
    LoggingService.warn('Dados inválidos para criação de produto', req.body);
    return res.status(400).json({
      status: 400,
      message: 'Nome, preço e estoque são obrigatórios'
    });
  }
  
  const newProduct = {
    id: nextId++,
    name,
    price: Number(price),
    stock: Number(stock),
    active
  };
  
  products.push(newProduct);
  
  LoggingService.info('Produto criado', newProduct);
  res.status(201).json({
    status: 201,
    data: newProduct,
    message: 'Produto criado com sucesso'
  });
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Atualizar produto
 *     description: Atualiza os dados de um produto existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: Produto atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    LoggingService.warn('Produto não encontrado para atualização', { id });
    return res.status(404).json({
      status: 404,
      message: 'Produto não encontrado'
    });
  }
  
  const { name, price, stock, active } = req.body;
  
  products[index] = {
    ...products[index],
    ...(name && { name }),
    ...(price !== undefined && { price: Number(price) }),
    ...(stock !== undefined && { stock: Number(stock) }),
    ...(active !== undefined && { active })
  };
  
  LoggingService.info('Produto atualizado', products[index]);
  res.json({
    status: 200,
    data: products[index],
    message: 'Produto atualizado com sucesso'
  });
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Deletar produto
 *     description: Remove um produto do catálogo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Produto deletado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    LoggingService.warn('Produto não encontrado para exclusão', { id });
    return res.status(404).json({
      status: 404,
      message: 'Produto não encontrado'
    });
  }
  
  products.splice(index, 1);
  
  LoggingService.info('Produto deletado', { id });
  res.json({
    status: 200,
    message: 'Produto deletado com sucesso'
  });
});

export default router;
