var express = require('express');
var router = express.Router();
var request = require('request');
require('request').debug = true;  // Turn debug on
// Authentication
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var keyfile = require('../config/api_keys');

// HTTP & API requests
var hackerschool = keyfile.hackerschool;
var google = keyfile.google;


/**
 * ________
 * `MMMMMMMb.
 *  MM    `Mb                        /
 *  MM     MM    _____   ___   ___  /M       ____     ____
 *  MM     MM   6MMMMMb  `MM    MM /MMMMM   6MMMMb   6MMMMb\
 *  MM    .M9  6M'   `Mb  MM    MM  MM     6M'  `Mb MM'    `
 *  MMMMMMM9'  MM     MM  MM    MM  MM     MM    MM YM.
 *  MM  \M\    MM     MM  MM    MM  MM     MMMMMMMM  YMMMMb
 *  MM   \M\   MM     MM  MM    MM  MM     MM            `Mb
 *  MM    \M\  YM.   ,M9  YM.   MM  YM.  , YM    d9 L    ,MM
 * _MM_    \M\_ YMMMMM9    YMMM9MM_  YMMM9  YMMMM9  MYMMMM9
 *
 * ROUTES
 * Routing starting from /contacts:
 * /      - Homepage, only accessible through authentication.
 *          If authenticated, it will request & show the list of batches.
 * /auth  - Authentication with a Recouse Center account.
 * /:id   - Requests the students of the batch with this id.
 */
router.get('/', isLoggedIn, function (req, res, next) {
  var successFn = function (batches) {
    if (typeof batches === 'string') {
      batches = JSON.parse(batches);
    }

    //console.log('Batches:', batches);

    res.render('contacts', {
      batches: batches
    });
  };

  var failureFn = function (a, b, c) {
    console.log('ERROR:', a, b, c);
  };

  recurseapi.getBatches(successFn, failureFn);
});

router.get('/auth', function (req, res, next) {
  // Send them to Hacker School authentication,
  // which in turn will request Google authentication.
  res.redirect(req.baseUrl + '/hackerschool');
});

// Hacker School authentication
router.get('/hackerschool', passport.authenticate('hackerschool'));
router.get('/hackerschool/callback', passport.authenticate('hackerschool', {
  successRedirect: '/contacts/google',
  failureRedirect: '/contacts/error'
}));

// Google authentication
router.get('/google', passport.authenticate('google', {
  scope: google.scopes.join(' ')
}));
router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/contacts',
  failureRedirect: '/error'
}));

// Get the batches' IDs and store the people's contacts
router.get('/save', /*isLoggedIn,*/ function (req, res, next) {
  var ids = req.query.ids;

  // Raise error if no IDs provided
  if (!ids) {
    // TODO
  }

  // TODO Remove this failsafe
  return;

  // Get the batches' IDs into an array
  ids = req.query.ids.split(',');
  if (ids.length) {
    // TODO
// 1. For each ID, check if we have the students:
//    a) If not, request them, then proceed when received
    ids.forEach(function (batchId) {
      batchId = batchId.toString();
      if (_cache.people[batchId]) {
        var people = _cache.people[batchId];
        var batch = _cache.batches.filter(function (batch) {
          return batch.id.toString() === batchId;
        });
        if (batch.length === 1) {
          batch = batch[0];
// 2. If/when we have them, create a group for each batch:
          googleapi.createGroup(
            batch.name,
// 3. After the groups are created, batch-insert the people on them:
            googleapi.saveContacts.bind(this, people),
            function (a, b, c) {
              // TODO
              console.log('TODO', a, b, c);
            }
          );
        } else {
          // TODO
        }
      }
    }.bind(this));
  }

  res.render('index', {
    title: ids.join(',')
  });
});

