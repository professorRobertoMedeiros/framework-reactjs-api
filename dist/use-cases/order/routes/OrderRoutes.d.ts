declare const orderRouter: import("express-serve-static-core").Router;
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
