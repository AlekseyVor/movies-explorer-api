const auth = require('../middlewares/auth');
const { login, newUser, logout } = require('../controllers/users');
const movies = require('./movies');
const users = require('./users');
const { signinCheck, signupCheck } = require('../middlewares/validation');

module.exports = (app) => {
  app.post('/signin', signinCheck, login);
  app.post('/signup', signupCheck, newUser);
  app.get('/', auth);
  app.post('/signout', auth, logout);
  app.use('/movies', auth, movies);
  app.use('/users', auth, users);

  app.use('/*', (req, res, next) => {
    const err = new Error('Ресурс не найден');
    err.statusCode = 404;
    next(err);
  });
};
