import { SchedulerService } from '../core/scheduler/SchedulerService';
declare const router: import("express-serve-static-core").Router;
/**
 * Registra a instância do scheduler para ser usada pelas rotas
 */
export declare function registerSchedulerInstance(scheduler: SchedulerService): void;
export default router;
