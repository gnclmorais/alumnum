var express = require('express');
var router  = express.Router();
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var keyfile = require('../config/api_keys');

/**
 * Setup a few things for Passport
 */
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// Hacker School
var hackerschool = keyfile.hackerschool;
var hackerschoolBase = 'https://www.hackerschool.com';
passport.use('hackerschool', new OAuth2Strategy({
    clientID:     hackerschool.clientId,
    clientSecret: hackerschool.clientSecret,
    callbackURL:  hackerschool.callbackUrl,
    authorizationURL: hackerschoolBase + '/oauth/authorize',
    tokenURL: hackerschoolBase + '/oauth/token'
  },
  function (accessToken, refreshToken, profile, done) {
    console.log(accessToken, refreshToken, profile);

    return done(null, accessToken);
  }
));

// Google
var google = keyfile.google;
var googleBase = 'https://www.hackerschool.com';
passport.use(new GoogleStrategy({
    clientID: google.clientId,
    clientSecret: google.clientSecret,
    callbackURL: google.callbackUrl
  },
  function (accessToken, refreshToken, profile, done) {
    //console.log(accessToken, refreshToken, profile);

    return done(null, accessToken);
  }
));

/**
 * Routing
 */
router.get('/', function (req, res, next) {
  res.redirect(req.baseUrl + '/hackerschool');
});

router.get('/error', function (req, res, next) {
  res.render('index', { title: 'ERROR' });
});

// Hacker School
router.get('/hackerschool', passport.authenticate('hackerschool'));

router.get('/hackerschool/callback', passport.authenticate('hackerschool', {
  failureRedirect: '/error'
}), function (req, res) {
  // Successful authentication, now get Google credentials
  res.redirect(req.baseUrl + '/google');
});

// Hacker School
router.get('/google', passport.authenticate('google', {
  scope: google.scopes.join(' ')
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/error'
}), function (req, res) {
  console.log('Google success!');

  // Successful authentication, redirect home.
  res.redirect('/contacts');
});

module.exports = router;
