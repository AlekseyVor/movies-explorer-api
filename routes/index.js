const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const { login, newUser, logout } = require('../controllers/users');
const movies = require('./movies');
const users = require('./users');

module.exports = (app) => {
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
  app.post('/signout', auth, logout);
  app.use('/movies', auth, movies);
  app.use('/users', auth, users);

  app.use('/*', (req, res, next) => {
    const err = new Error('Ресурс не найден');
    err.statusCode = 404;
    next(err);
  });
};
