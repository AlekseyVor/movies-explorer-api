const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.status(200).send(movies))
    .catch(next);
};

module.exports.postMovie = (req, res, next) => {
  const {
    // eslint-disable-next-line max-len
    country, director, duration, year, description, image, trailer, thumbnail, movieId, nameRU, nameEN, 
  } = req.body;

  Movie.create({
    // eslint-disable-next-line max-len
    country, director, duration, year, description, image, trailer, thumbnail, movieId, nameRU, nameEN, owner: req.user._id, 
  })
    .then((newMovie) => {
      Movie.findById(newMovie._id)
        .then((movie) => res.status(200).send(movie));
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при создании карточки');
      }
      next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError(`Карточка с указанным id:${req.params.movieId} не найдена`);
      }
      if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Карточка принадлежит другому пользователю');
      }
      Movie.findByIdAndDelete(req.params.cardId)
        .then(() => res.status(200).send({ message: 'Карточка удалена' }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные при удалении карточки');
      } else { next(err); }
    });
};
