'use strict'
import Media from '../models/media.js';
import stringify from 'stringify';

//log errors to file
function handleError(error,res){
  console.log(stringify(error));
  res.status(500).json({ error: stringify(error) })
}

export const getByNameAndType = function(req,res){
  //TODO include type in search
  var query = {
    'fuzzy' : { 'title' : req.body.query}
  }
  Media.search(query, function(err, results) {
    res.json(results);
  });
};

export const getByNameTagAndType = function(req,res){
  //TODO include type in search
  var query = {
    'fuzzy' : { 'title' : req.body.query}
  }
  Media.search(query, function(err, results) {
    res.json(results);
  });
};


export const getByTagAndType = function(req,res){
  Media.
  find({
    genre:req.body.tag
  }).
  where('imdbRating').gte(req.body.rating).
  limit(24).
  sort({ imdbRating: 1 }).
  exec((err,docs)=>{
    if (err) return handleError(err,res);
    res.json(docs);
  });
};
