const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch((err) => {
      next(err);
    });
};

module.exports.postMovie = (req, res, next) => {
  const film = req.body;
  film.owner = req.user._id;

  Movie.create(film)
    .then((newMovie) => {
      Movie.findById(newMovie._id)
        .then((movie) => res.send(movie));
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании фильма'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(new NotFoundError(`Фильм с указанным id:${req.params.movieId} не найден`))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        next(new ForbiddenError('Фильм принадлежит другому пользователю'));
      }
      return Movie.findByIdAndDelete(req.params.movieId)
        .then(() => res.send({ message: 'Фильм удален' }));
    })
    .catch((err) => {
      next(err);
    });
};
