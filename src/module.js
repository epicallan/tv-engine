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
import _  from 'lodash';
import path from 'path';
import request from 'request';
require('./models/Media');
const mongoose = require('mongoose');
const Media = mongoose.model('Media');
const assign = require('object-assign');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


class TvEngine{

  constructor(){
    this.base_url ='http://www.omdbapi.com/?';
    this.client = redis.createClient();
    this.client.on('error', function (err) {
      console.log('Error ' + err);
    });
  }
  /**
   * get media files
   * get file properties and add to db
   * @return {[type]} [description]
   */
  savetoMongoDb(){
    this.getFiles.then((files)=>{
      _.for(this.getFileProperties(files),(promise,key)=>{
        promise.then((stats)=>{
          this.saveToRedis({id:key,data:stats})
          this.getMovieDetails[key].then((details)=>{
            //get redis object and add to mongodb
           this.client.getAsync(key).then((properties)=>{
              console.log(properties);
              this.mediaObjectSave(properties,details)
            });
          });
        });
      });
    })
  }

  saveToRedis(obj){
    let key = obj.id;
    let data = [];
    //TODO some thing different for arrays
    _.for(obj.data,(value,key)=>{
      data.push(key+' '+value);
    });
    this.client.hmset(key+','+JSON.stringfy(data),(err, res)=>{
      err? console.log(err):  console.log(res);
    });
  }



  mediaObjectSave(properties,imdb_details){
    var media_obj = assign({},imdb_details,properties);
    console.log(media_obj);
    const media = new Media(media_obj).validateAndSave();
    media.downloadSaveImage();
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
      console.log(url)
      promises[file] = new Promise(function(resolve,reject){
         fs.stat(url,function(err,stats){
          //save to mongodb
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
            //save in mongodb
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
/*tvEngine.getFiles('../testData');*/
export default tvEngine;
