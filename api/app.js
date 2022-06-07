var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const helpers = require('./helpers/index')
const Sentry = require("@sentry/node")
const Tracing = require("@sentry/tracing")
var app = express();

Sentry.init({
  dsn: "https://9f9dd90308714321bd222a65679fe52c@o1162014.ingest.sentry.io/6474657",
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.options('*', cors());
//app.options("*", cors({ origin: ['http://localhost:3000'], optionsSuccessStatus: 200 }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use('/', require('./routes/index'));
app.use('/api/v1', require('./routes/users'));
app.use('/api/v1', require('./routes/tickets'))
app.use('/api/v1', require('./routes/devices'))
app.use('/api/v1', require('./routes/payments'))
app.use('/api/v1', require('./routes/auth'))

app.use(Sentry.Handlers.errorHandler());

app.use(function (req, res, next) {
  return helpers.response.notFoundResponse(res, "Api resource not found")
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