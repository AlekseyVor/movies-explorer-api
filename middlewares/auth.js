const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');

const { NODE_ENV, JWT_SECRET } = process.env;

const handleAuthError = () => {
  throw new UnauthorizedError('Необходима авторизация');
};

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return handleAuthError();
  }

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (e) {
    return handleAuthError();
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше

  return req.user;
};
