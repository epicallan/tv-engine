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
//import os from 'os';
import redis from 'redis'
import bluebird from 'bluebird';
import _ from 'lodash';
import path from 'path';
import request from 'request';
//import prettyjson from 'prettyjson';
import Media from '../models/media.js';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

String.prototype.lowerCaseFirstLetter = function() {
  return this.charAt(0).toLowerCase() + this.slice(1)
};


class TvEngineSaveMedia {

  constructor() {
    this.media = Media;
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
  saveMedia(folder) {
    const promises = [];
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
            .then((data) => console.log(data))
            .catch((error) => console.log(error));
          //imdb movie promise with details
          movie_detail_promises[key].then((details) => {
            //get this movies stats from redis
            this.getFromRedis(key).then((properties) => {
              //we are now merging the objects and saving to mongo and elasticsearch
              let promise = new Promise((resolve, reject) => {
                let saved = this.mediaObjectSave(properties, JSON.parse(details));
                resolve(saved);
                reject('save error');
                promises.push(promise);
              });
              if (promises.length == files.length) {
                console.log('finished write');
                return promises;
              }
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

  mediaObjectSave(properties, imdb) {
    try {

      //corece imdb rating to number
      const details = this.processMediaDetails(imdb);
      const media_obj = _.assign({}, details, properties);
      let media = new Media(media_obj);
      media.downloadSaveImage(this.download);
      return media.validateAndSave();
    } catch (error) {
      console.log(error);
    }

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
    //casting to number
    details.imdbRating = ~~details.imdbRating;
    //converting to array
    //console.log(prettyjson.render(details));
    if (details.actors !== undefined) details.actors = details.actors.split(',');
    if (details.diretor !== undefined) details.director = details.diretors.split(',');
    if (details.genre !== undefined) {
      let tags = details.genre.split(',');
      details.genre = this.getMediaGenre(tags);
      details.tags = tags
    }
    if (details.writer) details.writer = details.writer.split(',');
    //console.log(prettyjson.render(details));
    return details;
  }

  getMediaGenre(genres) {
    //should be env virable
    let tags = ['comedy', 'animation', 'horror', 'crime', 'fantasy', 'romance', 'crime',
      'adventure', 'drama', 'action', 'sci-fi', 'family', 'thriller', 'war'
    ];
    let tag_index = null;
    //if the genre and tag arent an exact match we use a regular expression
    genres.forEach((genre) => {
      genre = genre.toLowerCase();
      genre = genre.trim();
      tags.forEach((tag, index) => {
        let tag_sub = tag.substring(0, 3);
        var regex = new RegExp('/^' + tag_sub + '.*$/');
        if (genre == tag) {
          tag_index = index;
        } else if (genre.match(regex)) {
          tag_index = index;
        }
      });
    });
    return tag_index;
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

  download(image_url, image_path) {
    return new Promise((resolve, reject) => {
      request
        .get(image_url)
        .on('response', (response) => {
          resolve(response.headers['content-type']);
        })
        .on('error', function(err) {
          reject(err);
          throw new Error(err.toString);
        })
        .pipe(fs.createWriteStream(image_path));
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
export default new TvEngineSaveMedia();
