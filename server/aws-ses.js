import aws from 'aws-sdk';
import { getEmailTemplate } from './models/emailTemplate';
/**
 * The function is used to send email to newly registered users
 * @param {object} options
 */
function sendEmail(options) {
  // 1. Configure Simple Email Service using aws-sdk
  const ses = new aws.SES({
    apiVersion: 'latest',
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESSKEYID,
    secretAccessKey: process.env.AWS_SECRETACCESSKEY,
  });

  // 2. The function returns a promise which will fullfill when email is sent successfully
  return new Promise((resolve, reject) => {
    ses.sendEmail(
      {
        Source: options.from,
        Destination: {
          ToAddresses: options.to,
        },
        Message: {
          Subject: {
            Data: options.subject,
          },
          Body: {
            Html: {
              Data: options.body,
            },
          },
        },
      },
      (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      },
    );
  });
}

export async function sendTemplateEmail(tempName, params, email) {
  try {
    // 1. Use getEmailTemplate to populate options object with the template
    const et = await getEmailTemplate(tempName, params);
    // 2. If yes, Use sendEmail to send an new email to the users
    if (et.success) {
      await sendEmail({
        from: `Huyen from Mern Temp <${process.env.EMAIL_ADDRESS_FROM}>`,
        to: [email],
        subject: et.template.subject,
        body: et.template.message,
      });
    } else throw new Error('Email template is not available');
    return {
      success: true,
      message: 'Confirmation Email has been sent successfully. Please check your email!',
    };
  } catch (err) {
    // 3. If not, logging out the error
    return { success: false, message: err.message || err.toString() };
  }
}

export default sendEmail;
