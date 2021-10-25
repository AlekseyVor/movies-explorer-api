require('dotenv').config();
const helmet = require('helmet');
const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000, SERVER } = process.env;

const app = express();

const corsOptions = {
  origin: [
    'http://filmsearch.voroshilov.nomoredomains.monster',
    'https://filmsearch.voroshilov.nomoredomains.monster',
    'http://api.filmsearch.voroshilov.nomoredomains.monster',
    'https://api.filmsearch.voroshilov.nomoredomains.monster',
    'http://localhost:3002',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization', 'Accept'],
  credentials: true,
};

mongoose.connect(process.env.NODE_ENV !== 'production' ? 'mongodb://localhost:27017/moviesdb' : SERVER);
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(
  rateLimit({
    windowMs: 12 * 60 * 60 * 1000, // 12 часов
    max: 100,
    message: 'Вы превысили 100 запросов за последние 12 часов',
    headers: true,
  }),
);

require('./routes/index')(app);

app.use(errorLogger);
app.use(errors());

require('./middlewares/errorhandler')(app);

app.listen(PORT);
