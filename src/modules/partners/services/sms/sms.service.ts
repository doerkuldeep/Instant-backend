import { ISmsProvider, SmsSendResult } from './sms.types';
import { mockSmsProvider } from './providers/mock.provider';
import { twilioSmsProvider } from './providers/twilio.provider';
import { msg91SmsProvider } from './providers/msg91.provider';
import { logger } from '../../../../config/logger';

function resolveDefaultProvider(): ISmsProvider {
  const selected = (process.env.SMS_PROVIDER || '').toLowerCase();
  if (selected === 'twilio') {
    return twilioSmsProvider;
  }
  if (selected === 'msg91') {
    return msg91SmsProvider;
  }
  if (process.env.NODE_ENV === 'test' || !process.env.TWILIO_ACCOUNT_SID) {
    return mockSmsProvider;
  }
  return twilioSmsProvider;
}

let activeProvider: ISmsProvider = resolveDefaultProvider();

export function setSmsProvider(provider: ISmsProvider): void {
  activeProvider = provider;
}

export function getSmsProvider(): ISmsProvider {
  return activeProvider;
}

export async function sendOtpSms(phone: string, otp: string): Promise<SmsSendResult> {
  const message = `Your verification code is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;
  logger.info({ phone, provider: activeProvider.name }, 'Dispatching OTP SMS');
  return activeProvider.sendSms(phone, message);
}

export const smsService = {
  sendOtp: sendOtpSms,
  setProvider: setSmsProvider,
  getProvider: getSmsProvider,
};
