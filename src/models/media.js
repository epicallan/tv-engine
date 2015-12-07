'use strict';

/**
 * Module dependencies.
 */
import request from 'request';
import fs from 'fs';
import path from 'path';
import uniqueValidator from 'mongoose-unique-validator';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;


/**
 * Media Schema
 */

const MediaSchema = new Schema({
  title: { type : String, default : '', trim : true, unique: true  },
  year: { type : String, default : '', trim : true },
  released: { type : String, default : '', trim : true },
  runtime: { type : String, default : '', trim : true },
  genre: { type : String, default : '', trim : true },
  director: { type : String, default : '', trim : true },
  writer: { type : String, default : '', trim : true },
  actors: { type : String, default : '', trim : true },
  plot: { type : String, default : '', trim : true },
  language: { type : String, default : '', trim : true },
  description: { type : String, default : '', trim : true },
  poster: { type : String, default : '', trim : true, unique: true  },
  image: { type : String, default : '', trim : true },
  imdbRating: { type : String, default : '', trim : true },
  type:String,
  downloads:Number,
  link:String,
  createdAt:{ type : Date, default : Date.now },
  location:String,
  size:Number,
  blksize:Number,
  birthtime:String
});

/**
 * Validations
 */
MediaSchema.plugin(uniqueValidator);
MediaSchema.path('title').required(true, 'Media Title cannot be blank');
MediaSchema.path('location').required(true, 'Media Location on disk cannot be null');

/**
 * Pre-remove hook
 */

MediaSchema.pre('remove', function (next) {
  // delete image from disk
  // ask for admin password
  next();
});

/**
 * private methods
 */
export function download(image_url,image_path){
  return new Promise((resolve,reject)=>{
      request
      .get(image_url)
      .on('response',(response) => {
        resolve(response.headers['content-type']);
      })
      .on('error', function(err) {
        reject(err);
        throw new Error(err.toString);
      })
      .pipe(fs.createWriteStream(image_path));
    });
}

/**
 * Methods
 */

MediaSchema.methods = {

  /**
   * Save Media
   *
   * @api private
   */
  validateAndSave: function () {
    try{
      const err = this.validateSync();
      if (err && err.toString()) throw new Error(err.toString());
      return this.save();
    }catch(error){
      console.log(error);
    }
  },
   /**
   * Find Media by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function (_id) {
    return this.findOne({ _id })
      .exec();
  },

  downloadSaveImage: function(){
    let dir = '/home/allan/tv-engine/images';
    let ext = path.extname(this.poster);
    let image_path = path.join(dir,this.title+ext);
    this.image = image_path;
    download(this.poster,image_path);
  },

  /**
   * List Medias
   *
   * @param {Object} options
   * @api private
   */

  list: function (options) {
    const criteria = options.criteria || {};
    const limit = options.limit || 30;
    return this.find(criteria)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
};

const Media = mongoose.model('Media', MediaSchema);

export default Media;
