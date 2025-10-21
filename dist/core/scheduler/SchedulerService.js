"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const JobRepository_1 = require("./JobRepository");
const JobExecutor_1 = require("./JobExecutor");
const JobModel_1 = require("../domain/models/JobModel");
const Logger_1 = require("../../infra/logger/Logger");
const cron = __importStar(require("node-cron"));
/**
 * Serviço responsável por gerenciar e executar jobs agendados
 */
class SchedulerService {
    constructor(options = {}) {
        this.isRunning = false;
        this.runningJobs = new Set();
        this.cronJobs = new Map();
        this.repository = new JobRepository_1.JobRepository();
        this.executor = new JobExecutor_1.JobExecutor();
        this.options = {
            enabled: options.enabled ?? true,
            checkInterval: options.checkInterval ?? 60000, // 1 minuto
            maxConcurrent: options.maxConcurrent ?? 5,
            autoStart: options.autoStart ?? false,
            stuckJobThreshold: options.stuckJobThreshold ?? 30
        };
        if (this.options.autoStart) {
            this.start();
        }
    }
    /**
     * Inicia o scheduler
     */
    async start() {
        if (this.isRunning) {
            Logger_1.logger.warn('Scheduler já está em execução');
            return;
        }
        if (!this.options.enabled) {
            Logger_1.logger.warn('Scheduler está desabilitado');
            return;
        }
        this.isRunning = true;
        Logger_1.logger.info('Scheduler iniciado', {
            checkInterval: this.options.checkInterval,
            maxConcurrent: this.options.maxConcurrent
        });
        // Carregar jobs e configurar cron
        await this.loadAndScheduleJobs();
        // Verificar jobs periodicamente
        this.checkTimer = setInterval(() => {
            this.checkAndExecuteJobs();
        }, this.options.checkInterval);
        // Verificar jobs travados periodicamente (a cada 5 minutos)
        setInterval(() => {
            this.checkStuckJobs();
        }, 5 * 60 * 1000);
    }
    /**
     * Para o scheduler
     */
    async stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = undefined;
        }
        // Parar todos os cron jobs
        this.cronJobs.forEach(task => task.stop());
        this.cronJobs.clear();
        Logger_1.logger.info('Scheduler parado');
    }
    /**
     * Carrega todos os jobs e configura seus cron schedules
     */
    async loadAndScheduleJobs() {
        try {
            const jobs = await this.repository.findEnabled();
            Logger_1.logger.info(`Carregando ${jobs.length} jobs habilitados`);
            for (const job of jobs) {
                try {
                    this.scheduleCronJob(job);
                }
                catch (error) {
                    Logger_1.logger.error(`Erro ao configurar schedule para job ${job.name}`, error);
                }
            }
        }
        catch (error) {
            Logger_1.logger.error('Erro ao carregar jobs', error);
        }
    }
    /**
     * Configura um cron job
     */
    scheduleCronJob(job) {
        // Remover job anterior se existir
        if (this.cronJobs.has(job.id)) {
            this.cronJobs.get(job.id)?.stop();
            this.cronJobs.delete(job.id);
        }
        // Validar expressão cron
        if (!cron.validate(job.schedule)) {
            throw new Error(`Schedule inválido: ${job.schedule}`);
        }
        // Criar novo cron job
        const task = cron.schedule(job.schedule, async () => {
            await this.executeJobIfReady(job.id);
        });
        this.cronJobs.set(job.id, task);
        // Calcular próxima execução
        this.updateNextRun(job);
        Logger_1.logger.info(`Job agendado: ${job.name}`, {
            schedule: job.schedule,
            description: job.getScheduleDescription()
        });
    }
    /**
     * Verifica e executa jobs que estão prontos
     */
    async checkAndExecuteJobs() {
        if (!this.isRunning) {
            return;
        }
        try {
            const readyJobs = await this.repository.findReadyToRun();
            for (const job of readyJobs) {
                // Verificar se já está rodando
                if (this.runningJobs.has(job.id)) {
                    continue;
                }
                // Verificar limite de jobs concorrentes
                if (this.runningJobs.size >= this.options.maxConcurrent) {
                    Logger_1.logger.warn('Limite de jobs concorrentes atingido', {
                        running: this.runningJobs.size,
                        max: this.options.maxConcurrent
                    });
                    break;
                }
                // Executar job
                this.executeJobIfReady(job.id);
            }
        }
        catch (error) {
            Logger_1.logger.error('Erro ao verificar jobs', error);
        }
    }
    /**
     * Executa um job se ele estiver pronto
     */
    async executeJobIfReady(jobId) {
        try {
            // Verificar se já está rodando (em memória)
            if (this.runningJobs.has(jobId)) {
                Logger_1.logger.warn(`Job ${jobId} já está em execução, pulando...`);
                return;
            }
            // Buscar job atualizado do banco
            const job = await this.repository.findById(jobId);
            if (!job) {
                Logger_1.logger.error(`Job não encontrado: ${jobId}`);
                return;
            }
            // Verificar se está marcado como rodando no banco (proteção adicional)
            if (job.isRunning()) {
                Logger_1.logger.warn(`Job ${job.name} (${jobId}) está marcado como RUNNING no banco, pulando...`);
                return;
            }
            // Verificar se está habilitado e pronto
            if (!job.enabled) {
                Logger_1.logger.debug(`Job ${job.name} (${jobId}) está desabilitado`);
                return;
            }
            if (!job.isReadyToRun()) {
                Logger_1.logger.debug(`Job ${job.name} (${jobId}) não está pronto para executar`);
                return;
            }
            // Executar
            await this.executeJob(job);
        }
        catch (error) {
            Logger_1.logger.error(`Erro ao preparar execução do job ${jobId}`, error);
        }
    }
    /**
     * Executa um job
     */
    async executeJob(job) {
        // Verificação final antes de executar
        if (this.runningJobs.has(job.id)) {
            Logger_1.logger.warn(`Job ${job.name} (${job.id}) já está na lista de execução, abortando...`);
            return;
        }
        // Marcar como em execução (em memória)
        this.runningJobs.add(job.id);
        try {
            // Atualizar status no banco (marca como RUNNING)
            await this.repository.markAsRunning(job.id);
            Logger_1.logger.info(`Iniciando execução do job: ${job.name}`, {
                id: job.id,
                service: job.service_name,
                method: job.service_method
            });
            // Executar com retries
            const result = await this.executeWithRetries(job);
            // Atualizar banco com resultado
            await this.repository.markAsCompleted(job.id, result.success, result.duration, result.error);
            // Atualizar próxima execução
            await this.updateNextRun(job);
            if (result.success) {
                Logger_1.logger.info(`Job concluído com sucesso: ${job.name}`, {
                    duration: result.duration
                });
            }
            else {
                Logger_1.logger.error(`Job falhou: ${job.name}`, new Error(result.error));
            }
        }
        catch (error) {
            Logger_1.logger.error(`Erro crítico ao executar job: ${job.name}`, error);
            // Atualizar como erro
            await this.repository.markAsCompleted(job.id, false, 0, error instanceof Error ? error.message : String(error));
        }
        finally {
            // Remover da lista de em execução
            this.runningJobs.delete(job.id);
        }
    }
    /**
     * Executa job com retries
     */
    async executeWithRetries(job) {
        let lastResult = null;
        let attempts = 0;
        while (attempts <= job.max_retries) {
            attempts++;
            Logger_1.logger.info(`Tentativa ${attempts}/${job.max_retries + 1} para job: ${job.name}`);
            lastResult = await this.executor.executeJob(job);
            if (lastResult.success) {
                return lastResult;
            }
            // Se falhou e ainda tem retries, aguardar
            if (attempts <= job.max_retries) {
                Logger_1.logger.warn(`Job falhou, tentando novamente em ${job.retry_delay}s`, {
                    job: job.name,
                    attempt: attempts,
                    error: lastResult.error
                });
                await this.sleep(job.retry_delay * 1000);
            }
        }
        return lastResult;
    }
    /**
     * Atualiza a próxima execução do job baseado no cron schedule
     */
    async updateNextRun(job) {
        try {
            const nextRun = this.calculateNextRun(job.schedule);
            await this.repository.updateNextRun(job.id, nextRun);
        }
        catch (error) {
            Logger_1.logger.error(`Erro ao calcular próxima execução para job: ${job.name}`, error);
        }
    }
    /**
     * Calcula a próxima execução baseado no cron schedule
     */
    calculateNextRun(schedule) {
        // Calcular próxima execução de forma simplificada
        // Para uma implementação mais precisa, usar biblioteca como 'cron-parser'
        const now = new Date();
        const parts = schedule.split(' ');
        if (parts.length !== 5) {
            // Formato inválido, retornar 1 hora à frente
            return new Date(now.getTime() + 60 * 60 * 1000);
        }
        // Casos comuns
        if (schedule === '* * * * *') {
            // A cada minuto
            return new Date(now.getTime() + 60 * 1000);
        }
        else if (schedule.startsWith('*/5 * * * *')) {
            // A cada 5 minutos
            const minutes = Math.ceil(now.getMinutes() / 5) * 5;
            const next = new Date(now);
            next.setMinutes(minutes, 0, 0);
            if (next <= now) {
                next.setTime(next.getTime() + 5 * 60 * 1000);
            }
            return next;
        }
        else if (schedule.startsWith('0 * * * *')) {
            // A cada hora
            const next = new Date(now);
            next.setHours(now.getHours() + 1, 0, 0, 0);
            return next;
        }
        else if (schedule.startsWith('0 0 * * *')) {
            // Diariamente à meia-noite
            const next = new Date(now);
            next.setDate(now.getDate() + 1);
            next.setHours(0, 0, 0, 0);
            return next;
        }
        // Padrão: 1 hora à frente
        return new Date(now.getTime() + 60 * 60 * 1000);
    }
    /**
     * Verifica jobs que estão travados
     */
    async checkStuckJobs() {
        try {
            const stuckJobs = await this.repository.findStuckJobs(this.options.stuckJobThreshold);
            for (const job of stuckJobs) {
                Logger_1.logger.warn(`Job travado detectado: ${job.name}`, {
                    id: job.id,
                    lastRunAt: job.last_run_at,
                    duration: job.last_run_duration
                });
                // Marcar como erro por timeout
                await this.repository.updateExecutionStatus(job.id, JobModel_1.JobStatus.TIMEOUT, 'Job travado - timeout forçado', 0);
                // Remover da lista de em execução
                this.runningJobs.delete(job.id);
            }
        }
        catch (error) {
            Logger_1.logger.error('Erro ao verificar jobs travados', error);
        }
    }
    /**
     * Executa um job manualmente (força execução)
     */
    async runJobNow(jobId) {
        const job = await this.repository.findById(jobId);
        if (!job) {
            throw new Error(`Job não encontrado: ${jobId}`);
        }
        Logger_1.logger.info(`Execução manual do job: ${job.name}`);
        await this.executeJob(job);
        // Buscar resultado atualizado
        const updatedJob = await this.repository.findById(jobId);
        return {
            success: updatedJob.last_run_status === JobModel_1.JobStatus.SUCCESS,
            duration: updatedJob.last_run_duration || 0,
            error: updatedJob.last_run_error
        };
    }
    /**
     * Recarrega um job específico (atualiza seu schedule)
     */
    async reloadJob(jobId) {
        const job = await this.repository.findById(jobId);
        if (!job) {
            throw new Error(`Job não encontrado: ${jobId}`);
        }
        if (job.enabled) {
            this.scheduleCronJob(job);
            Logger_1.logger.info(`Job recarregado: ${job.name}`);
        }
        else {
            // Remover se foi desabilitado
            if (this.cronJobs.has(jobId)) {
                this.cronJobs.get(jobId)?.stop();
                this.cronJobs.delete(jobId);
                Logger_1.logger.info(`Job desabilitado removido: ${job.name}`);
            }
        }
    }
    /**
     * Recarrega todos os jobs
     */
    async reloadAllJobs() {
        Logger_1.logger.info('Recarregando todos os jobs');
        // Parar todos os cron jobs
        this.cronJobs.forEach(task => task.stop());
        this.cronJobs.clear();
        // Recarregar
        await this.loadAndScheduleJobs();
    }
    /**
     * Retorna status do scheduler
     */
    getStatus() {
        return {
            running: this.isRunning,
            runningJobs: Array.from(this.runningJobs),
            scheduledJobs: this.cronJobs.size,
            maxConcurrent: this.options.maxConcurrent
        };
    }
    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.SchedulerService = SchedulerService;
//# sourceMappingURL=SchedulerService.js.map