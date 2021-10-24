const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized-error');

const saltRounds = 10;
const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.cookie('jwt', token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true, secure: process.env.NODE_ENV === 'production' }).status(200).send({ message: 'Logged in succesfully' });
    })
    .catch(next);
};

module.exports.logout = (req, res) => res.clearCookie('jwt').status(200).send({ message: 'Logged out succesfully' });

module.exports.getCurrentUser = (req, res, next) => User.findById(req.user._id)
  .then((user) => {
    if (!user) {
      throw new NotFoundError(`Пользователь по указанному id:${req.user_id} не найден`);
    }
    return res.status(200).send(user);
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      throw new BadRequestError('Переданы некорректные данные для поиска пользователя');
    } else {
      next(err);
    }
  });

module.exports.newUser = (req, res, next) => {
  const { name, email, password } = req.body;

  return User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError('Данный email уже существует');
      }
      return bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          next(err);
        }
        User.create({ name, email, password: hash })
          .then((newUser) => res.status(200).send({ message: `Создан пользователь с email ${newUser.email}` }));
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при создании пользователя');
      } else {
        next(err);
      }
    });
};

// eslint-disable-next-line max-len
module.exports.updateCurrentUser = (req, res, next) => User.findByIdAndUpdate(req.user._id, req.body, { new: true })
  .then((user) => {
    if (!user) {
      throw new NotFoundError(`Пользователь по указанному id:${req.user_id} не найден`);
    }
    return res.status(200).send(user);
  })
  .catch((err) => {
    if (err.name === 'ReferenceError') {
      throw new BadRequestError('Переданы некорректные данные при обновлении профиля');
    } else {
      next(err);
    }
  });
