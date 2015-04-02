var request = require('request');
//request.debug = true;
var async = require('async');
var express = require('express');
var router = express.Router();
// Authentication
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var keyfile = require('../config/api_keys');

// HTTP & API requests
var recurse = keyfile.recurse;
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
  // Get a possible message to display
  var msg = req.session.msg;
  if (msg) {
    // Resets it, if found:
    req.session.msg = null;
  }

  var successFn = function (batches) {
    res.render('contacts', {
      batches: batches,
      alert: msg
    });
  };

  recurseapi.getBatches(successFn);
});

router.get('/auth', function (req, res, next) {
  // Send them to Recurse Center authentication,
  // which in turn will request Google authentication.
  res.redirect(req.baseUrl + '/recurse');
});

// Recurse Center authentication
router.get('/recurse', passport.authenticate('recurse'));
router.get('/recurse/callback', passport.authenticate('recurse', {
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

  // Raise error if no IDs provided and stop there.
  if (!ids) {
    showContactsResult(req, res, {
      type: 'danger',
      msg: 'No batch ID provided. Try again!'
    });
    return;
  }

  // Callback for all the requests
  var callbackFinal = function (err) {
    if (err) {
      showContactsResult(req, res, {
        type: 'danger',
        msg: 'Something wrong happened. Please check your'
          + ' <a href="https://contacts.google.com">Google Contacts</a>'
          + ' to make sure you don\'t already have the groups.'
      });
      return;
    }

    // No error? Redirect to /contacts and show success message
    showContactsResult(req, res, {
      type: 'success',
      msg: 'Contacts successfuly added to your'
        + ' <a href="https://contacts.google.com">Google Contacts</a>!'
    });
  };

  // Get the batches' IDs into an array
  ids = req.query.ids.split(',');
  if (ids.length) {
    // For each bach, make a request and react at the end of them
    // TODO
    // I need to clal the callback to async finishes
    var that = this;
    async.parallel(ids.map(function (id) {
      return function (batchId, callback) {
        batchId = batchId.toString();

        var callbackGotContacts = function (err, people) {
          var doneFn = function (batches) {
            var batch = batches.filter(function (batch) {
              return batch.id.toString() === batchId;
            });

            // You should have a single match for the batch ID
            if (batch.length === 1) {
              batch = batch[0];
              // 2. If/when we have them, create a group for each batch:
              googleapi.createGroup(
                batch.name,
                // 3. After the groups are created,
                //    batch-insert the people onto them:
                //googleapi.saveContacts.bind(this, people),
                function (groupId) {
                  googleapi.saveContacts(people, groupId, callback);
                },
                function (a, b, c) {
                  // TODO
                  console.log('TODO err!', a, b, c);
                }
              );
            } else {
              // TODO
              console.log('TODO Length != 1');
            }
          }
          var failFn = function (err) {
              // TODO
              console.log('TODO error & stuff', err);
          }
          recurseapi.getBatches(doneFn, failFn);
        };

        // TODO
        var callbacDidntGetContacts = function (err) {
          console.log('TODO err!!', err);
        };

        recurseapi.getContacts(
          batchId,
          callbackGotContacts,
          callbacDidntGetContacts
        );
      }.bind(that, id);
      // TODO Make previous bind() not needing `that`?
    }), callbackFinal);
  } else {
    // TODO
  }

  // TODO
  // I probably don't need this
  // res.render('index', {
  //   title: ids.join(',')
  // });
});

// Request a batches' contacts
router.get('/:bid', isLoggedIn, function (req, res, next) {
  // Get the batch ID provided
  var bid = req.params.bid;

  // Sends a JSON of the batch's people
  var successFn = function (people) {
    res.status(200).send(people);
  };

  // TODO
  var failureFn = function (a, b, c) {
    console.log('ERROR:', a, b, c);
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

// Recurse Center
var recurseBase = 'https://www.recurse.com';
passport.use('recurse', new OAuth2Strategy({
    clientID:     recurse.clientId,
    clientSecret: recurse.clientSecret,
    callbackURL:  recurse.callbackUrl,
    authorizationURL: recurseBase + '/oauth/authorize',
    tokenURL: recurseBase + '/oauth/token'
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
 * Redirects to Contacts page with a message object (type & text message).
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
function showContactsResult(req, res, msg) {
  console.log('showContactsResult ->');
  req.session.msg = msg;
  res.redirect('/contacts');
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

  function findBatch(batchId) {
    return _cache.people[batchId.toString()];
  }

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
      return;
    }

    var url = batches;

    // TODO
    // Will 200 restrict me on a few answers...?
    apireq.get(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // Cache the result first
        _cache.batches = JSON.parse(body);

        successFn(_cache.batches);
      } else {
        // Default error callback & message
        // TODO
        // This won't work. That's it.
        console.log("This won't work. That's it.")
        var backupFn = function () {
          // TODO
          showContactsResult({
            type: 'danger',
            msg: 'Error loading batches, try again later.'
          });
        };

        (failureFn || backupFn)(error);
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
      // TODO
      // Better error msg?
      return;
    }

    // Check if we have the people already
    batchId = batchId.toString();
    var cached = _cache.people;
    if (cached[batchId]) {
      successFn(null, cached[batchId]);
      return;
    }

    var url = people.replace(/:batch_id/g, batchId);

    // TODO
    // Will 200 restrict me on a few answers...?
    apireq.get(url, function (error, response, body) {
      console.log('stuff err', error, response.statusCode);
      if (!error && response.statusCode == 200) {
        // Cache the result using the batch ID
        body = JSON.parse(body);
        cached[batchId] = body;

        successFn(null, body);
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
    'findBatch': findBatch,
    'getBatches': getBatches,
    'getContacts': getContacts
  };
}());

var googleapi = (function () {
  //var base = 'https://www.google.com/m8/feeds/contacts/default/full/batch';
  var base = 'https://www.google.com/m8/feeds/contacts/default/full';
  var _token = null;

  // Get base object (can be extended after, using it as constructor)
  var apireq = request.defaults({});

  function retrieveContacts(successFn, failureFn) {
    if (!_token) {
      return;
    }

    var url = base;

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

    return head + people.map(function (person, index) {
      return '<entry>'
        + '  <batch:id>' + group + '</batch:id>'
        + '  <batch:operation type="insert"/>'
        + '  <category scheme="http://schemas.google.com/g/2005#kind"'
        + '            term="http://schemas.google.com/g/2008#contact"/>'
        + _personCard(person, group)
        + '</entry>';
    }).join('') + tail;
  }

  function createGroup(name, successFn, failureFn) {
    if (!_token || !name) {
      return;
    }

    name = 'RC ~ ' + name;
    var url = 'https://www.google.com/m8/feeds/groups/default/full';
    var entry = '<entry xmlns:gd="http://schemas.google.com/g/2005">'
      + '  <category scheme="http://schemas.google.com/g/2005#kind"'
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
      // However, make _sure_ it's not XML
      if (msg.charAt(0) !== '<') {
        msg = JSON.parse(msg);
        // Send the group ID (basically, an URL) to the callback
        successFn(msg.entry.id.$t);
      } else {
        failureFn(err, {
          type: 'danger',
          msg: 'Something wrong happened. Are you sure you don\'t have this'
          + ' contact group already? Check your'
          + ' <a href="https://contacts.google.com">Google Contacts</a>,'
        });
      }
    });
  }

  function saveContacts(people, groupId, callback) {
    var contacts = people.map(function (contact) {
      return {
        name:    contact.first_name + ' ' + contact.last_name,
        email:   contact.email,
        phone:   contact.phone_number,
        twitter: contact.twitter,
        github:  contact.github
      };
    });
    var url = 'https://www.google.com/m8/feeds/contacts/default/full/batch';
    var entry = _batchAdd(contacts, groupId);

    setFormat(null).post({
      url: url,
      body: entry,
      headers: {
        'content-type': 'application/atom+xml'
      }
    }, function (err, res, msg) {
      if (err || (res.statusCode !== 200 && res.statusCode !== 201)) {
        console.log('FAILURE:', err, res.statusCode);

        // TODO
        //failureFn(err, res);
        return;
      }

      // showContactsResult({
      //   type: 'success',
      //   msg: 'Contacts successfuly imported!\n' +
      //     'Check them out at <a href="https://contacts.google.com">Google Contacts</a>'
      // });
      callback(null);

      console.log('SUCCESS:', msg);
    });
  }

  function setFormat(format) {
    apireq = apireq.defaults({
      qs: {
        access_token: _token,
        v: '3.0',
        alt: format
      }
    });

    return apireq;
  }

  function setToken(accessToken) {
    if (accessToken && typeof accessToken === 'string') {
      _token = accessToken;

      // Get a new request object, using the previous one as constructor
      // (in order to keep the previous options).
      apireq = apireq.defaults({
        qs: {
          access_token: _token,
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
