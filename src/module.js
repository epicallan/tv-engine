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
      let file_names = files.map(file => file.split('.')[0]);
      const movie_detail_promises = this.getMovieDetails(file_names);
      _.forIn(this.getFileProperties(files),(promise,key)=>{
        promise.then((stats)=>{
          this.saveToRedis({id:key,data:stats})
              .then((data)=>console.log(data))
              .catch((error)=>console.log(error));
           movie_detail_promises[key].then((details)=>{
            this.getFromRedis(key).then((properties)=>{
                let promise = new Promise((resolve,reject)=>{
                  let saved = this.mediaObjectSave(properties,JSON.parse(details));
                  resolve(saved);
                  reject('save error');
                }).then((data)=> console.log(data))
                  .catch((error)=>console.log(error));
                promises.push(promise);
                if (promises.length == files.length) return promises;
              }).catch((error)=>console.log(error));
          }).catch((error)=>console.log(error));
        }).catch((error)=>console.log(error));
      });
    }).catch((error)=>console.log(error));

  }

  saveToRedis(obj){
    return new Promise((resolve,reject)=>{
      this.client.HMSET(obj.id,obj.data,(err, res)=>{
        resolve(res);
        reject(err);
      });
    });
  }

  getFromRedis(key){
    return new Promise((resolve,reject)=>{
      this.client.hgetall(key,(err, obj) => {
        resolve(obj);
        reject(err);
      });
    });
  }

  mediaObjectSave(properties,imdb){
    try{
      let details = {};
      for (var prop in imdb) {
          let key = prop.lowerCaseFirstLetter();
          let value = imdb[prop];
          details[key] = value;
        }
      const media_obj = _.assign({},details,properties);
      //console.log(media_obj);
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
      promises[file] =  new Promise(function(resolve,reject){
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
