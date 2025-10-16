declare const router: import("express-serve-static-core").Router;
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
