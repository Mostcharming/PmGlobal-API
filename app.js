const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const usersRouter = require('./routes/usersRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.use('/', viewRouter);

app.use(express.static(path.join(__dirname, 'public')));

//pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  if (!req.get('Authorization')) {
    var err = new Error('Not Authenticated');
    res.status(401).set('WWW-Authenticate', 'Basic');
    next(err);
  } else {
    var credentials = Buffer.from(
      req.get('Authorization').split(' ')[1],
      'base64'
    )
      .toString()
      .split(':');

    var username = credentials[0];
    var password = credentials[1];

    if (!(username === 'test' && password === 'pass1234')) {
      var err = Error('Not Authenticated');
      res.status(401).set('WWW-Authenticate', 'Basic');
      next(err);
    }
    res.status(200);
    next();
  }
});

app.enable('trust proxy');

app.use(cors());

app.options('*', cors());

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/users', limiter);

app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use('/users', usersRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