// Request a batches' contacts
router.get('/:bid', isLoggedIn, function (req, res, next) {
  var bid = req.params.bid;
  // TODO Request the list of people to an endpoint;
  // For now, just mock it.

  // var successFn = function (contacts) {
  //   contacts = JSON.parse(batches);

  //   console.log(contacts);
  // };

  // var failureFn = function (err) {
  //   console.log('ERROR:', err)
  // };




  var successFn = function (people) {
    // TODO
    // 1. Create the group
    googleapi.createGroup(
      'testGroup',
      googleapi.saveContacts.bind(this, people),
      function (err, msg) {
        console.log('saveContacts error:', err, msg);
      }
    );
    // 2. Put everyone on the newly created group
    //googleapi.createGroup('testGroup');

    res.render('people', {
      people: people
    }, function (err, html) {
      res.send(html);
    });
  };

  var failureFn = function (a, b, c) {
    console.log('ERROR:', a, b, c)
  };

  recurseapi.getContacts(bid, successFn, failureFn);
});

/**
 *        _                        ___
 *       dM.                       `MM
 *      ,MMb                 /      MM
 *      d'YM.    ___   ___  /M      MM  __
 *     ,P `Mb    `MM    MM /MMMMM   MM 6MMb
 *     d'  YM.    MM    MM  MM      MMM9 `Mb
 *    ,P   `Mb    MM    MM  MM      MM'   MM
 *    d'    YM.   MM    MM  MM      MM    MM
 *   ,MMMMMMMMb   MM    MM  MM      MM    MM
 *   d'      YM.  YM.   MM  YM.  ,  MM    MM
 * _dM_     _dMM_  YMMM9MM_  YMMM9 _MM_  _MM_
 *
 * AUTHENTICATION
 * Setup a few things required for authentication process: helper methods
 * and authentication providers.
 */

// Hacker School
var hackerschoolBase = 'https://www.recurse.com';
passport.use('hackerschool', new OAuth2Strategy({
    clientID:     hackerschool.clientId,
    clientSecret: hackerschool.clientSecret,
    callbackURL:  hackerschool.callbackUrl,
    authorizationURL: hackerschoolBase + '/oauth/authorize',
    tokenURL: hackerschoolBase + '/oauth/token'
}, function (accessToken, refreshToken, profile, done) {
  // TODO
  // Store accessToken

  process.nextTick(function () {
    recurseapi.setToken(accessToken);

    return done(null, profile);
  });
}));

// Google
passport.use('google', new GoogleStrategy({
  clientID:     google.clientId,
  clientSecret: google.clientSecret,
  callbackURL:  google.callbackUrl
}, function (accessToken, refreshToken, profile, done) {
  // TODO
  // Store accessToken

  process.nextTick(function () {
    googleapi.setToken(accessToken);

    return done(null, profile);
  });
}));

// Helpers
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  console.log('\nNOT LOGGED IN:', req.baseUrl + '/auth');

  res.redirect(req.baseUrl + '/auth');
}


/**
 * ________
 * `MMMMMMMb.
 *  MM    `Mb                                                  /
 *  MM     MM    ____     ____   ___   ___   ____     ____    /M       ____
 *  MM     MM   6MMMMb   6MMMMb/ `MM    MM  6MMMMb   6MMMMb\ /MMMMM   6MMMMb\
 *  MM    .M9  6M'  `Mb 6M'  `MM  MM    MM 6M'  `Mb MM'    `  MM     MM'    `
 *  MMMMMMM9'  MM    MM MM    MM  MM    MM MM    MM YM.       MM     YM.
 *  MM  \M\    MMMMMMMM MM    MM  MM    MM MMMMMMMM  YMMMMb   MM      YMMMMb
 *  MM   \M\   MM       MM    MM  MM    MM MM            `Mb  MM          `Mb
 *  MM    \M\  YM    d9 YM.  ,MM  YM.   MM YM    d9 L    ,MM  YM.  , L    ,MM
 * _MM_    \M\_ YMMMM9   YMMMM9M   YMMM9MM_ YMMMM9  MYMMMM9    YMMM9 MYMMMM9
 *                            MM
 *                            MM
 *                           _MM_
 *
 * REQUESTS
 * Requests wrappers.
 */
