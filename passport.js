const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

const User = mongoose.model('User', {
  username: String,
  password: String,
});

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(null, user);
  });
});

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
}, (username, password, done) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return done(err);
    }

    if (!user || user.password !== password) {
      return done(null, false);
    }

    return done(null, user);
  });
}));