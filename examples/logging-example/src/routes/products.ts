import { Router, Request, Response } from 'express';
import { LoggingService } from '@framework/core/tracing/LoggingService';
import { TracingService } from '@framework/core/tracing/TracingService';
import { ProductBusiness } from '../business/ProductBusiness';

const router = Router();
const productBusiness = new ProductBusiness();

/**
 * GET /api/products
 * Lista todos os produtos
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const requestId = TracingService.getRequestId();
    
    LoggingService.info('Listing all products', { 
      endpoint: '/api/products',
      method: 'GET'
    });

    const products = await productBusiness.listAll();
    
    LoggingService.info('Products retrieved successfully', { 
      count: products.length 
    });

    res.json({
      requestId,
      success: true,
      data: products
    });
  } catch (error) {
    LoggingService.error('Error listing products', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list products'
    });
  }
});

/**
 * GET /api/products/:id
 * Busca um produto por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestId = TracingService.getRequestId();
    
    LoggingService.info('Fetching product by ID', { 
      productId: id 
    });

    const product = await productBusiness.findById(parseInt(id));
    
    if (!product) {
      LoggingService.warn('Product not found', { productId: id });
      return res.status(404).json({
        requestId,
        success: false,
        error: 'Product not found'
      });
    }

    LoggingService.info('Product found', { productId: id });

    res.json({
      requestId,
      success: true,
      data: product
    });
  } catch (error) {
    LoggingService.error('Error fetching product', error, { 
      productId: req.params.id 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

/**
 * POST /api/products
 * Cria um novo produto
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, price, description } = req.body;
    const requestId = TracingService.getRequestId();
    
    // Validação básica
    if (!name || !price) {
      LoggingService.warn('Invalid product data', { name, price });
      return res.status(400).json({
        requestId,
        success: false,
        error: 'Name and price are required'
      });
    }

    LoggingService.info('Creating new product', { 
      name, 
      price, 
      description 
    });

    const product = await productBusiness.create({
      name,
      price,
      description
    });

    LoggingService.info('Product created successfully', { 
      productId: product.id,
      name: product.name 
    });

    res.status(201).json({
      requestId,
      success: true,
      data: product
    });
  } catch (error) {
    LoggingService.error('Error creating product', error, { 
      body: req.body 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

/**
 * PUT /api/products/:id
 * Atualiza um produto
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;
    const requestId = TracingService.getRequestId();
    
    LoggingService.info('Updating product', { 
      productId: id,
      updates: { name, price, description } 
    });

    const product = await productBusiness.update(parseInt(id), {
      name,
      price,
      description
    });

    if (!product) {
      LoggingService.warn('Product not found for update', { productId: id });
      return res.status(404).json({
        requestId,
        success: false,
        error: 'Product not found'
      });
    }

    LoggingService.info('Product updated successfully', { productId: id });

    res.json({
      requestId,
      success: true,
      data: product
    });
  } catch (error) {
    LoggingService.error('Error updating product', error, { 
      productId: req.params.id 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

/**
 * DELETE /api/products/:id
 * Remove um produto
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestId = TracingService.getRequestId();
    
    LoggingService.info('Deleting product', { productId: id });

    const deleted = await productBusiness.delete(parseInt(id));

    if (!deleted) {
      LoggingService.warn('Product not found for deletion', { productId: id });
      return res.status(404).json({
        requestId,
        success: false,
        error: 'Product not found'
      });
    }

    LoggingService.info('Product deleted successfully', { productId: id });

    res.json({
      requestId,
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    LoggingService.error('Error deleting product', error, { 
      productId: req.params.id 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

export { router as productRoutes };
