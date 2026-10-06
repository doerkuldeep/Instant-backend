import { logger } from '../../../../config/logger';
import { ISmsProvider, SendSmsOptions, SmsSendResult } from '../sms.provider';

/**
 * Console SMS Provider
 * Intended strictly for local development and test environments.
 * Logs SMS payloads to stdout without making real network calls.
 */
export class ConsoleSmsProvider implements ISmsProvider {
  readonly name = 'console';

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'SECURITY ERROR: ConsoleSmsProvider cannot be used in a production environment. Configure a real provider (e.g., Twilio, MSG91).',
      );
    }
  }

  async send(options: SendSmsOptions): Promise<SmsSendResult> {
    const fakeMessageId = `console-msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    logger.info(
      {
        provider: this.name,
        messageId: fakeMessageId,
        to: options.to,
        message: options.message,
        templateId: options.templateId,
        variables: options.variables,
      },
      '📱 [DEV SMS] SMS dispatched via Console Provider',
    );

    return {
      success: true,
      messageId: fakeMessageId,
      provider: this.name,
      recipient: options.to,
    };
  }

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    return this.send({ to, message });
  }
}
