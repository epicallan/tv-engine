'use strict'
import Media from '../models/media.js';
import stringify from 'stringify';

export default class GetMedia {

  handleError(error, res) {
    console.error(stringify(error));
    res.status(500).json({
      error: stringify(error)
    })
  }
  static _search(body) {
    var query = {
      'fuzzy': {
        'title': body.query
      }
    }
    return new Promise((resolve, reject) => {
      if (body.type === 1) {
        Media.search(query, function(err, results) {
          resolve(results);
          reject(err);
        });
      }
    });
  }

  getByName(req, res) {
    GetMedia._search(req.body).then((data) => {
      res.json(data);
    }).catch((err) => {
      if (err) console.error(err);
    });
  }
  static _getFromMongoDB(body) {
    const query = {
      type: body.type,
      imdbRating: {
        $gt: body.rating || 0
      }
    };
    if (body.id !== undefined) query._id = body.id
    if (body.genre !== undefined) query.genre = body.genre;
    const promise = Media.
    find(query).
    limit(12).
    sort({
      imdbRating: -1
    }).
    exec();
    return promise;

  }
  getMediaData(req, res) {
    GetMedia._getFromMongoDB(req.body).then((data) => {
      res.json(data);
    });
  }
}
