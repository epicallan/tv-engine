'use strict';

/**
 * Module dependencies.
 */

import uniqueValidator from 'mongoose-unique-validator';
import mongoose from 'mongoose';
import mongoosastic from 'mongoosastic';
const Schema = mongoose.Schema;

/**
 * Media Schema
 */
 const MediaSchema = new Schema({
   title: { type : String,trim : true, unique: true,es_indexed:true,es_boost:4.0},
   year: { type : String, default : '', trim : true },
   released: { type : String, default : '', trim : true },
   runtime: { type : String, default : '', trim : true },
   genre: { type : Number},
   tags:{type: [String], default:[], trim:true},
   director: { type : [String],default:[],es_indexed:true },
   writer: { type : [String], default :[]},
   actors: { type : [String],es_indexed:true,es_boost:2.0 },
   plot: { type : String, default : '', trim : true },
   language: { type : String, default : '', trim : true },
   description: { type : String, default : '', trim : true },
   poster: { type : String, default : '', trim : true, unique: true  },
   image: { type : String, default : '', trim : true },
   imdbRating: { type : Number, default : 0},
   type:{type:String},
   downloads:Number,
   link:String,
   createdAt:{ type : Date, default : Date.now },
   location:String,
   size:Number,
   blksize:Number,
   birthtime:String
 });


MediaSchema.plugin(mongoosastic);
MediaSchema.plugin(uniqueValidator);
/**
 * Validations
 */

MediaSchema.path('genre').required(true, 'Media genre cannot be blank');
MediaSchema.path('actors').required(true, 'Media Actors cannot be blank');
MediaSchema.path('title').required(true, 'Media Title cannot be blank');
MediaSchema.path('location').required(true, 'Media Location on disk cannot be null');

MediaSchema.pre('save', function(next) {
  const err = this.validateSync();
  if (err && err.toString()) throw new Error(err.toString());
  next(err);
});

//enabling elastic search
const Media = mongoose.model('Media', MediaSchema);
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
