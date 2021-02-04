import passport from 'passport';
import User from '../models/user.model';
import { getToken } from './jwt';

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const setUpGoogle = async ({ app, ROOT_URL }) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENTID,
        clientSecret: process.env.GOOGLE_CLIENTSECRET,
        callbackURL: `http://localhost:3000/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          const resp = await User.signUpOrSignInWithOAuth({
            OAuthId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
            avatarUrl:
              profile.photos && profile.photos.length > 0
                ? profile.photos[0].value.replace('sz=50', 'sz=128')
                : '',
          });
          if (resp.id) {
            cb(null, resp);
          } else throw new Error(resp.message || resp.toString());
        } catch (err) {
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

  app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }),
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      const token = getToken(req.user.id);
      res.cookie('mern-cookie', `${token}/${req.user.isAdmin}`, {
        expires: new Date(Date.now() + 60 * 60 * 24),
        encode: String,
      });
      res.redirect('/callbackRedirect');
    },
  );
};

export default setUpGoogle;
