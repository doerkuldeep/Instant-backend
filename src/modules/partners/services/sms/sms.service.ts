import { ISmsProvider, SmsSendResult } from './sms.types';
import { mockSmsProvider } from './providers/mock.provider';
import { twilioSmsProvider } from './providers/twilio.provider';
import { msg91SmsProvider } from './providers/msg91.provider';
import { logger } from '../../../../config/logger';

export class SmsService {
  private provider: ISmsProvider;

  constructor(provider?: ISmsProvider) {
    if (provider) {
      this.provider = provider;
    } else {
      const selected = (process.env.SMS_PROVIDER || '').toLowerCase();
      if (selected === 'twilio') {
        this.provider = twilioSmsProvider;
      } else if (selected === 'msg91') {
        this.provider = msg91SmsProvider;
      } else {
        // Default to mock in tests/development, or twilio if TWILIO_ACCOUNT_SID is set
        if (process.env.NODE_ENV === 'test' || !process.env.TWILIO_ACCOUNT_SID) {
          this.provider = mockSmsProvider;
        } else {
          this.provider = twilioSmsProvider;
        }
      }
    }
  }

  setProvider(provider: ISmsProvider): void {
    this.provider = provider;
  }

  getProvider(): ISmsProvider {
    return this.provider;
  }

  async sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
    const message = `Your verification code is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;
    logger.info({ phone, provider: this.provider.name }, 'Dispatching OTP SMS');
    return this.provider.sendSms(phone, message);
  }
}

export const smsService = new SmsService();
