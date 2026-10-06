import { ISmsProvider, SmsSendResult, SentMessageRecord } from '../sms.types';
import { logger } from '../../../../../config/logger';

export { SentMessageRecord } from '../sms.types';

let sentMessages: SentMessageRecord[] = [];

export async function sendSms(to: string, message: string): Promise<SmsSendResult> {
  const messageId = `mock-msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const record: SentMessageRecord = {
    to,
    message,
    sentAt: new Date(),
    messageId,
  };
  sentMessages.push(record);

  logger.info({ to, messageId, message }, '[MockSmsProvider] SMS sent successfully');

  return {
    success: true,
    messageId,
    provider: 'mock',
    recipient: to,
  };
}

export function getSentMessages(): SentMessageRecord[] {
  return [...sentMessages];
}

export function getLastMessageFor(phone: string): SentMessageRecord | undefined {
  return [...sentMessages].reverse().find((m) => m.to === phone);
}

export function clear(): void {
  sentMessages = [];
}

export const mockSmsProvider: ISmsProvider & {
  getSentMessages: () => SentMessageRecord[];
  getLastMessageFor: (phone: string) => SentMessageRecord | undefined;
  clear: () => void;
} = {
  name: 'mock',
  sendSms,
  getSentMessages,
  getLastMessageFor,
  clear,
};
