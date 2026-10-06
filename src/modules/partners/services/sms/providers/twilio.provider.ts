import { ISmsProvider, SmsSendResult } from '../sms.types';
import { logger } from '../../../../../config/logger';

export async function sendTwilioSms(to: string, message: string): Promise<SmsSendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    logger.warn(
      { to },
      '[TwilioSmsProvider] Twilio credentials not configured; simulating SMS dispatch',
    );
    return {
      success: true,
      messageId: `simulated-twilio-${Date.now()}`,
      provider: 'twilio',
      recipient: to,
    };
  }

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const body = new URLSearchParams({
      To: to,
      From: fromNumber,
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

    const data = (await response.json()) as { sid?: string; message?: string };
    if (!response.ok) {
      logger.error({ status: response.status, data }, '[TwilioSmsProvider] Twilio API error');
      return {
        success: false,
        error: data.message || `Twilio HTTP error ${response.status}`,
        provider: 'twilio',
        recipient: to,
      };
    }

    return {
      success: true,
      messageId: data.sid || `twilio-${Date.now()}`,
      provider: 'twilio',
      recipient: to,
    };
  } catch (error) {
    logger.error({ error }, '[TwilioSmsProvider] Network failure dispatching SMS');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown network failure',
      provider: 'twilio',
      recipient: to,
    };
  }
}

export const twilioSmsProvider: ISmsProvider = {
  name: 'twilio',
  sendSms: sendTwilioSms,
};
