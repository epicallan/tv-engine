/**
 * Created by USER on 4/14/2015.
 */
'use strict';
// Load the module dependencies
var controller = require('../src/controllers/getMedia');
// Define the routes module' method
module.exports = function(app) {
    app.route('/api/search').post(controller.getByNameAndType);
    app.route('/api/search-by-tag').post(controller.getByNameTagAndType);
    app.route('/api/media').post(controller.getByTagAndType);
};
