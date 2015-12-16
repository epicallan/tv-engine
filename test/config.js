var elasticsearch = require('elasticsearch'),
  esClient = new elasticsearch.Client({
    host: 'localhost:9200',
    deadTimeout: 0,
    keepAlive: false
  }),
  async = require('async');

const INDEXING_TIMEOUT = process.env.INDEXING_TIMEOUT || 2000;
const BULK_ACTION_TIMEOUT = process.env.BULK_ACTION_TIMEOUT || 4000;


function deleteIndexIfExists(indexes, done) {
  async.forEach(indexes, function(index, cb) {
    esClient.indices.exists({
      index: index
    }, function(err, exists) {
      if (exists) {
        esClient.indices.delete({
          index: index
        }, cb);
      } else {
        cb();
      }
    });
  }, done);
}


module.exports = {
  mongoUrl: 'mongodb://localhost/test',
  INDEXING_TIMEOUT: INDEXING_TIMEOUT,
  BULK_ACTION_TIMEOUT: BULK_ACTION_TIMEOUT,
  deleteIndexIfExists: deleteIndexIfExists,
  getClient: function() {
    return esClient;
  },
  close: function() {
    esClient.close();
  }
};
