export type NotificationChannelType = 'sms' | 'email' | 'push';

export interface NotifyOptions {
  channel: NotificationChannelType;
  to: string;
  template?: string;
  data?: Record<string, unknown>;
  message?: string;
  subject?: string;
}

export interface NotifyResult {
  success: boolean;
  channel: NotificationChannelType;
  details?: unknown;
  error?: string;
}

export interface INotificationChannel {
  readonly name: NotificationChannelType;
  send(options: Omit<NotifyOptions, 'channel'>): Promise<NotifyResult>;
}
