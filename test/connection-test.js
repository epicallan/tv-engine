import {
  expect as expect
}
from 'chai';

var config = require('./config'),
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  mongoosastic = require('mongoosastic');

var BlogPostSchema = new Schema({
  title: {
    type: String,
    es_boost: 2.0
  },
  content: {
    type: String
  }
});

BlogPostSchema.plugin(mongoosastic);

var BlogPost = mongoose.model('BlogPost', BlogPostSchema, 'blogs');


describe('connection tests', () => {
  before(function(done) {
    mongoose.connect(config.mongoUrl, function(err) {
      if (err) {
        console.error(err);
      }
      var post = new BlogPost({
        title: 'trial ',
        content: 'allan develops'
      });
      post.save(function() {
        post.on('es-indexed', function() {
          console.log('document indexed');
          done();
        });
      });
    });

  });

  after((done) => {
    BlogPost.remove();
    mongoose.disconnect();
    done();
  });


  it('should be able to do a fuzzy search', (done) => {
    var query = {
      'fuzzy': {
        'title': 'trial'
      }
    }
    BlogPost.search(query, function(err, results) {
      console.log(results);
      expect(results).to.be.an('object');
      done();
    });
  });

});
