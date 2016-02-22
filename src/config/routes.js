/**
 * Created by USER on 4/14/2015.
 */
'use strict';
// Load the module dependencies
import GetMedia from '../controllers/getMedia';
const controller = new GetMedia();
// Define the routes module' method
export default function(app) {
  app.route('/api/search').post(controller.getByName);
  app.route('/api/media').post(controller.getMediaData);
}
