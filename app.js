let express = require('express');
let passport = require('passport');
let Strategy = require('passport-chaira').Strategy;
let session = require('express-session');
require('dotenv').config()

const port = process.env.PORT || 8080;

app = express();
app.set('view engine', 'ejs');
app.use(session({ resave: false, saveUninitialized: true, secret: process.env.SESSION_SECRET }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

passport.use(
  new Strategy({
    clientID: process.env.CHAIRA_CLIENT_ID,
    clientSecret: process.env.CHAIRA_CLIENT_SECRET,
    callbackURL: process.env.CHAIRA_CALLBACK_URL,
    state: true
  },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile)
    }
  )
);

app.get('/auth/chaira', passport.authenticate('chaira'));

app.get('/auth/chaira/callback', passport.authenticate('chaira', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/profile');
});

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile.ejs', { user: req.user });
});

app.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
})

app.listen(port, () => {
  console.log('passport demo up on port: ' + port);
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}
