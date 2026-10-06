export interface SendSmsOptions {
  to: string;
  message: string;
  templateId?: string;
  variables?: Record<string, string | number>;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

export interface ISmsProvider {
  readonly name: string;
  send(options: SendSmsOptions): Promise<SmsSendResult>;
}