var recurseapi = (function () {
  var base    = 'https://www.recurse.com';
  var batches = '/api/v1/batches';
  var people  = '/api/v1/batches/:batch_id/people';
  var token   = null;

  // Cache object, holds batches & people
  var _cache = {
    batches: null,
    people:  {}
  }

  // Get base object (can be extended after, using it as constructor)
  var apireq = request.defaults({
    baseUrl: base
  });

  /**
   * Get all batches.
   * @param  {Function} Callback to handle the response.
   * @return {[type]}
   */
  function getBatches(successFn, failureFn) {
    if (!this.token) {
      return;
    }

    // Return cached result
    if (_cache.batches) {
      successFn(_cache.batches);
    }

    var url = batches;

    // TODO
    // Will 200 restrict me on a few answers...?
    apireq.get(url, function (error, response, body) {
      // If correct, `body` will be:
      // [
      //   {
      //     id: 17,
      //     name: 'Spring 1, 2015',
      //     start_date: '2015-02-16',
      //     end_date: '2015-05-07'
      //   }
      //   ...
      // ]
      if (!error && response.statusCode == 200) {
        // Cache the result first
        _cache.batches = JSON.parse(body);

        successFn(body);
      } else {
        failureFn(error);
      }
    });
  }

  /**
   * Get everyone from a single batch.
   * @param  {Number|String}  The ID of a batch.
   * @param  {Function}       Callback to handle the response.
   * @return {[type]}
   */
  function getContacts(batchId, successFn, failureFn) {
    if (!this.token || parseInt(batchId, 10) === NaN) {
      return;
    }

    // Check if we have the people already
    batchId = batchId.toString();
    var cached = _cache.people;
    if (cached[batchId]) {
      return cached[batchId];
    }

    var url = people.replace(/:batch_id/g, batchId);

    // TODO
    // Will 200 restrict me on a few answers...?
    apireq.get(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // Cache the result using the batch ID
        body = JSON.parse(body);
        cached[batchId] = body;

        console.log('_cache:', _cache);

        successFn(body);
      } else {
        failureFn(error);
      }
    });
  }

  function setToken(accessToken) {
    if (accessToken && typeof accessToken === 'string') {
      this.token = accessToken;

      // Get a new request object, using the previous one as constructor
      // (in order to keep the previous options).
      apireq = apireq.defaults({
        qs: {
          access_token: this.token
        }
      });
    }
  }

  return {
    'setToken': setToken,
    'getBatches': getBatches,
    'getContacts': getContacts
  };
}());

