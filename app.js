var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var multer = require('multer');

var app = express();
var secret = Math.random() + '' + Math.random() + '' + Math.random();
var upload = multer();

/* Database connection [Mongoose] */
var dev_db_url = "mongodb+srv://paphra:admin1@inventory@developmentcluster-4codo.mongodb.net/inventory?retryWrites=true&w=majority";
var mongoDB = process.env.MONGODB_URI || dev_db_url;

mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB Conneciton Failed'));
/* End Database Connection Operations */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(upload.array());
app.use(cookieParser());
app.use(session({
  secret: 'inventory_' + secret,
  resave: true,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

/* Apply my routes */
require('./routes/login')(app);

require('./routes/index')(app);
require('./routes/stock')(app);
require('./routes/flows')(app);
require('./routes/operations')(app);
require('./routes/settings')(app);
/* end of Apply routes */


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
