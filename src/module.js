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
//import redis from 'redis'
//import bluebird from 'bluebird';
import PropertiesReader from 'properties-reader';
//import _  from 'lodash';
import path from 'path';
var request = require('request');


class TvEngine{

  constructor(){
    this.base_url ='http://www.omdbapi.com/?';
  }
  /**
   * get media files
   * get file properties and add to db
   * @return {[type]} [description]
   */
  savetoMongoDb(){
    this.getFiles.then((files)=>{
      files.forEach((file)=>{
        //save to redis and then lets operate from there
      })
      this.getFileProperties(files).forEach((stats)=>{
        //save to Db
      });
      this.getMovieDetails(files).forEach((details)=>{
        //save to Db
      });
    })
  }

  mediaObjectModel(properties,imdb){
    return null;
  }

  /**
   * [getFileProperties description]
   * @param  {[array]} getFiles a promise that returns files array
   * @return {[array]}   returns file properties
   */
  getFileProperties(files){
    let dir = '/home/allan/tv-engine/testData';
    //let dir = path.join(app_dir,'testData')
    var promises = [];
    files.forEach((file)=>{
      let url = path.join(dir,file);
      console.log(url)
      let promise = new Promise(function(resolve,reject){
         fs.stat(url,function(err,stats){
          //save to mongodb
          resolve(stats);
          reject(err);
        });
      });
      promises.push(promise);
    });
    return promises;
  }

  getMovieDetails(files){
    let promises = [];
    files.forEach((file) => {
      let url = this.base_url+'t='+file+'&plot=short&r=json';
      let promise =  new Promise(function(resolve,reject){
         request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            //save in mongodb
            resolve(body);
          }else{
            reject(error)
          }
        });
      });
      promises.push(promise);
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
