require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors, celebrate, Joi } = require('celebrate');
// const cors = require('cors');
const validator = require('validator');
const auth = require('./middlewares/auth');
const { login, newUser } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;

const app = express();

// const corsOptions = {
//   origin: [
//     'http://voroshilov.nomoredomains.club',
//     'https://voroshilov.nomoredomains.club',
//     'http://api.voroshilov.nomoredomains.club',
//     'https://api.voroshilov.nomoredomains.club',
//     'http://localhost:3002',
//   ],
//   methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
//   preflightContinue: false,
//   optionsSuccessStatus: 204,
//   allowedHeaders: ['Content-Type', 'origin', 'Authorization', 'Accept'],
//   credentials: true,
// };

 const method = (value) => {
   const result = validator.isURL(value, { protocols: ['http', 'https', 'ftp'], require_protocol: true });
   if (result) {
     return value;
   }
   throw new Error('Ссылка не соответсвует формату');
 };

mongoose.connect('mongodb://localhost:27017/moviesdb');
// app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const logger = (req, res, next) => {
  // eslint-disable-next-line no-console
  console.log('Запрос залогирован!');
  next();
};

app.use(logger);
app.use(requestLogger);

 app.post('/signin', celebrate({
   body: Joi.object().keys({
     email: Joi.string().required().email(),
     password: Joi.string().required(),
   }),
 }), login);
 app.post('/signup', celebrate({
   body: Joi.object().keys({
     name: Joi.string().min(2).max(30),
     email: Joi.string().required().email(),
     password: Joi.string().required().min(8),
   }),
 }), newUser);
app.use('/movies', auth, require('./routes/movies'));
app.use('/users', auth, require('./routes/users'));

app.use('/*', (req, res, next) => {
  const err = new Error('Ресурс не найден');
  err.statusCode = 404;
  next(err);
});

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : message,
  });
  next();
});

// eslint-disable-next-line no-console
app.listen(PORT, () => { console.log('Сервер запущен'); });
