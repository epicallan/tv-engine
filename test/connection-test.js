import {
  expect as expect
}
from 'chai';
import Media from '../src/models/media'
import prettyjson from 'prettyjson';
import mongoose from 'mongoose';
import config from '../src/config/config';
import data from './testData';

describe('connection tests', () => {
  before(function(done) {
    mongoose.connect('mongodb://localhost/test-media', function(err) {
      if (err) console.error(err);
      let media = new Media(data[1]);
      media.save(function(err) {
        if (err) {
          console.log(err);
          done();
        }
        media.on('es-indexed', function() {
          console.log('document indexed');
          done();
        });
      });


    });

  });

  after((done) => {
    config.removeCollection('media', () => {
      mongoose.disconnect();
      config.deleteIndexIfExists(['medias'], done);
    })
  });


  it('should be able to do a fuzzy search', (done) => {
    let query = {
        'fuzzy': {
          'title': 'gravity'
        }
      }
      //INDEXING_TIMEOUT
    setTimeout(() => {
      Media.search(query, function(err, results) {
        if (err) console.log(err);
        console.log(prettyjson.render(results));
        expect(results).to.be.an('object');
        done();
      });

    }, 1000)

  });

});
