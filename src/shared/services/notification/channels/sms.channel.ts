import { INotificationChannel, NotifyOptions, NotifyResult } from '../notification.types';
import { sendSms } from '../../sms';
import { logger } from '../../../../config/logger';

export class SmsNotificationChannel implements INotificationChannel {
  readonly name = 'sms' as const;

  async send(options: Omit<NotifyOptions, 'channel'>): Promise<NotifyResult> {
    try {
      const message =
        options.message ||
        (options.data?.message ? String(options.data.message) : '') ||
        (options.template ? `Notification for template: ${options.template}` : '');

      const variables: Record<string, string | number> = {};
      if (options.data) {
        for (const [key, value] of Object.entries(options.data)) {
          if (typeof value === 'string' || typeof value === 'number') {
            variables[key] = value;
          }
        }
      }

      const result = await sendSms({
        to: options.to,
        message,
        templateId: options.template,
        variables: Object.keys(variables).length > 0 ? variables : undefined,
      });

      if (!result.success) {
        return {
          success: false,
          channel: this.name,
          error: result.error,
          details: result,
        };
      }

      return {
        success: true,
        channel: this.name,
        details: result,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error({ channel: this.name, err }, 'Failed to dispatch notification via SMS channel');
      return {
        success: false,
        channel: this.name,
        error: errorMessage,
      };
    }
  }
}
