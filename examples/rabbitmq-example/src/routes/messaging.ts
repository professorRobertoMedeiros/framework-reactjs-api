import { Router, Request, Response } from 'express';
import { LoggingService } from '@framework/core/tracing/LoggingService';
import { TracingService } from '@framework/core/tracing/TracingService';
import { EmailProducer } from '../producers/EmailProducer';
import { NotificationProducer } from '../producers/NotificationProducer';

const router = Router();

// Instanciar producers
const emailProducer = new EmailProducer();
const notificationProducer = new NotificationProducer();

/**
 * POST /api/messaging/email/send
 * Envia um email genérico
 */
router.post('/email/send', async (req: Request, res: Response) => {
  try {
    const { to, subject, body, from } = req.body;
    const requestId = TracingService.getRequestId();

    if (!to || !subject || !body) {
      return res.status(400).json({
        requestId,
        success: false,
        error: 'Missing required fields: to, subject, body'
      });
    }

    LoggingService.info('Publishing email message', { to, subject });

    const published = await emailProducer.sendEmail({
      to,
      subject,
      body,
      from
    });

    res.status(202).json({
      requestId,
      success: true,
      message: 'Email queued for processing',
      published
    });

  } catch (error) {
    LoggingService.error('Error publishing email', error);
    res.status(500).json({
      success: false,
      error: 'Failed to queue email'
    });
  }
});

/**
 * POST /api/messaging/email/welcome
 * Envia email de boas-vindas
 */
router.post('/email/welcome', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const requestId = TracingService.getRequestId();

    if (!email || !name) {
      return res.status(400).json({
        requestId,
        success: false,
        error: 'Missing required fields: email, name'
      });
    }

    LoggingService.info('Publishing welcome email', { email, name });

    const published = await emailProducer.sendWelcomeEmail(email, name);

    res.status(202).json({
      requestId,
      success: true,
      message: 'Welcome email queued for processing',
      published
    });

  } catch (error) {
    LoggingService.error('Error publishing welcome email', error);
    res.status(500).json({
      success: false,
      error: 'Failed to queue welcome email'
    });
  }
});

/**
 * POST /api/messaging/email/password-reset
 * Envia email de recuperação de senha
 */
router.post('/email/password-reset', async (req: Request, res: Response) => {
  try {
    const { email, token } = req.body;
    const requestId = TracingService.getRequestId();

    if (!email || !token) {
      return res.status(400).json({
        requestId,
        success: false,
        error: 'Missing required fields: email, token'
      });
    }

    LoggingService.info('Publishing password reset email', { email });

    const published = await emailProducer.sendPasswordResetEmail(email, token);

    res.status(202).json({
      requestId,
      success: true,
      message: 'Password reset email queued for processing',
      published
    });

  } catch (error) {
    LoggingService.error('Error publishing password reset email', error);
    res.status(500).json({
      success: false,
      error: 'Failed to queue password reset email'
    });
  }
});

/**
 * POST /api/messaging/notification/push
 * Envia notificação push
 */
router.post('/notification/push', async (req: Request, res: Response) => {
  try {
    const { userId, title, message, data } = req.body;
    const requestId = TracingService.getRequestId();

    if (!userId || !title || !message) {
      return res.status(400).json({
        requestId,
        success: false,
        error: 'Missing required fields: userId, title, message'
      });
    }

    LoggingService.info('Publishing push notification', { userId, title });

    const published = await notificationProducer.sendPushNotification({
      userId,
      title,
      message,
      data
    });

    res.status(202).json({
      requestId,
      success: true,
      message: 'Push notification queued for processing',
      published
    });

  } catch (error) {
    LoggingService.error('Error publishing push notification', error);
    res.status(500).json({
      success: false,
      error: 'Failed to queue push notification'
    });
  }
});

/**
 * POST /api/messaging/notification/sms
 * Envia SMS
 */
router.post('/notification/sms', async (req: Request, res: Response) => {
  try {
    const { phone, message } = req.body;
    const requestId = TracingService.getRequestId();

    if (!phone || !message) {
      return res.status(400).json({
        requestId,
        success: false,
        error: 'Missing required fields: phone, message'
      });
    }

    LoggingService.info('Publishing SMS', { phone });

    const published = await notificationProducer.sendSMS(phone, message);

    res.status(202).json({
      requestId,
      success: true,
      message: 'SMS queued for processing',
      published
    });

  } catch (error) {
    LoggingService.error('Error publishing SMS', error);
    res.status(500).json({
      success: false,
      error: 'Failed to queue SMS'
    });
  }
});

export { router as messagingRoutes };
