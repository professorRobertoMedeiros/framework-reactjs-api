declare const productRouter: import("express-serve-static-core").Router;
export default productRouter;
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
