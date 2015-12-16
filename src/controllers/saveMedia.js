/**
 * TvEngineSaveMedia
 * Description
 *
 * @name TvEngineSaveMedia
 * @function
 * @param {Array} data An array of data
 * @param {Object} options An object containing the following fields:
 *
 * @return {Array} Result
 */
'use strict'

import fs from 'fs';
import redis from 'redis'
import bluebird from 'bluebird';
import _ from 'lodash';
import path from 'path';
import request from 'request';
import prettyjson from 'prettyjson';
import Media from '../models/media.js';
import config from '../config/config';
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

String.prototype.lowerCaseFirstLetter = function() {
  return this.charAt(0).toLowerCase() + this.slice(1)
};


class SaveMedia {

  constructor() {
    this.media = Media;
    this.genres = config.settings.genres;
    this.types = config.settings.types;
    this.base_url = 'http://www.omdbapi.com/?';
    this.client = redis.createClient();
    this.client.on('error', function(err) {
      console.log('Error ' + err);
    });
  }

  /**
   * get media files
   * get file properties and then get imdb details
   * file properties temporarily saved to redis and then retrieved and joined to
   * the imdb object for saving to mmongodb
   * @return {[type]} [description]
   */
  saveData(folder, callback) {
    //gets a list of files from a directory
    this.getFiles(folder).then((files) => {
      //remove media file extensions array
      let file_names = files.map(file => file.split('.')[0]);
      //get  series or movie media details from IMDB as a list of promises
      const movie_detail_promises = this.getMovieDetails(file_names);
      //get file properties eg file size as promise objects witth file names as keys
      _.forIn(this.getFileProperties(files), (promise, key) => {
        //temporary save file stats to redis TODO could use generators so that once
        //the network call from imdb returns with an obj, the stats obj can be retrieved and
        //merged with the imdb obj
        promise.then((stats) => {
          //saving to redis
          this.saveToRedis({
              id: key,
              data: stats
            })
            .then((data) => console.log('added to redis: ' + data))
            .catch((error) => console.log(error));
          //imdb movie promise with details
          movie_detail_promises[key].then((details) => {
            //get this movies stats from redis
            this.getFromRedis(key).then((properties) => {
              //we are now merging the objects and saving to mongo and elasticsearch
              this.mediaObjectSave(properties, JSON.parse(details), callback);

            }).catch((error) => {
              if (error) console.log(error)
            });
          }).catch((error) => {
            if (error) console.log(error)
          });
        }).catch((error) => {
          if (error) console.log(error)
        });
      });
    }).catch((error) => {
      if (error) console.log(error)
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
        callback();
      }
      console.log('saved to mongo');
      media.on('es-indexed', function() {
        console.log('document indexed');
        callback();
        return media_obj;
      });
    });
  }

  /**
   * [getFileProperties description]
   * @param  {[array]} getFiles a promise that returns files array
   * @return {[array]}   returns file properties
   */
  getFileProperties(files) {
    let dir = '/home/allan/tv-engine/testData';
    //let dir = path.join(app_dir,'testData')
    let promises = {};
    files.forEach((file) => {
      let url = path.join(dir, file);
      promises[file.split('.')[0]] = new Promise(function(resolve, reject) {
        fs.stat(url, function(err, stats) {
          stats.location = url;
          resolve(stats);
          reject(err);
        });
      });
    });
    return promises;
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

  getMovieDetails(files) {
    let promises = {};
    files.forEach((file) => {
      let url = this.base_url + 't=' + file + '&plot=short&r=json';
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
