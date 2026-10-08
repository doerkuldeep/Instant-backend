import { describe, it, expect } from 'vitest';
import { sendSms, smsService, ConsoleSmsProvider } from '../../src/shared/services/sms';
import { notify } from '../../src/shared/services/notification';

describe('Global Shared Services', () => {
  describe('SMS Service', () => {
    it('should send SMS via default Console provider in non-production', async () => {
      const result = await sendSms({
        to: '+1234567890',
        message: 'Your verification code is 123456',
        templateId: 'OTP_TEMPLATE',
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('console');
      expect(result.messageId).toBeDefined();
    });

    it('should allow hot-swapping or getting provider', () => {
      const provider = smsService.getProvider();
      expect(provider.name).toBe('console');
    });

    it('should throw an error if ConsoleSmsProvider is instantiated in production', () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        expect(() => new ConsoleSmsProvider()).toThrow(
          /cannot be used in a production environment/,
        );
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });
  });

  describe('Notification Service', () => {
    it('should dispatch notification to SMS channel', async () => {
      const result = await notify({
        channel: 'sms',
        to: '+1234567890',
        template: 'WELCOME_MSG',
        data: { message: 'Welcome to the platform!' },
      });

      expect(result.success).toBe(true);
      expect(result.channel).toBe('sms');
    });

    it('should dispatch notification to Email channel placeholder', async () => {
      const result = await notify({
        channel: 'email',
        to: 'user@example.com',
        subject: 'Welcome',
        data: { name: 'Alice' },
      });

      expect(result.success).toBe(true);
      expect(result.channel).toBe('email');
    });

    it('should dispatch notification to Push channel placeholder', async () => {
      const result = await notify({
        channel: 'push',
        to: 'fcm-token-1234',
        data: { title: 'Order Update', status: 'shipped' },
      });

      expect(result.success).toBe(true);
      expect(result.channel).toBe('push');
    });
  });
});
