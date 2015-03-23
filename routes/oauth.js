var express = require('express'),
    OAuth = require('oauth').OAuth,
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

module.exports = router;