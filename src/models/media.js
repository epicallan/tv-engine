'use strict';

/**
 * Module dependencies.
 */
import path from 'path';
import uniqueValidator from 'mongoose-unique-validator';
import mongoose from 'mongoose';
/*import config from '../config/config'*/
import mongoosastic from 'mongoosastic';
const Schema = mongoose.Schema;


/**
 * Media Schema
 */

const MediaSchema = new Schema({
  title: {
    type: String,
    es_boost: 2.0
  },
  content: {
    type: String
  }
});


MediaSchema.plugin(mongoosastic);

const Media = mongoose.model('Media2', MediaSchema);
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
