var express = require('express');
var router  = express.Router();
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var keyfile = require('../config/api_keys');

var request = require('request');

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
var hackerschoolBase = 'https://www.recurse.com';
passport.use('hackerschool', new OAuth2Strategy({
    clientID:     hackerschool.clientId,
    clientSecret: hackerschool.clientSecret,
    callbackURL:  hackerschool.callbackUrl,
    authorizationURL: hackerschoolBase + '/oauth/authorize',
    tokenURL: hackerschoolBase + '/oauth/token'
  },
  function (accessToken, refreshToken, profile, done) {
    console.log(accessToken, refreshToken, profile);

    process.nextTick(function() {



  request('https://www.recurse.com/api/v1/batches?access_token=' + accessToken, function (error, response, body) {
    if (error) {
      console.log(error)
    }


    console.log('Access:', accessToken);
    console.log('Status:', response.statusCode);

    if (!error && response.statusCode == 200) {
      console.log(body) // Show the HTML for the Google homepage.
    }
  })





      return done(null, profile);
    });
  }
));

// Google
var google = keyfile.google;
passport.use('google', new GoogleStrategy({
    clientID: google.clientId,
    clientSecret: google.clientSecret,
    callbackURL: google.callbackUrl
  },
  function (accessToken, refreshToken, profile, done) {
    //console.log(accessToken, refreshToken, profile);

    process.nextTick(function() {
      return done(null, profile);
    });
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
  successRedirect : '/contacts',
  failureRedirect: '/error'
})/*, function (req, res) {
  console.log('Google success!');

  // Successful authentication, redirect home.
  res.redirect('/contacts');
}*/);

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();
  // if they aren't redirect them to the home page
  res.redirect('/');
}

module.exports = router;
