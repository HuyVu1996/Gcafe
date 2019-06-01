var createError = require('http-errors');
var express = require('express');
const { check,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var MongoStore = require('connect-mongo')(session);

var indexRouter = require('./routes/index');

var app = express();

//Connect DB:
var mongoose = require('mongoose');
let options = {
  useMongoClient: true,
  // db: {native_parser: true},
  // server: {poolSize: 5},
  poolSize: 5,
  user: 'BOSSHIE',
  pass: 'BOSSHIE',

};
// Use native Promises
mongoose.Promise = global.Promise;
GCafeMongoDB = mongoose.connect('mongodb://localhost:27017/GCafeMongoDB', options).then(
  () => {
    console.log("connect DB successfully");
  },
  err => {
    console.log(`Connection failed. Error: ${err}`);
  }
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard HIE company',
  resave: false,
  saveUninitialized: true,
  store:new MongoStore({ mongooseConnection: mongoose.connection })

  // cookie: { 
    // secure: true  ,
    // maxAge: 1000*60*30,
  // },
  // genid: (req) => {
  //   console.log('Inside the session middleware')
  //   console.log(req.sessionID)
  // },
}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
