import mongoose from 'mongoose';
import lodash from 'lodash';

const emailTemplate = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplate);

const insertEmailTemplate = async () => {
  const emailTemplates = [
    {
      name: 'welcome',
      subject: 'Welcome to MernTemplate Website!',
      message: `<%= displayName%>,
            <p>Thank you for signing up for Mern Template </p>
            <p>I hope that you would enjoying using our website</p>
            <p>Huyen Nguyen</p>
            `,
    },
    {
      name: 'confirm',
      subject: 'Please confirm your email to activate your email at Mern!',
      message: `<%= displayName%>,
            <p>Thank you for signing up for Mern Template! </p>
            <p>In order for us to give you the best expriences at Mern, please confirm your email by clicking the link below</p>
            <p><%= CONFIRM_URL%></p>
            <p>Thank you so much for your cooperation!</p>
            <p>Huyen Nguyen</p>
            `,
    },
    {
      name: 'reset_password',
      subject: 'Reset Password',
      message: `<%= displayName%>,
            <p>Please click the link below to reset your password</p>
            <p><%= RESET_PASSWORD_URL%></p>
            <p>Thank you so much for your cooperation!</p>
            <p>Huyen Nguyen</p>
            `,
    },
  ];
  let name;
  let subject;
  let message;
  for (const t of emailTemplates) { //eslint-disable-line
    // 1. Call "findOne" to find if an email template exists
    name = t.name.replace(/\n/g, ' ').replace(/[ ]/g, ' ').trim();
    message = t.message.replace(/\n/g, ' ').replace(/[ ]/g, ' ').trim();
    subject = t.subject.replace(/\n/g, ' ').replace(/[ ]/g, ' ').trim();
    const et = await EmailTemplate.findOne({ name }); //eslint-disable-line
    // 2. If it exists, use "updateOne" to update new subject or body
    if (et) {
      if (subject !== et.subject || message !== et.message) {
        await EmailTemplate.updateOne({ _id: et._id }, { $set: { message, subject } }); //eslint-disable-line
      }
    }
    // 3. If not, use "create" to insert the new template into the DB
    else {
      await EmailTemplate.create({ name, subject, message }); //eslint-disable-line
    }
  }
};

const getEmailTemplate = async (name, params) => {
  try {
    // 1. Use "findOne" to find one email template with the corresponding name
    const et = await EmailTemplate.findOne({ name });
    // 2. If there is one, update the template with the corresponding params
    if (et) {
      return {
        success: true,
        template: {
          subject: lodash.template(et.subject)(params),
          message: lodash.template(et.message)(params),
        },
      };
    }
    throw Error('No available email template.');
  } catch (err) {
    // 3. Otherwise, throw an error
    return {
      success: false,
      message: err.message || err.toString(),
    };
  }
};

export { insertEmailTemplate, getEmailTemplate };
