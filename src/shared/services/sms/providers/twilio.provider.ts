import { logger } from '../../../../config/logger';
import { ISmsProvider, SendSmsOptions, SmsSendResult } from '../sms.provider';

export interface TwilioConfig {
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
}

/**
 * Twilio SMS Provider
 * Uses Twilio REST API via native fetch.
 */
export class TwilioSmsProvider implements ISmsProvider {
  readonly name = 'twilio';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(config?: TwilioConfig) {
    this.accountSid = config?.accountSid || process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = config?.authToken || process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber =
      config?.fromNumber || process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_PHONE_NUMBER || '';
  }

  async send(options: SendSmsOptions): Promise<SmsSendResult> {
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      const err =
        'Twilio SMS credentials missing (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER/TWILIO_PHONE_NUMBER)';
      logger.error({ provider: this.name }, err);
      return {
        success: false,
        provider: this.name,
        recipient: options.to,
        error: err,
      };
    }

    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const basicAuth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

      const bodyParams = new URLSearchParams({
        To: options.to,
        From: this.fromNumber,
        Body: options.message,
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      const data = (await response.json()) as { sid?: string; message?: string; status?: string };

      if (!response.ok) {
        const errorMsg = data.message || `Twilio HTTP error ${response.status}`;
        logger.error(
          { provider: this.name, error: errorMsg, status: response.status },
          'Twilio SMS send failed',
        );
        return {
          success: false,
          provider: this.name,
          error: errorMsg,
        };
      }

      logger.info(
        { provider: this.name, sid: data.sid, to: options.to },
        'Twilio SMS sent successfully',
      );
      return {
        success: true,
        messageId: data.sid,
        provider: this.name,
        recipient: options.to,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error({ provider: this.name, err }, 'Twilio SMS request exception');
      return {
        success: false,
        provider: this.name,
        recipient: options.to,
        error: errorMessage,
      };
    }
  }

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    return this.send({ to, message });
  }
}
