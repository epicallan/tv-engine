'use strict'
import Media from '../models/media.js';
import stringify from 'stringify';

class TvEngineGetMedia {

  constructor() {
    this.media = Media;
  }

  handleError(error, res) {
    console.log(stringify(error));
    res.status(500).json({
      error: stringify(error)
    })
  }
  
  search(name) {
    var query = {
      'fuzzy': {
        'title': name
      }
    }
    return new Promise((resolve, reject) => {
      Media.search(query, function(err, results) {
        resolve(results);
        reject(err);
      });
    });
  }
  getByNameAndType(req, res) {
    //TODO include type in search
    var query = {
      'fuzzy': {
        'title': req.body.query
      }
    }
    Media.search(query, function(err, results) {
      res.json(results);
    });
  }
  getByNameTagAndType(req, res) {
    //TODO include type in search
    var query = {
      'fuzzy': {
        'title': req.body.query
      }
    }
    Media.search(query, function(err, results) {
      res.json(results);
    });
  }
  getByTagAndType(req, res) {
    Media.
    find({
      genre: req.body.tag
    }).
    where('imdbRating').gte(req.body.rating).
    limit(24).
    sort({
      imdbRating: 1
    }).
    exec((err, docs) => {
      if (err) return this.handleError(err, res);
      res.json(docs);
    });
  }
}
export default new TvEngineGetMedia();
