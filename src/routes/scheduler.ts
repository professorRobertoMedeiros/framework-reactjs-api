import { Router, Request, Response } from 'express';
import { SchedulerService } from '../core/scheduler/SchedulerService';
import { JobRepository } from '../core/scheduler/JobRepository';
import { JobStatus } from '../core/domain/models/JobModel';
import { AuthMiddleware } from '../core/auth/AuthMiddleware';

const router = Router();
let schedulerInstance: SchedulerService | null = null;

/**
 * Registra a instância do scheduler para ser usada pelas rotas
 */
export function registerSchedulerInstance(scheduler: SchedulerService): void {
  schedulerInstance = scheduler;
}

/**
 * Obtém a instância do scheduler
 */
function getScheduler(): SchedulerService {
  if (!schedulerInstance) {
    throw new Error('Scheduler não foi inicializado. Use registerSchedulerInstance() primeiro.');
  }
  return schedulerInstance;
}

// Repository para acesso direto aos jobs
const jobRepository = new JobRepository();

// Middleware de autenticação
const authMiddleware = new AuthMiddleware();

/**
 * GET /scheduler/status
 * Retorna o status atual do scheduler
 */
router.get('/status', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const scheduler = getScheduler();
    const status = scheduler.getStatus();

    return res.json({
      success: true,
      data: status
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao obter status'
    });
  }
});

/**
 * POST /scheduler/reload
 * Recarrega todos os jobs do banco de dados
 */
router.post('/reload', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const scheduler = getScheduler();
    
    await scheduler.reloadAllJobs();

    return res.json({
      success: true,
      message: 'Jobs recarregados com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao recarregar jobs'
    });
  }
});

/**
 * POST /scheduler/reload/:id
 * Recarrega um job específico do banco de dados
 */
router.post('/reload/:id', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    const scheduler = getScheduler();
    
    await scheduler.reloadJob(jobId);

    return res.json({
      success: true,
      message: `Job ${jobId} recarregado com sucesso`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao recarregar job'
    });
  }
});

/**
 * POST /scheduler/start
 * Inicia o scheduler
 */
router.post('/start', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const scheduler = getScheduler();
    
    await scheduler.start();

    return res.json({
      success: true,
      message: 'Scheduler iniciado com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao iniciar scheduler'
    });
  }
});

/**
 * POST /scheduler/stop
 * Para o scheduler
 */
router.post('/stop', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const scheduler = getScheduler();
    
    await scheduler.stop();

    return res.json({
      success: true,
      message: 'Scheduler parado com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao parar scheduler'
    });
  }
});

/**
 * POST /scheduler/jobs/:id/run
 * Executa um job manualmente
 */
router.post('/jobs/:id/run', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    const scheduler = getScheduler();
    
    const result = await scheduler.runJobNow(jobId);

    return res.json({
      success: result.success,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao executar job'
    });
  }
});

/**
 * GET /scheduler/jobs
 * Lista todos os jobs
 */
router.get('/jobs', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const { enabled, status } = req.query;
    
    let jobs;
    if (enabled !== undefined) {
      jobs = enabled === 'true' 
        ? await jobRepository.findEnabled()
        : await jobRepository.findBy({ enabled: false });
    } else if (status) {
      jobs = await jobRepository.findByLastStatus(status as JobStatus);
    } else {
      jobs = await jobRepository.findAll();
    }

    return res.json({
      success: true,
      data: jobs,
      total: jobs.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao listar jobs'
    });
  }
});

/**
 * GET /scheduler/jobs/:id
 * Busca um job específico
 */
router.get('/jobs/:id', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    const job = await jobRepository.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job não encontrado'
      });
    }

    return res.json({
      success: true,
      data: {
        ...job,
        scheduleDescription: job.getScheduleDescription(),
        successRate: job.getSuccessRate(),
        isReady: job.isReadyToRun(),
        isRunning: job.isRunning()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao buscar job'
    });
  }
});

/**
 * POST /scheduler/jobs
 * Cria um novo job
 */
router.post('/jobs', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const jobData = req.body;
    const job = await jobRepository.create(jobData);
    
    // Recarregar no scheduler se estiver habilitado
    if (job.enabled) {
      const scheduler = getScheduler();
      await scheduler.reloadJob(job.id);
    }

    return res.status(201).json({
      success: true,
      data: job,
      message: 'Job criado com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao criar job'
    });
  }
});

/**
 * PUT /scheduler/jobs/:id
 * Atualiza um job existente
 */
router.put('/jobs/:id', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    const jobData = req.body;
    
    const job = await jobRepository.update(jobId, jobData);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job não encontrado'
      });
    }
    
    // Recarregar no scheduler
    const scheduler = getScheduler();
    await scheduler.reloadJob(jobId);

    return res.json({
      success: true,
      data: job,
      message: 'Job atualizado com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao atualizar job'
    });
  }
});

/**
 * DELETE /scheduler/jobs/:id
 * Deleta um job
 */
router.delete('/jobs/:id', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    
    const deleted = await jobRepository.delete(jobId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Job não encontrado'
      });
    }
    
    // Recarregar scheduler para remover o job
    const scheduler = getScheduler();
    await scheduler.reloadAllJobs();

    return res.json({
      success: true,
      message: 'Job deletado com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao deletar job'
    });
  }
});

/**
 * POST /scheduler/jobs/:id/enable
 * Habilita um job
 */
router.post('/jobs/:id/enable', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    
    await jobRepository.setEnabled(jobId, true);
    
    // Recarregar no scheduler
    const scheduler = getScheduler();
    await scheduler.reloadJob(jobId);

    return res.json({
      success: true,
      message: 'Job habilitado com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao habilitar job'
    });
  }
});

/**
 * POST /scheduler/jobs/:id/disable
 * Desabilita um job
 */
router.post('/jobs/:id/disable', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    
    await jobRepository.setEnabled(jobId, false);
    
    // Recarregar no scheduler
    const scheduler = getScheduler();
    await scheduler.reloadJob(jobId);

    return res.json({
      success: true,
      message: 'Job desabilitado com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao desabilitar job'
    });
  }
});

/**
 * POST /scheduler/jobs/:id/reset-stats
 * Reseta as estatísticas de um job
 */
router.post('/jobs/:id/reset-stats', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    
    await jobRepository.resetStatistics(jobId);

    return res.json({
      success: true,
      message: 'Estatísticas resetadas com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao resetar estatísticas'
    });
  }
});

/**
 * GET /scheduler/jobs/stuck
 * Lista jobs travados
 */
router.get('/jobs/stuck', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  try {
    const minutes = req.query.minutes ? Number(req.query.minutes) : 30;
    const stuckJobs = await jobRepository.findStuckJobs(minutes);

    return res.json({
      success: true,
      data: stuckJobs,
      total: stuckJobs.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao listar jobs travados'
    });
  }
});

export default router;
