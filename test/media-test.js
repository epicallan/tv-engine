import {
  expect as expect
}
from 'chai';
import tvEngine from '../src/controllers/saveMedia.js';
import config from '../src/config/config';
import data from './testData';
import Media from '../src/models/media'
import prettyjson from 'prettyjson';

describe('redis save and get', () => {
  //save objects to redis
  before(() => {
    let props = {
      'size': 1000,
      'name': 'testMovie',
      'genre': 'action'
    };
    let obj = {
      id: 'test',
      data: props
    }
    tvEngine.saveToRedis(obj).then(function(res) {
      //console.log('redis test save: ' + res);
      expect(res).to.be.a('string');
      expect(res).to.not.be.empty;
    });
  });

  it('should get object from redis by key', () => {
    tvEngine.getFromRedis('test').then((res) => {
      console.log(res)
      expect(res).to.be.an('object');
      expect(res).to.not.be.empty;
    });
  });
});

describe('transforming data before save', () => {
  before(function(done) {
    config.dbOpen('test-media', () => {
      config.getEsClient(() => {
        tvEngine.mediaObjectSave(data[1], done);
      });
    });
  });

  after((done) => {
    config.removeCollection('media-tests', () => {
      config.deleteIndexIfExists('media-tests', () => {
        config.closeEsClient();
        config.dbClose();
        done();
      });
    });

  });

  it('should be able to access files in a provided folder', () => {
    const fileReader = tvEngine.getFiles('testData');
    fileReader.then(function(files) {
      //console.log(files)
      expect(files).to.not.be.empty;
    })
  });

  it('should return promise with properties of the movie files', () => {
    let promises = tvEngine.getFileProperties(['ant man.txt', 'shrek.txt'])
    promises['ant man'].then(function(data) {
      //console.log(data);
      expect(data).to.be.an('object');
      expect(data).to.not.be.empty;
    })

  });

  it('should return promises with movie details from IMDB', () => {
    let promises = tvEngine.getMovieDetails(['ant man', 'shrek', 'terminator']);
    promises['ant man'].then(function(data) {
      //console.log(data);
      expect(data).to.be.an('object');
      expect(data).to.not.be.empty;
    })
  });

  it('should be able to save media image to disk', () => {
    //let image_path = '/home/allan/tv-engine/images/frozen.jpg';
    let media = {
      poster: 'http://ia.media-imdb.com/images/M/MV5BMTQ1MjQwMTE5OF5BMl5BanBnXkFtZTgwNjk3MTcyMDE@._V1_SX300.jpg'
    }
    tvEngine.downloadImage(media).then((type) => {
      console.log(type);
      expect(type).to.be.a('string');
      expect(type).to.not.be.empty;
    });

  });

  it('should be able to get media genre from first tag ', () => {
    const tags = ['action', 'comedy']
    const genre = tvEngine.getMediaGenre(tags);
    expect(genre).to.equal(11);
  });

  it('should be able to do a fuzzy search', (done) => {
    let query = {
        'fuzzy': {
          'title': 'gravity'
        }
      }
      //time out waiting for elasticsearch indexing
    setTimeout(() => {
      Media.search(query, function(err, results) {
        if (err) console.log(err);
        console.log(prettyjson.render(results));
        expect(results).to.be.an('object');
        done();
      });

    }, 1000);
  });

});
