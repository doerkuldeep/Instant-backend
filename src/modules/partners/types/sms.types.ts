export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  recipient: string;
  error?: string;
}

export interface ISmsProvider {
  readonly name: string;
  sendSms(to: string, message: string): Promise<SmsSendResult>;
}

export interface SentMessageRecord {
  to: string;
  message: string;
  sentAt: Date;
  messageId: string;
}
