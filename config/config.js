 // Invoke 'strict' JavaScript mode
'use strict';

var mongoose = require('mongoose');

module.exports = {
  connect : function(){
    console.log('connecting to mongodb',function(err){
      if (err)console.error(err);
      console.log('connected.... unless you see an error the line before this!');
    });
    mongoose.connect('mongodb://localhost/tv');
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    }
};

