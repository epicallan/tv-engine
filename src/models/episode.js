'use strict';

/**
 * Module dependencies.
 */

import uniqueValidator from 'mongoose-unique-validator';
import mongoose from 'mongoose';
import mongoosastic from 'mongoosastic';
const Schema = mongoose.Schema;

/**
 * Episode Schema
 */
 const EpisodeSchema = new Schema({
   title: { type : String,trim : true, unique: true,es_indexed:true,es_boost:4.0},
   year: { type : String, default : '', trim : true },
   released: { type : String, default : '', trim : true },
   runtime: { type : String, default : '', trim : true },
   type:{type:String},
   downloads:Number,
   link:String,
   createdAt:{ type : Date, default : Date.now },
   location:String,
   size:Number,
   blksize:Number,
   birthtime:String
 });


EpisodeSchema.plugin(mongoosastic);
EpisodeSchema.plugin(uniqueValidator);
/**
 * Validations
 */

EpisodeSchema.path('genre').required(true, 'Episode genre cannot be blank');
EpisodeSchema.path('actors').required(true, 'Episode Actors cannot be blank');
EpisodeSchema.path('title').required(true, 'Episode Title cannot be blank');
EpisodeSchema.path('location').required(true, 'Episode Location on disk cannot be null');

EpisodeSchema.pre('save', function(next) {
  const err = this.validateSync();
  if (err && err.toString()) throw new Error(err.toString());
  next(err);
});

//model names
const env = process.env.NODE_ENV || 'development';
const index = env == 'development' || 'test' ? 'Episode-test' : 'Episode';
console.log('index: '+ index);
const Episode = mongoose.model(index, EpisodeSchema);
//create index if none exists
Episode.createMapping(function(err, mapping) {
  if (err) {
    console.log('error creating mapping (you can safely ignore this)');
    console.log(err);
  } else {
    console.log('mapping created!');
    console.log(mapping);
  }
});

export default Episode;
