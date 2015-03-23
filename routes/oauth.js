var express = require('express'),
    OAuth = require('oauth').OAuth,
    querystring = require('querystring'),
    router = express.Router();

router.get('/:service/login', function(req, res, next) {
  res.render('index', { title: 'Login With '+req.params.service.toUpperCase() });
  res.end();
});

router.get('/:service/callback', function(req, res, next) {
  res.render('index', { title: 'Callback For '+req.params.service.toUpperCase() });
  res.end();
});

module.exports = router;