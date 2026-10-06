import { ISmsProvider, SendSmsOptions, SmsSendResult } from './sms.provider';
import { ConsoleSmsProvider } from './providers/console.provider';
import { TwilioSmsProvider } from './providers/twilio.provider';
import { Msg91SmsProvider } from './providers/msg91.provider';
import { logger } from '../../../config/logger';

export * from './sms.provider';
export * from './providers/console.provider';
export * from './providers/twilio.provider';
export * from './providers/msg91.provider';

export type SmsProviderType = 'console' | 'twilio' | 'msg91';

class SmsService {
  private activeProvider: ISmsProvider;

  constructor() {
    this.activeProvider = this.resolveProvider();
  }

  private resolveProvider(): ISmsProvider {
    const configuredProvider = (process.env.SMS_PROVIDER || '').toLowerCase() as SmsProviderType;
    const isProduction = process.env.NODE_ENV === 'production';

    if (configuredProvider === 'twilio') {
      return new TwilioSmsProvider();
    }

    if (configuredProvider === 'msg91') {
      return new Msg91SmsProvider();
    }

    if (configuredProvider === 'console' || !configuredProvider) {
      if (isProduction) {
        logger.warn(
          'SMS_PROVIDER is not set in production. Falling back to Twilio provider by default.',
        );
        return new TwilioSmsProvider();
      }
      return new ConsoleSmsProvider();
    }

    logger.warn(
      { configuredProvider },
      'Unknown SMS_PROVIDER specified; defaulting to ConsoleSmsProvider in non-production.',
    );
    return isProduction ? new TwilioSmsProvider() : new ConsoleSmsProvider();
  }

  /**
   * Allows hot-swapping or manually configuring the active provider (e.g., in tests).
   */
  public setProvider(provider: ISmsProvider): void {
    this.activeProvider = provider;
  }

  public getProvider(): ISmsProvider {
    return this.activeProvider;
  }

  /**
   * Main dispatch method
   */
  public async sendSms(options: SendSmsOptions): Promise<SmsSendResult> {
    return this.activeProvider.send(options);
  }
}

export const smsService = new SmsService();

/**
 * Top-level convenience function matching the service specification:
 * sendSms({ to, message, templateId? })
 */
export async function sendSms(options: SendSmsOptions): Promise<SmsSendResult> {
  return smsService.sendSms(options);
}
