import { ISmsProvider, SendSmsOptions, SmsSendResult } from './sms.provider';
import { ConsoleSmsProvider } from './providers/console.provider';
import { TwilioSmsProvider } from './providers/twilio.provider';
import { Msg91SmsProvider } from './providers/msg91.provider';
import { MockSmsProvider, mockSmsProvider, SentMessageRecord } from './providers/mock.provider';
import { logger } from '../../../config/logger';

export * from './sms.provider';
export * from './providers/console.provider';
export * from './providers/twilio.provider';
export * from './providers/msg91.provider';
export * from './providers/mock.provider';

export type SmsProviderType = 'console' | 'twilio' | 'msg91' | 'mock';

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

    if (configuredProvider === 'mock') {
      return mockSmsProvider;
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

  public resetProvider(): void {
    this.activeProvider = this.resolveProvider();
  }

  /**
   * Main dispatch method supporting both options object and (to, message) overload
   */
  public async sendSms(optionsOrTo: SendSmsOptions | string, maybeMessage?: string): Promise<SmsSendResult> {
    if (typeof optionsOrTo === 'string') {
      return this.activeProvider.send({ to: optionsOrTo, message: maybeMessage || '' });
    }
    return this.activeProvider.send(optionsOrTo);
  }

  /**
   * OTP dispatch method
   */
  public async sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
    const message = `Your verification code is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;
    logger.info({ phone, provider: this.activeProvider.name }, 'Dispatching OTP SMS');
    return this.sendSms({
      to: phone,
      message,
      templateId: 'OTP_VERIFICATION',
      variables: { otp },
    });
  }
}

export const smsService = new SmsService();

/**
 * Top-level convenience function matching the service specification:
 * sendSms({ to, message, templateId? }) or sendSms(to, message)
 */
export async function sendSms(optionsOrTo: SendSmsOptions | string, maybeMessage?: string): Promise<SmsSendResult> {
  return smsService.sendSms(optionsOrTo as any, maybeMessage);
}

/**
 * Top-level convenience function for OTP dispatch
 */
export async function sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
  return smsService.sendOtp(phone, otp);
}