var googleapi = (function () {
  // HTTP header:  GData-Version: 3.0
  // Query param:  v=3.0
  // JSON Request: alt=json

  //var base = 'https://www.google.com/m8/feeds/contacts/default/full/batch';
  var base = 'https://www.google.com/m8/feeds/contacts/default/full';
  var token = null;

  // Get base object (can be extended after, using it as constructor)
  var apireq = request.defaults({
    //baseUrl: base
  });

  function retrieveContacts(successFn, failureFn) {
    if (!this.token) {
      return;
    }

    var url = base;

    console.log('URL:  ', url);
    console.log('TOKEN:', this.token);
    //return

    // TODO
    // Will 200 restrict me on a few answers...?
    apireq.get(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        successFn(body);
      } else {
        failureFn(error);
      }
    });
  }

  function _personCard(info, group) {
    return '  <gd:name>'
      + '     <gd:fullName>' + info.name + '</gd:fullName>'
      + '  </gd:name>'
      + (info.email ? '  <gd:email rel="http://schemas.google.com/g/2005#work"'
      + '    primary="true"'
      + '    address="' + info.email + '" />' : '')
      + (info.phone ? '  <gd:phoneNumber'
      + '    rel="http://schemas.google.com/g/2005#work"'
      + '    primary="true">'
      + info.phone
      + '  </gd:phoneNumber>' : '')
      + '  <atom:content type="text">'
      + (info.twitter ? '    Twitter: https://twitter.com/' + info.twitter : '')
      + (info.github ? '    GitHub: https://github.com/' + info.github : '')
      + '  </atom:content>'
      + (group ? '<gContact:groupMembershipInfo deleted="false"'
      + '  href="' + group + '"/>' : '');
  }

  function _batchAdd(people, group) {
    var head = '<?xml version="1.0" encoding="UTF-8"?>'
      + '<feed xmlns="http://www.w3.org/2005/Atom"'
      + '      xmlns:gContact="http://schemas.google.com/contact/2008"'
      + '      xmlns:gd="http://schemas.google.com/g/2005"'
      + '      xmlns:batch="http://schemas.google.com/gdata/batch">';
    var tail = '</feed>';

    return head + people.map(function (person) {
      console.log('PERSON:', person);

      return '<entry>'
        + '  <batch:id>create</batch:id>'
        + '  <batch:operation type="insert"/>'
        + '  <category scheme="http://schemas.google.com/g/2005#kind"'
        + '    term="http://schemas.google.com/g/2008#contact"/>'
        + _personCard(person)
        + '</entry>';
    }).join('') + tail;
  }

  function createGroup(name, successFn, failureFn) {
    if (!this.token || !name) {
      return;
    }

    name = 'RC ~ ' + name;
    var url = 'https://www.google.com/m8/feeds/groups/default/full';
    var entry = '<entry xmlns:gd="http://schemas.google.com/g/2005">'
      + '<category scheme="http://schemas.google.com/g/2005#kind"'
      + '    term="http://schemas.google.com/contact/2008#group"/>'
      + '  <title type="text">' + name + '</title>'
      + '  <gd:extendedProperty name="description">'
      + '    <info>Recourse Center batch of ' + name + '</info>'
      + '  </gd:extendedProperty>'
      + '</entry>';
    var contentType = 'application/atom+xml';

    apireq.post({
      url: url,
      body: entry,
      headers: {
        'content-type': 'application/atom+xml'
      }
    }, function (err, res, msg) {
      if (err || res.statusCode !== 201) {
        failureFn(err, res);
        return;
      }

      // String -> JSON
      msg = JSON.parse(msg);

      // Send the group ID (basically, an URL) to the callback
      var id = msg.entry.id.$t;
      successFn(id);
    });
  }

  function saveContacts(people, groupId) {
    var contacts = people.map(function (contact) {
      return {
        name:    contact.first_name + ' ' + contact.last_name,
        email:   contact.email,
        phone:   contact.phone_number,
        twitter: contact.twitter,
        github:  contact.github
      };
    });
    var url = 'https://www.google.com/m8/feeds/groups/default/full/batch';
    var entry = _batchAdd(contacts, groupId);

    apireq.defaults({
      qs: {
        alt: null
      }
    }).post({
      url: url,
      body: entry,
      alt: 'xml',
      headers: {
        'content-type': 'application/atom+xml'
      }
    }, function (err, res, msg) {
      if (err || res.statusCode !== 201) {
        console.log('FAILURE:', msg);

        // TODO
        //failureFn(err, res);
        return;
      }

      // String -> JSON
      //msg = JSON.parse(msg);

      // TODO
      //successFn(id);

      console.log('SUCCESS:', err, res);
    });
  }

  function setToken(accessToken) {
    if (accessToken && typeof accessToken === 'string') {
      this.token = accessToken;

      // Get a new request object, using the previous one as constructor
      // (in order to keep the previous options).
      apireq = apireq.defaults({
        qs: {
          access_token: this.token,
          v: '3.0',
          alt: 'json'
        }
      });
    }
  }

  return {
    'retrieveContacts': retrieveContacts,
    'saveContacts': saveContacts,
    'createGroup': createGroup,
    'setToken': setToken
  };
}());


/**
 * __________
 * `MMMMMMMMM
 *  MM      \                                          /
 *  MM        ____   ___ __ ____     _____   ___  __  /M
 *  MM    ,   `MM(   )P' `M6MMMMb   6MMMMMb  `MM 6MM /MMMMM
 *  MMMMMMM    `MM` ,P    MM'  `Mb 6M'   `Mb  MM69 "  MM
 *  MM    `     `MM,P     MM    MM MM     MM  MM'     MM
 *  MM           `MM.     MM    MM MM     MM  MM      MM
 *  MM           d`MM.    MM    MM MM     MM  MM      MM
 *  MM      /   d' `MM.   MM.  ,M9 YM.   ,M9  MM      YM.  ,
 * _MMMMMMMMM _d_  _)MM_  MMYMMM9   YMMMMM9  _MM_      YMMM9
 *                        MM
 *                        MM
 *                       _MM_
 *
 * EXPORT
 */
module.exports = router;
