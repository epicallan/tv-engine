import {
  expect as expect
}
from 'chai';
import Media from '../src/models/media'
import prettyjson from 'prettyjson';
import tvEngine from '../src/controllers/saveMedia'
import mongoose from 'mongoose';
import path from 'path';
import config from './config';


function testData(done) {
  try {
    tvEngine.saveMedia(path.resolve(__dirname, 'testData'), () => {
      done();
    });
  } catch (err) {
    console.log(err);
  }
}

describe('connection tests', () => {
  before(function(done) {
    mongoose.connect('mongodb://localhost/test-media', function(err) {
      if (err) {
        console.error(err);
      }
      testData(done)
    });

  });

  after((done) => {
    tvEngine.media.remove();
    mongoose.disconnect();
    done();
    config.deleteIndexIfExists(['media10s', 'books2', 'media11s', 'media15s','media13s','blogposts','media20','media21'], done)
  });


  it('should be able to do a fuzzy search', (done) => {
    let query = {
        'fuzzy': {
          'title': 'shrek'
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
    },1000);

  });

});
