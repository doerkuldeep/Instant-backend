import { ISmsProvider, SmsSendResult } from '../sms.types';
import { logger } from '../../../../../config/logger';

export interface SentMessageRecord {
  to: string;
  message: string;
  sentAt: Date;
  messageId: string;
}

export class MockSmsProvider implements ISmsProvider {
  readonly name = 'mock';
  private sentMessages: SentMessageRecord[] = [];

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    const messageId = `mock-msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const record: SentMessageRecord = {
      to,
      message,
      sentAt: new Date(),
      messageId,
    };
    this.sentMessages.push(record);

    logger.info({ to, messageId, message }, '[MockSmsProvider] SMS sent successfully');

    return {
      success: true,
      messageId,
      provider: this.name,
      recipient: to,
    };
  }

  getSentMessages(): SentMessageRecord[] {
    return [...this.sentMessages];
  }

  getLastMessageFor(phone: string): SentMessageRecord | undefined {
    return [...this.sentMessages].reverse().find((m) => m.to === phone);
  }

  clear(): void {
    this.sentMessages = [];
  }
}

export const mockSmsProvider = new MockSmsProvider();
