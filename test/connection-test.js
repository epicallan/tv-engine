import {
  expect as expect
}
from 'chai';
import Media from '../src/models/media'
import prettyjson from 'prettyjson';
import tvEngine from '../src/controllers/saveMedia'
import  mongoose from 'mongoose';
import path from 'path';


function testData(callback){
  tvEngine.saveMedia(path.resolve(__dirname,'testData'),()=>{
    console.log('indexed');
    callback();
  });
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
  });


  it('should be able to do a fuzzy search', (done) => {
    let query = {
      'fuzzy': {
        'title': 'shrk'
      }
    }
    Media.search(query, function(err, results) {
      if (err) console.log(err);
      console.log(prettyjson.render(results));
      expect(results).to.be.an('object');
      done();
    });
  });

});
