const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getCurrentUser, updateCurrentUser } = require('../controllers/users');

router.get('/me', getCurrentUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required(),
  }),
}), updateCurrentUser);

module.exports = router;
