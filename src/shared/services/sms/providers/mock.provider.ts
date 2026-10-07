import { ISmsProvider, SendSmsOptions, SmsSendResult } from '../sms.provider';
import { logger } from '../../../../config/logger';

export interface SentMessageRecord {
  to: string;
  message: string;
  sentAt: Date;
  messageId: string;
  templateId?: string;
  variables?: Record<string, string | number>;
}

export class MockSmsProvider implements ISmsProvider {
  readonly name = 'mock';
  private sentMessages: SentMessageRecord[] = [];

  async send(options: SendSmsOptions): Promise<SmsSendResult> {
    const messageId = `mock-msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const record: SentMessageRecord = {
      to: options.to,
      message: options.message,
      sentAt: new Date(),
      messageId,
      templateId: options.templateId,
      variables: options.variables,
    };
    this.sentMessages.push(record);

    logger.info(
      { to: options.to, messageId, message: options.message },
      '[MockSmsProvider] SMS sent successfully',
    );

    return {
      success: true,
      messageId,
      provider: this.name,
      recipient: options.to,
    };
  }

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    return this.send({ to, message });
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
