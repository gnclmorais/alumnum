var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var app = express();

var fs = require('fs');

var express_session = require('express-session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express_session({
//   secret: get_secret_sync(),
//   resave: true,
//   saveUninitialized: true
// }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/',         require('./routes/index'));
//app.use('/auth',     require('./routes/oauth'));
app.use('/users',    require('./routes/users'));
app.use('/contacts', require('./routes/contacts'));
app.use('/auth', require('./routes/passport'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') !== 'production') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


function get_secret_sync() {
  var filename = 'config/session_secret',
      string   = "";
  try {
    string = fs.readFileSync(filename);
  } catch (e) {
    while (string.length<500) {
      string += String.fromCharCode( Math.floor( Math.random() * 94 ) + 33);
    }
    console.log("Generated new secret session key");
    console.log("[ ======================================== ]");
    console.log(string);
    console.log("[ ======================================== ]");
    console.log("Saving to "+filename+"...");
    fs.writeFileSync(filename, string);
  }
  return string;
}

module.exports = app;
