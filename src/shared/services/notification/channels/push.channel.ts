import { INotificationChannel, NotifyOptions, NotifyResult } from '../notification.types';
import { logger } from '../../../../config/logger';

/**
 * Placeholder Push Notification Channel
 * Ready to be connected to Firebase Cloud Messaging (FCM) or Apple APNs.
 */
export class PushNotificationChannel implements INotificationChannel {
  readonly name = 'push' as const;

  async send(options: Omit<NotifyOptions, 'channel'>): Promise<NotifyResult> {
    const fakeMessageId = `push-placeholder-${Date.now()}`;

    logger.info(
      {
        channel: this.name,
        to: options.to,
        template: options.template,
        data: options.data,
      },
      '📲 [Push Channel - Placeholder] Push notification dispatched (integrate FCM/APNs here)',
    );

    return {
      success: true,
      channel: this.name,
      details: {
        messageId: fakeMessageId,
        note: 'Push notification provider not yet wired to external vendor.',
      },
    };
  }
}
