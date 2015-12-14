// Invoke 'strict' JavaScript mode
'use strict';
import express from './config/express';

// Set the 'NODE_ENV' variable
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Create a new Express application instance
var app = express();

// Use the Express application instance to listen to the '3000' port
app.listen(3000);

// Log the server status to the console
console.log('Server running at http://localhost:3000/');

// Use the module.exports property to expose our Express application instance for external usage
export default app;
