import express from 'express';
import User from '../models/user.model';
import { getEmailTemplate } from '../models/emailTemplate';
import sendEmail, { sendTemplateEmail } from '../aws-ses';

import { verifyUser } from './jwt';

const CONFIRM_ROOT_URL = `http://localhost:3000/auth/users/confirmSignup?userId=`;
const RESET_PASSWORD_ROOT_URL = 'http://localhost:3000/lostPassword';
const authRouter = express.Router();

/**
 * Log out users
 */
authRouter.get('/logout', (req, res) => {
  try {
    res.clearCookie('mern-cookie');
    res.status(200).json({ success: true, message: 'Successfully logged out.' });
  } catch (err) {
    res.status(403).json({ success: false, message: 'You are not logged in.' });
  }
});
/**
 * Sending out confirm Email
 */
authRouter.get('/sendConfirmEmail/:userId', async (req, res) => {
  try {
    // 1. Use findById to find the user
    const user = await User.findById(req.params.userId);
    // 2. Send out an email
    if (user && user.email) {
      const CONFIRM_URL = `${CONFIRM_ROOT_URL}${user._id}`;
      const resp = await sendTemplateEmail(
        'confirm',
        { displayName: user.displayName, CONFIRM_URL },
        user.email,
      );
      if (resp.success) return res.status(200).json(resp);
      throw new Error(resp.message);
    } else throw new Error('User not found');
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || err.toString() });
  }
});
/**
 * Confirm email from new users to activate user's email
 */
authRouter.get('/confirmSignup', async (req, res) => {
  // 1. Check if there is "userId" query in the URL
  if (!req.query.userId) {
    // 2. If not, return the request with code 400(BadRequest)
    res.status(400).json({
      success: false,
      message: 'Something went wrong. Please try again or contact the web admin!',
    });
  }
  try {
    // 3. If yes, use User.activateUserEmail to activate email property
    // and send welcome email to new users
    const resp = await User.activateUserEmail(req.query.userId);
    if (resp.success) {
      // 4. If succeeds, sendback success message and redirect user to homepage
      res.status(200).redirect('/');
    } else {
      throw resp;
    }
  } catch (err) {
    res.status(400).redirect('/');
  }
});

/**
 * Initialize resetPassword by checking if there is an user
 * with this email address and send back a link to reset password
 * via user's email
 */
authRouter.post('/resetPassword', async (req, res) => {
  // 1. Check if there is an "email" in the req.body
  if (req.body.email && req.body.email.match(/.+@.+\..+/)) {
    // 2. Check if there is an user of this email
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      // 3. If yes, send the user an "reset_password" email
      try {
        // 1. Get "reset_password" template
        const RESET_PASSWORD_URL = `${RESET_PASSWORD_ROOT_URL}`;
        const et = await getEmailTemplate('reset_password', {
          displayName: user.displayName,
          RESET_PASSWORD_URL,
        });
        // 2. Send a reset_password email to user with link to reset password
        if (et) {
          await sendEmail({
            from: `Huyen from Mern Temp <${process.env.EMAIL_ADDRESS_FROM}>`,
            to: [user.email],
            subject: et.template.subject,
            body: et.template.message,
          })
            .then((resp) => {
              res.status(200).json({
                success: true,
                message: 'Please check your email for link to reset password!',
              });
            })
            .catch((err) => {
              res
                .status(400)
                .json({ success: false, message: 'Something went wrong. Please try again later!' });
            });
        }
      } catch (err) {
        res
          .status(400)
          .json({ success: false, message: 'Something went wrong. Please try again later!' });
      }
    } else {
      res
        .status(400)
        .json({ success: false, message: "You haven't signed up yet. Please sign up!" });
    }
  } else {
    // 4. If not, redirect the user back to /resetPassword
    res.status(400).json({ success: false, message: 'Invalid Email Address. Please try again!' });
  }
});

/**
 * Reset User password
 */
authRouter.post('/resetPassword/password', async (req, res) => {
  // 1. Check if there is a password in the req.body
  if (req.body.password) {
    // 2. If yes, reset password for the user with req.query.email
    const resp = await User.resetPassword(req.body.password, req.body.email);
    if (resp.success) {
      res.status(200).json(resp);
      return;
    }
    res.status(400).json(resp);
    return;
  }
  // 3. If not, send res with code of 400
  res.status(400).json({ success: false, message: 'Invalid Password. Please try again!' });
});
export default authRouter;
