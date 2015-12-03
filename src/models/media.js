'use strict';

/**
 * Module dependencies.
 */
import request from 'request';
import fs from 'fs';
import path from 'path';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;


/**
 * Media Schema
 */

const MediaSchema = new Schema({
  title: { type : String, default : '', trim : true },
  description: { type : String, default : '', trim : true },
  tags: { type: []},
  downloads:Number,
  link:String,
  image: {
    cdnUri: String,
    file: String
  },
  createdAt  : { type : Date, default : Date.now }
});

/**
 * Validations
 */

MediaSchema.path('title').required(true, 'Media title cannot be blank');
MediaSchema.path('tags').required(true, 'Media tags cannot be blank');

/**
 * Pre-remove hook
 */

MediaSchema.pre('remove', function (next) {
  // delete image from disk
  // ask for admin password
  next();
});

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
    const err = this.validateSync();
    if (err && err.toString()) throw new Error(err.toString());
    return this.save();
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
    let image_path = path('../images',this.name,'.png')
    request
    .get(this.image_url)
    .on('response',() => {this.image.file = image_path})
    .on('error', function(err) {
      console.log(err)
    })
    .pipe(fs.createWriteStream(image_path));
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

mongoose.model('Media', MediaSchema);
