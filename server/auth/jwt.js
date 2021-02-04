import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const setUpJWT = ({ app }) => {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = process.env.JWT_SECRET;

  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      console.log('JWT pay_load', jwt_payload);
      User.findOne({ _id: jwt_payload.data }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        }
        return done(null, false);
        // or you could create a new account
      });
    }),
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
};
const getToken = (userId) => {
  return jwt.sign({ data: userId }, process.env.JWT_SECRET, { expiresIn: 60 * 60 }); // Expires in 14 days
};

const verifyUser = passport.authenticate('jwt', { session: false });

const verifyAdmin = (req, res, next) => {
  if (req.user.isAdmin) next();
  else res.status(401).json({ success: false, message: 'Unauthorized User.' });
};
export { setUpJWT, getToken, verifyUser, verifyAdmin };
