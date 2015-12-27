import chai from 'chai';
import tvEngine from '../src/controllers/saveMedia.js';
import config from '../src/config/config';
import data from './testData';
//import Media from '../src/models/media'
//import prettyjson from 'prettyjson';

const expect = chai.expect;

describe.skip('redis save and get', () => {
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

describe('transforming data before save', function() {
  this.timeout(25000);
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
    tvEngine.dir = 'testData';
    let promises = tvEngine.getFileProperties(['ant man.txt', 'shrek.txt']);
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

  it.skip('should be able to save media image to disk', (done) => {
    //let image_path = '/home/allan/tv-engine/images/frozen.jpg';
    let media = {
      title: 'frozen',
      poster: 'http://ia.media-imdb.com/images/M/MV5BMTQ1MjQwMTE5OF5BMl5BanBnXkFtZTgwNjk3MTcyMDE@._V1_SX300.jpg'
    }
    tvEngine.downloadImage(media);
    tvEngine.on('downloadImage', (status) => {
      console.log(status);
      expect(status).to.be.a('number');
      done()
    });
  });

  it('should be able to get media genre from first tag ', () => {
    const tags = ['action', 'comedy']
    const genre = tvEngine.getMediaGenre(tags);
    expect(genre).to.equal(11);
  });

});
