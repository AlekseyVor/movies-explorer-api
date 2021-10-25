const router = require('express').Router();
const { getCurrentUser, updateCurrentUser } = require('../controllers/users');
const { checkUser } = require('../middlewares/validation');

router.get('/me', getCurrentUser);
router.patch('/me', checkUser, updateCurrentUser);

module.exports = router;
