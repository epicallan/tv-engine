'use strict'
import Media from '../models/media.js';
import stringify from 'stringify';

class TvEngineGetMedia {

  constructor() {
    this.media = Media;
  }

  handleError(error, res) {
    console.error(stringify(error));
    res.status(500).json({
      error: stringify(error)
    })
  }

  _search(name) {
    var query = {
      'fuzzy' : { 'title' : name }
    }
    return new Promise((resolve, reject) => {
      Media.search(query, function(err, results) {
        resolve(results);
        reject(err);
      });
    });
  }

  getByName(req, res) {
    this._search(req.body.query).then((data) => {
      res.json(data)
    }).catch((err) => {
      if (err) console.error(err);
    })

  }
  _getFromMongoB(type, genre, rating) {
    const promise = Media.
    find({
      type: type,
      genre: genre,
      imdbRating: {
        $gt: rating
      }
    }).
    limit(12).
    sort({
      rating: -1
    }).
    exec();
    return promise;

  }
  getByTag(req, res) {
    this._getFromMongoB(req.body.type, req.body.genre, req.body.rating).then((data) => {
      res.json(data);
    });
  }
}
export default new TvEngineGetMedia();
