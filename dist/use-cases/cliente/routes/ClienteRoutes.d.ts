declare const clienteRouter: import("express-serve-static-core").Router;
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
