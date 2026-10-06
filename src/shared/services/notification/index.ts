import {
  INotificationChannel,
  NotificationChannelType,
  NotifyOptions,
  NotifyResult,
} from './notification.types';
import { SmsNotificationChannel } from './channels/sms.channel';
import { EmailNotificationChannel } from './channels/email.channel';
import { PushNotificationChannel } from './channels/push.channel';
import { logger } from '../../../config/logger';

export * from './notification.types';
export * from './channels/sms.channel';
export * from './channels/email.channel';
export * from './channels/push.channel';

class NotificationService {
  private channels: Map<NotificationChannelType, INotificationChannel> = new Map();

  constructor() {
    this.registerChannel(new SmsNotificationChannel());
    this.registerChannel(new EmailNotificationChannel());
    this.registerChannel(new PushNotificationChannel());
  }

  public registerChannel(channel: INotificationChannel): void {
    this.channels.set(channel.name, channel);
  }

  public getChannel(channelType: NotificationChannelType): INotificationChannel | undefined {
    return this.channels.get(channelType);
  }

  /**
   * Main dispatch method
   */
  public async notify(options: NotifyOptions): Promise<NotifyResult> {
    const channelInstance = this.channels.get(options.channel);

    if (!channelInstance) {
      const err = `Unsupported notification channel: "${options.channel}"`;
      logger.error({ channel: options.channel }, err);
      return {
        success: false,
        channel: options.channel,
        error: err,
      };
    }

    const { channel, ...channelPayload } = options;
    return channelInstance.send(channelPayload);
  }
}

export const notificationService = new NotificationService();

/**
 * Top-level convenience function matching the service specification:
 * notify({ channel, to, template, data })
 */
export async function notify(options: NotifyOptions): Promise<NotifyResult> {
  return notificationService.notify(options);
}
