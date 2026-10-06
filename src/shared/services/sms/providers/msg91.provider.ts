import { logger } from '../../../../config/logger';
import { ISmsProvider, SendSmsOptions, SmsSendResult } from '../sms.provider';

export interface Msg91Config {
  authKey?: string;
  senderId?: string;
  route?: string;
}

/**
 * MSG91 SMS Provider
 * Interacts with MSG91 SMS/Flow APIs via native fetch.
 */
export class Msg91SmsProvider implements ISmsProvider {
  readonly name = 'msg91';
  private authKey: string;
  private senderId: string;
  private route: string;

  constructor(config?: Msg91Config) {
    this.authKey = config?.authKey || process.env.MSG91_AUTH_KEY || '';
    this.senderId = config?.senderId || process.env.MSG91_SENDER_ID || '';
    this.route = config?.route || process.env.MSG91_ROUTE || '4'; // 4 for transactional
  }

  async send(options: SendSmsOptions): Promise<SmsSendResult> {
    if (!this.authKey) {
      const err = 'MSG91 credentials missing (MSG91_AUTH_KEY)';
      logger.error({ provider: this.name }, err);
      return {
        success: false,
        provider: this.name,
        error: err,
      };
    }

    try {
      // If templateId is provided, use MSG91 Flow API
      if (options.templateId) {
        const endpoint = 'https://control.msg91.com/api/v5/flow/';
        const payload = {
          template_id: options.templateId,
          sender: this.senderId || undefined,
          short_url: '0',
          recipients: [
            {
              mobiles: options.to.replace(/\+/g, ''),
              ...(options.variables || {}),
            },
          ],
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            authkey: this.authKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as { type?: string; message?: string; request_id?: string };

        if (!response.ok || data.type === 'error') {
          const errMsg = data.message || `MSG91 Flow API error ${response.status}`;
          logger.error({ provider: this.name, error: errMsg }, 'MSG91 Flow SMS failed');
          return {
            success: false,
            provider: this.name,
            error: errMsg,
          };
        }

        logger.info({ provider: this.name, requestId: data.request_id, to: options.to }, 'MSG91 SMS sent successfully');
        return {
          success: true,
          messageId: data.request_id,
          provider: this.name,
        };
      }

      // Default quick SMS API
      const endpoint = 'https://api.msg91.com/api/v2/sendsms';
      const payload = {
        sender: this.senderId || 'NOTICE',
        route: this.route,
        country: '91',
        sms: [
          {
            message: options.message,
            to: [options.to.replace(/\+/g, '')],
          },
        ],
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          authkey: this.authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { type?: string; message?: string; request_id?: string };

      if (!response.ok || data.type === 'error') {
        const errMsg = data.message || `MSG91 send SMS error ${response.status}`;
        logger.error({ provider: this.name, error: errMsg }, 'MSG91 SMS failed');
        return {
          success: false,
          provider: this.name,
          error: errMsg,
        };
      }

      logger.info({ provider: this.name, requestId: data.request_id, to: options.to }, 'MSG91 SMS sent successfully');
      return {
        success: true,
        messageId: data.request_id,
        provider: this.name,
        recipient: options.to,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error({ provider: this.name, err }, 'MSG91 SMS request exception');
      return {
        success: false,
        provider: this.name,
        recipient: options.to,
        error: errorMessage,
      };
    }
  }

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    return this.send({ to, message });
  }
}
