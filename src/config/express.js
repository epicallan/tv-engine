// Invoke 'strict' JavaScript mode
'use strict';
// Load the module dependencies
import express from 'express';
import morgan from 'morgan';
import compress from 'compression';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import config from './config';
import routes from './routes';

// Define the Express configuration method
export default function app() {
  // Create a new Express application instance
  let app = express();
  // enabling cors
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    next();
  });
  // Use the 'NDOE_ENV' variable to activate the 'morgan' logger or 'compress' middleware
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else if (process.env.NODE_ENV === 'production') {
    app.use(morgan('dev'));
    app.use(compress());
    app.set('trust proxy', 1); // trust first proxy //hack for not being over https
  }
/*  app.use(cors({
    origin: 'http://localhost:8000',
    credentials: true
  }));*/
  // app.options('*', cors()); // include before other routes

  //connect to mongoDb
  config.dbOpen(config.db, () => {
    console.log('connected to DB');
  });
  // Use the 'body-parser' and 'method-override' middleware functions
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  // Load the routing files
  routes(app);
  app.listen(config.port);
  app.use(express.static('public'));
  // Log the server status to the console
  console.log(`Server running at http://localhost:${config.port}/`);
  // Return the Express application instanc
  return app;
}
