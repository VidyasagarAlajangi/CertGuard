import AWS from 'aws-sdk';
import fs from 'fs';

const ses = new AWS.SES({
  accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION || 'us-east-1',
});

/**
 * Send an email using AWS SES, optionally with a PDF attachment
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body (HTML or text)
 * @param {Object} [attachment] - Optional. { path: string, filename: string }
 * @returns {Promise}
 */
export async function sendEmailSES(to, subject, body, attachment) {
  if (!attachment) {
    // Simple email (no attachment)
    const params = {
      Source: process.env.AWS_SES_SENDER_EMAIL,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: body },
        },
      },
    };
    return ses.sendEmail(params).promise();
  }

  // Email with attachment (raw MIME)
  const fileContent = fs.readFileSync(attachment.path);
  const boundary = `NextPart_${Date.now()}`;
  const rawMessage = [
    `From: ${process.env.AWS_SES_SENDER_EMAIL}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
    '',
    `--${boundary}`,
    'Content-Type: application/pdf',
    `Content-Disposition: attachment; filename="${attachment.filename}"`,
    'Content-Transfer-Encoding: base64',
    '',
    fileContent.toString('base64'),
    '',
    `--${boundary}--`,
    ''
  ].join('\r\n');

  const params = {
    RawMessage: { Data: rawMessage },
    Source: process.env.AWS_SES_SENDER_EMAIL,
    Destinations: [to],
  };
  return ses.sendRawEmail(params).promise();
} 