'use strict';

/**
 * Module dependencies.
 */
//import path from 'path';
import uniqueValidator from 'mongoose-unique-validator';
import mongoose from 'mongoose';
import mongoosastic from 'mongoosastic';
const Schema = mongoose.Schema;


/**
 * Media Schema
 */

const MediaSchema = new Schema({
  title: {
    type: String, 'unique':true
  }
});




MediaSchema.plugin(mongoosastic);
MediaSchema.plugin(uniqueValidator);
/**
 * Validations
 */



//validation
//MediaSchema.path('genre').required(true, 'Media genre cannot be blank');
//MediaSchema.path('actors').required(true, 'Media Actors cannot be blank');
MediaSchema.path('title').required(true, 'Media Title cannot be blank');
//MediaSchema.path('location').required(true, 'Media Location on disk cannot be null');

MediaSchema.pre('save', function(next) {
  const err = this.validateSync();
  if (err && err.toString()) throw new Error(err.toString());
  next(err);
});

//enabling elastic search
const Media = mongoose.model('Media26', MediaSchema);
//create index if none exists
Media.createMapping(function(err, mapping) {
  if (err) {
    console.log('error creating mapping (you can safely ignore this)');
    console.log(err);
  } else {
    console.log('mapping created!');
    console.log(mapping);
  }
});

export default Media;
