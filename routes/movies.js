const router = require('express').Router();
const { getMovies, postMovie, deleteMovie } = require('../controllers/movies');
const { checkMovie, checkMovieId } = require('../middlewares/validation');

router.get('/', getMovies);
router.post('/', checkMovie, postMovie);
router.delete('/:movieId', checkMovieId, deleteMovie);

module.exports = router;
