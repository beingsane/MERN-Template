import passport from 'passport';
import User from '../models/user.model';
import { getToken } from './jwt';

const FacebookStrategy = require('passport-facebook');

const setupFacebook = ({ app, ROOT_URL }) => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${ROOT_URL}/auth/facebook/callback`,
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          console.log('Profile', profile);
          const resp = await User.signUpOrSignInWithOAuth({
            OAuthId: profile.id,
            email: profile.emails,
            displayName: profile.displayName,
            avatarUrl: profile.profileUrl,
          });
          if (resp._id) {
            cb(null, resp);
          } else throw new Error(resp.message || resp.toString());
        } catch (err) {
          console.log(err);
          cb(err, null);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, User.publicFields(), (err, user) => {
      done(err, user);
    });
  });
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['profile', 'email'] }));

  app.get('/auth/facebook/callback', passport.authenticate('facebook'), (req, res) => {
    const token = getToken(req.user.id);
    res.cookie('mern-cookie', token, { expires: new Date(Date.now() + 60 * 60 * 24) });
    res.status(200).json({ success: true, token, message: 'Successfully logged in.' });
  });
};

export default setupFacebook;
