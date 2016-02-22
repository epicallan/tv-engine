// Invoke 'strict' JavaScript mode
'use strict';
var app = require('./dist/config/express').default() ;

// Set the 'NODE_ENV' variable
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


// Use the module.exports property to expose our Express application instance for external usage
module.export = app;
