/**
 * Created by USER on 4/14/2015.
 */
'use strict';
// Load the module dependencies
var controller = require('../src/controllers/getMedia');
// Define the routes module' method
module.exports = function(app) {
    app.route('/api/search').post(controller.search);
    app.route('/api/tag').post(controller.getByTag);
    app.route('/api/login').post(controller.getByNameAndTag);
};
