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
import Media from '../models/media.js';

//log errors to file
function handleError(err){
  console.log(err);
}

export const getByNameAndTag = function(req,res){
  //TODO
  var query = {
    'fuzzy' : { 'title' : req.body.query}
  }
  Media.search(query, function(err, results) {
    res.json(results);
  });
};


export const getByTag = function(req,res){
  Media.
  find({
    genre:req.body.tag
  }).
  where('imdbRating').gte(req.body.rating).
  limit(24).
  sort({ imdbRating: 1 }).
  exec((err,docs)=>{
    if (err) return handleError(err);
    res.json(docs);
  });
};

export const search = function(req,res){
  var query = {
    'fuzzy' : { 'title' : req.body.query}
  }
  Media.search(query, function(err, results) {
    res.json(results);
  });
}
