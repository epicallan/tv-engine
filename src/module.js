/**
 * tvEngine
 * Description
 *
 * @name tvEngine
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
import Media from './models/media.js';
const mongoose = require('mongoose');
const assign = require('object-assign');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

String.prototype.lowerCaseFirstLetter = function(){return this.charAt(0).toLowerCase() + this.slice(1)};


class TvEngine{

  constructor(){
    this.base_url ='http://www.omdbapi.com/?';
    this.client = redis.createClient();
    this.client.on('error', function (err) {
      console.log('Error ' + err);
    });
    mongoose.connect('mongodb://localhost/tv');
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
  }

  /**
   * get media files
   * get file properties and then get imdb details
   * file properties temporarily saved to redis and then retrieved and joined to
   * the imdb object for saving to mmongodb
   * @return {[type]} [description]
   */
  saveMedia(folder){
    const promises = [];
    this.getFiles(folder).then((files)=>{
      _.forIn(this.getFileProperties(files),(promise,key)=>{
        promise.then((stats)=>{
          this.saveToRedis({id:key,data:stats})
          this.getMovieDetails[key].then((details)=>{
           this.client.getAsync(key).then((properties)=>{
              let promise = new Promise((resolve,reject)=>{
                let saved = this.mediaObjectSave(properties,details);
                resolve(saved);
                reject('error');
              });
              promises.push(promise);
              if (promises.length == files.length) return promises;
            });
          });
        });
      });
    })

  }

  saveToRedis(obj){
    return new Promise((resolve,reject)=>{
      this.client.HMSET(obj.id,obj.data,(err, res)=>{
        resolve(res);
        reject(err);
      });
    });
  }

  mediaObjectSave(properties,imdb){
    try{
      const details = {};
      _.forIn(imdb,(value,key) =>{
        details[key.lowerCaseFirstLetter()] = value
      });
      const media_obj = assign({},details,properties);
      let media =  new Media(media_obj);
      media.downloadSaveImage();
      return media.validateAndSave();
    }catch(error){
      console.log(error);
    }

  }

  /**
   * [getFileProperties description]
   * @param  {[array]} getFiles a promise that returns files array
   * @return {[array]}   returns file properties
   */
  getFileProperties(files){
    let dir = '/home/allan/tv-engine/testData';
    //let dir = path.join(app_dir,'testData')
    let promises = {};
    files.forEach((file)=>{
      let url = path.join(dir,file);
      promises[file.split('.')[0]] = new Promise(function(resolve,reject){
         fs.stat(url,function(err,stats){
          stats.location = url;
          resolve(stats);
          reject(err);
        });
      });
    });
    return promises;
  }

  getMovieDetails(files){
    let promises = {};
    files.forEach((file) => {
      let url = this.base_url+'t='+file+'&plot=short&r=json';
      promises[file.split('.')[0]] =  new Promise(function(resolve,reject){
         request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            resolve(body);
          }else{
            reject(error)
          }
        });
      });
    });
    return promises;
  }

  getFiles(folder_path){
    return new Promise(function(resolve,reject){
      fs.readdir(folder_path,function(err,files){
        err?reject(err):resolve(files);
      });
    });
  }

}

let tvEngine = new TvEngine();

export default tvEngine;
