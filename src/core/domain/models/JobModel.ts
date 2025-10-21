import { BaseModel } from './BaseModel';
import { Entity, Column, Id } from './BaseModel';

/**
 * Status de execução de um job
 */
export enum JobStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  TIMEOUT = 'timeout',
  RUNNING = 'running',
  PENDING = 'pending'
}

/**
 * Modelo para jobs agendados
 * Representa um job que será executado periodicamente
 */
@Entity('scheduled_jobs')
export class JobModel extends BaseModel {
  @Id()
  id!: number;

  @Column({ type: 'VARCHAR', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'TEXT', nullable: true })
  description?: string;

  // Configuração de Execução
  @Column({ type: 'VARCHAR', length: 255, nullable: false })
  service_name!: string;

  @Column({ type: 'VARCHAR', length: 255, nullable: false })
  service_method!: string;

  @Column({ type: 'VARCHAR', length: 500, nullable: true })
  service_path?: string;

  // Parâmetros
  @Column({ type: 'JSONB', nullable: false })
  params!: Record<string, any>;

  // Agendamento (cron format)
  @Column({ type: 'VARCHAR', length: 100, nullable: false })
  schedule!: string;

  // Controle de Execução
  @Column({ type: 'BOOLEAN', nullable: false })
  enabled!: boolean;

  @Column({ type: 'INT', nullable: false })
  max_retries!: number;

  @Column({ type: 'INT', nullable: false })
  retry_delay!: number;

  @Column({ type: 'INT', nullable: false })
  timeout!: number;

  // Metadados de Execução
  @Column({ type: 'TIMESTAMP', nullable: true })
  last_run_at?: Date;

  @Column({ type: 'VARCHAR', length: 50, nullable: true })
  last_run_status?: JobStatus;

  @Column({ type: 'TEXT', nullable: true })
  last_run_error?: string;

  @Column({ type: 'INT', nullable: true })
  last_run_duration?: number;

  @Column({ type: 'TIMESTAMP', nullable: true })
  next_run_at?: Date;

  @Column({ type: 'INT', nullable: false })
  run_count!: number;

  @Column({ type: 'INT', nullable: false })
  success_count!: number;

  @Column({ type: 'INT', nullable: false })
  error_count!: number;

  // Auditoria
  @Column({ type: 'TIMESTAMP', nullable: false })
  created_at!: Date;

  @Column({ type: 'TIMESTAMP', nullable: false })
  updated_at!: Date;

  @Column({ type: 'INT', nullable: true })
  created_by?: number;

  @Column({ type: 'INT', nullable: true })
  updated_by?: number;

  /**
   * Verifica se o job está pronto para executar
   */
  isReadyToRun(): boolean {
    if (!this.enabled) return false;
    if (!this.next_run_at) return true; // Primeira execução
    if (this.last_run_status === JobStatus.RUNNING) return false;
    
    return new Date() >= new Date(this.next_run_at);
  }

  /**
   * Verifica se o job está atualmente em execução
   */
  isRunning(): boolean {
    return this.last_run_status === JobStatus.RUNNING;
  }

  /**
   * Calcula a taxa de sucesso do job
   */
  getSuccessRate(): number {
    if (this.run_count === 0) return 0;
    return (this.success_count / this.run_count) * 100;
  }

  /**
   * Retorna uma descrição legível do schedule
   */
  getScheduleDescription(): string {
    const parts = this.schedule.split(' ');
    if (parts.length !== 5) return this.schedule;

    const [minute, hour, day, month, weekday] = parts;

    // Casos comuns
    if (this.schedule === '* * * * *') return 'A cada minuto';
    if (this.schedule === '*/5 * * * *') return 'A cada 5 minutos';
    if (this.schedule === '0 * * * *') return 'A cada hora';
    if (this.schedule === '0 */2 * * *') return 'A cada 2 horas';
    if (this.schedule === '0 0 * * *') return 'Diariamente à meia-noite';
    if (this.schedule === '0 12 * * *') return 'Diariamente ao meio-dia';
    if (this.schedule === '0 0 * * 0') return 'Semanalmente aos domingos';
    if (this.schedule === '0 0 1 * *') return 'Mensalmente no dia 1';

    return this.schedule;
  }
}
