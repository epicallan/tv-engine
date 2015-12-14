// Invoke 'strict' JavaScript mode
'use strict';
// Load the module dependencies
import express from 'express';
import morgan from 'morgan';
import compress from 'compression';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import configs from './config'

// Define the Express configuration method
export default function() {
    //connect to mongoDb
    let db_name = 'tv-test'
    // Create a new Express application instance
    let app = express();
    // Use the 'NDOE_ENV' variable to activate the 'morgan' logger or 'compress' middleware
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else if (process.env.NODE_ENV === 'production') {
        db_name = 'tv';
        app.use(compress());
        app.set('trust proxy', 1); // trust first proxy //hack for not being over https
    }
    configs.dbOpen(db_name);
    // Use the 'body-parser' and 'method-override' middleware functions
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    // Load the routing files
    require('./routes.js')(app);
    // Configure static file serving TODO
    //app.use(express.static('./public'));
    // Return the Express application instance
    return app;
}
