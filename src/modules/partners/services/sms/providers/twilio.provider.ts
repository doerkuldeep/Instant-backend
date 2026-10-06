import { ISmsProvider, SmsSendResult } from '../sms.types';
import { logger } from '../../../../../config/logger';

export class TwilioSmsProvider implements ISmsProvider {
  readonly name = 'twilio';
  private accountSid: string | undefined;
  private authToken: string | undefined;
  private fromNumber: string | undefined;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      logger.warn(
        { to },
        '[TwilioSmsProvider] Twilio credentials not configured; simulating SMS dispatch',
      );
      return {
        success: true,
        messageId: `simulated-twilio-${Date.now()}`,
        provider: this.name,
        recipient: to,
      };
    }

    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const body = new URLSearchParams({
        To: to,
        From: this.fromNumber,
        Body: message,
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twilio API error HTTP ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as { sid: string };
      logger.info({ to, sid: data.sid }, '[TwilioSmsProvider] SMS sent successfully');

      return {
        success: true,
        messageId: data.sid,
        provider: this.name,
        recipient: to,
      };
    } catch (error) {
      logger.error({ error, to }, '[TwilioSmsProvider] Failed to send SMS via Twilio');
      throw error;
    }
  }
}

export const twilioSmsProvider = new TwilioSmsProvider();
