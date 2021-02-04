import passport from 'passport';
import User from '../models/user.model';
import { getToken } from './jwt';

const LocalStrategy = require('passport-local').Strategy;

function setupLocal({ app, ROOT_URL }) {
  passport.use(new LocalStrategy(User.authenticate()));

  app.post('/auth/local/signup', async (req, res) => {
    const { userName, password, email, firstName, lastName } = req.body;

    await User.signUpWithLocalStrategy({
      userName,
      password,
      email,
      firstName,
      lastName,
    })
      .then((response) => {
        if (!response) throw Error('Something went wrong. Please try again.');
        if (response.success) {
          res.status(200).json({ success: true, user: response.user });
        } else {
          res
            .status(500)
            .json({ success: false, message: response.message || response.toString() });
        }
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err.message || err.toString() });
      });
  });

  // setup passport
  // use static authenticate method of model in LocalStrategy
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

  app.post('/auth/local/login', passport.authenticate('local'), (req, res) => {
    const token = getToken(req.user.id);
    res.cookie('mern-cookie', token, { expires: new Date(Date.now() + 60 * 60 * 24) });
    res
      .status(200)
      .json({ success: true, token, isAdmin: req.user.isAdmin, message: 'Successfully logged in' });
  });
}

export default setupLocal;
