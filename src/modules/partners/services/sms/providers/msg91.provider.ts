import { ISmsProvider, SmsSendResult } from '../sms.types';
import { logger } from '../../../../../config/logger';

export async function sendMsg91Sms(to: string, message: string): Promise<SmsSendResult> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authKey) {
    logger.warn(
      { to },
      '[Msg91SmsProvider] MSG91 credentials not configured; simulating SMS dispatch',
    );
    return {
      success: true,
      messageId: `simulated-msg91-${Date.now()}`,
      provider: 'msg91',
      recipient: to,
    };
  }

  try {
    const endpoint = 'https://api.msg91.com/api/v5/flow/';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authkey: authKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        template_id: templateId,
        recipients: [{ mobiles: to.replace('+', ''), message }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MSG91 API error HTTP ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as { message?: string; type?: string };
    logger.info({ to, response: data }, '[Msg91SmsProvider] SMS sent successfully');

    return {
      success: true,
      messageId: `msg91-${Date.now()}`,
      provider: 'msg91',
      recipient: to,
    };
  } catch (error) {
    logger.error({ error, to }, '[Msg91SmsProvider] Failed to send SMS via MSG91');
    throw error;
  }
}

export const msg91SmsProvider: ISmsProvider = {
  name: 'msg91',
  sendSms: sendMsg91Sms,
};
