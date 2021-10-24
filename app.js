require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
// const cors = require('cors');
// const validator = require('validator');

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

//  const method = (value) => {
//    const result = validator.isURL(value, { protocols: ['http', 'https', 'ftp'], require_protocol: true });
//    if (result) {
//      return value;
//    }
//    throw new Error('Ссылка не соответсвует формату');
//  };

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

require('./routes/index')(app);

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
