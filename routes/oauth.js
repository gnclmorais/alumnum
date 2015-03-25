var express = require('express'),
    OAuth2 = require('oauth').OAuth2,
    querystring = require('querystring'),
    router  = express.Router(),
    keyfile = require('../config/api_keys');

function getKeys(req, res, next) {
	var service = req.params.service,
        keys    = keyfile[service];
	if (keys) return keys;
	next( new Error( "No API keys for service '"+service+"'.  Please add to config/api_keys.js." ) );
}

router.get('/:service/login', function(req, res, next) {
  var service = req.params.service,
      keys    = getKeys(req, res, next);
  res.render('index', { title: 'Login With '+service.toUpperCase() });
  res.end();
});

router.get('/:service/callback', function(req, res, next) {
  var service = req.params.service,
      keys    = getKeys(req, res, next);
  res.render('index', { title: 'Callback For '+service.toUpperCase() });
  res.end();
});

function testOauth(service) {
	var keys = keyfile[service];
	var scope = querystring.escape("https://www.google.com/m8/feeds/")
	if (!keys) throw "No keys for service: "+service;
	console.log(scope)
    // var oauth2 = new OAuth2(
    //   keys.client_id,
    //   keys.secret,
    //   'https://accounts.google.com/o/',
    //   'https://accounts.google.com/o/oauth2/token',
    //   'oauth2/token',
    //   null
    // );
    var oauth2 = new OAuth2(
        keys.client_id,//clientId,
        keys.secret,//clientSecret,
        'https://accounts.google.com/o/',//baseSite,
        'oauth2/auth?scope='+scope,//authorizePath,
        'oauth2/token?scope='+scope,//accessTokenPath,
        {'scope':scope} //customHeaders
    );
    oauth2.getOAuthAccessToken(
      keys.secret,
      {'grant_type':'authorization_code',
      'scope':'https://www.google.com/m8/feeds'},
      function (e, access_token, refresh_token, results){
        console.log('error:', e);
        console.log('bearer: ',access_token);
      }
    );
}

testOauth('google');

module.exports = router;
