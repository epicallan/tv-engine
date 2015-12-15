import {
  expect as expect
}
from 'chai';
import Media from '../src/models/media'
import prettyjson from 'prettyjson';
import mongoose from 'mongoose';
import config from './config';


/*function testData(done) {
  try {
    tvEngine.saveMedia(path.resolve(__dirname, 'testData'), () => {
      done();
    });
  } catch (err) {
    console.log(err);
  }
}*/

describe('connection tests', () => {
  before(function(done) {
    mongoose.connect('mongodb://localhost/test-media', function(err) {
      if (err) console.error(err);
      let media = new Media({
        title: 'mmda'
      });
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
    Media.remove();
    mongoose.disconnect();
    config.deleteIndexIfExists(['media22s','media21s','media25s','media23s'], done);
  });


  it('should be able to do a fuzzy search', (done) => {
    let query = {
        'fuzzy': {
          'title': 'allan'
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

    },1000)

  });

});
