'use strict'
import 'babel-polyfill';
import fs from 'fs';
import redis from 'redis'
import bluebird from 'bluebird';
import _ from 'lodash';
import path from 'path';
import request from 'request';
import prettyjson from 'prettyjson';
import Media from '../models/media';
import config from '../config/config';
import _async from 'async';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
bluebird.promisifyAll(request);
// const asyncRequest = bluebird.promisify(request);

const OMDBAPI = 'http://www.omdbapi.com/?';

String.prototype.lowerCaseFirstLetter = function() {
  return this.charAt(0).toLowerCase() + this.slice(1)
};


class SaveMedia {

  constructor() {
    this.media = Media;
    this.count = 1;
    this.genres = config.settings.genres;
    this.types = config.settings.types;
    this.client = redis.createClient();
    this.client.on('error', function(err) {
      console.log('Error ' + err);
    });
  }

  static requestIMDBData(url) {
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        reject(error);
        resolve(body);
        console.log(body);
      });
    });
  }

  async saveMediaData(folder) {
    const files = await this.getFiles(folder);
    //const file_names = files.map(file => file.split('.')[0]);
    this._getMovieDetails(files, (details) => {
      details.forEach(async(obj) => {
        const properties = await this.getProperties(obj.file);
        //save media
        this.mediaObjectSave(properties, JSON.parse(details), (obj) => {
          if (obj.error) console.error(obj.error);
          console.log(obj.status);
        });
      });
    });
  }

  saveToRedis(obj) {
    return new Promise((resolve, reject) => {
      this.client.HMSET(obj.id, obj.data, (err, res) => {
        resolve(res);
        reject(err);
      });
    });
  }

  getFromRedis(key) {
    return new Promise((resolve, reject) => {
      this.client.hgetall(key, (err, obj) => {
        resolve(obj);
        reject(err);
      });
    });
  }

  mergeMediaObjects(properties, imdb) {
    const details = this.processMediaDetails(imdb);
    const media = _.assign({}, details, properties);
    this.downloadImage(media);
    return media;

  }

  mediaObjectSave(media_obj, callback) {
    let media = new Media(media_obj);
    media.save(function(err) {
      if (err) {
        console.log(prettyjson.render(err));
        callback(err);
      }
      media.on('es-indexed', function() {
        console.log('document indexed');
        callback(null);
      });
    });
  }

  getProperties(file) {
    let dir = '/home/allan/tv-engine/testData';
    let url = path.join(dir, file);
    return new Promise(function(resolve, reject) {
      fs.stat(url, function(err, stats) {
        stats.location = url;
        resolve(stats);
        reject(err);
      });
    });
  }
  processMediaDetails(imdb) {
    let details = {};
    for (var prop in imdb) {
      let key = prop.lowerCaseFirstLetter();
      let value = imdb[prop];
      details[key] = value;
    }
    //console.log(prettyjson.render(details));
    //casting to number
    details.imdbRating = ~~details.imdbRating;
    //converting to array
    //console.log(prettyjson.render(details));
    if (details.actors !== undefined) details.actors = details.actors.split(',');
    if (details.director !== undefined) details.director = details.director.split(',');
    if (details.genre !== undefined) {
      let tags = details.genre.split(',');
      details.genre = this.getMediaGenre(tags);
      details.tags = tags
    }
    details.type = this.types[details.type];
    if (details.writer !== undefined) details.writer = details.writer.split(',');
    //console.log(prettyjson.render(details));
    return details;
  }

  getMediaGenre(tags) {
    //should be env virable
    let genre = 0;
    //if the genre and tag arent an exact match we use a regular expression
    for (let i = 0; i < tags.length; i++) {
      let tag = tags[i];
      tag = tag.toLowerCase().trim();
      if (this.genres[tag]) {
        genre = this.genres[tag];
        break;
      }
    }
    return genre
  }

  newGetMovieDetails(files, cb) {

  }

  _getMovieDetails(files, cb) {
    const movie_details = [];
    _async.each(files, async(file, callback) => {
      const name = file.split('.')[0]
      const url = OMDBAPI + 't=' + name + '&plot=short&r=json';
      SaveMedia.requestIMDBData(url).then((data) => {
        movie_details.push({
          file: name,
          details: data
        });
        console.log(movie_details);
        callback();
        return;
      });
    }, (err) => {
      if (err) throw new Error('deleting keys error');
      cb(movie_details);
    });
  }
  getMovieDetails(files) {
    let promises = {};
    files.forEach((file) => {
      let url = OMDBAPI + 't=' + file + '&plot=short&r=json';
      promises[file] = new Promise(function(resolve, reject) {
        request(url, (error, response, body) => {
          if (!error && response.statusCode == 200) {
            resolve(body);
          } else {
            reject(error)
          }
        });
      });
    });
    return promises;
  }

  downloadImage(media) {
    let src = media.tile + '.' + path.extname(media.poster)
    media.image = path.resolve(__dirname, '../../images/' + src);
    return new Promise((resolve, reject) => {
      request
        .get(media.poster)
        .on('response', (response) => {
          resolve(response.headers['content-type']);
        })
        .on('error', function(err) {
          reject(err);
          throw new Error(err.toString);
        })
        .pipe(fs.createWriteStream(media.image));
    });
  }
  getFiles(folder_path) {
    return new Promise(function(resolve, reject) {
      fs.readdir(folder_path, function(err, files) {
        err ? reject(err) : resolve(files);
      });
    });
  }
}
export default new SaveMedia();
