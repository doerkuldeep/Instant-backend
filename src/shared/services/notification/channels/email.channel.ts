import { INotificationChannel, NotifyOptions, NotifyResult } from '../notification.types';
import { logger } from '../../../../config/logger';

/**
 * Placeholder Email Notification Channel
 * Ready to be connected to SMTP, Resend, SendGrid, or AWS SES.
 */
export class EmailNotificationChannel implements INotificationChannel {
  readonly name = 'email' as const;

  async send(options: Omit<NotifyOptions, 'channel'>): Promise<NotifyResult> {
    const fakeMessageId = `email-placeholder-${Date.now()}`;

    logger.info(
      {
        channel: this.name,
        to: options.to,
        subject: options.subject,
        template: options.template,
        data: options.data,
      },
      '📧 [Email Channel - Placeholder] Email dispatched (integrate provider like Resend/SendGrid here)',
    );

    return {
      success: true,
      channel: this.name,
      details: {
        messageId: fakeMessageId,
        note: 'Email provider not yet wired to external vendor.',
      },
    };
  }
}
