import chai from 'chai';
import tvEngine from '../src/controllers/saveMedia.js';
import config from '../src/config/config';
//import testData from './testData';
//import Media from '../src/models/media'
// import prettyjson from 'prettyjson';

const expect = chai.expect;

describe('querying data from mongoDb and elasticsearch', function() {
  this.timeout(20000);

  before(function(done) {
    config.dbOpen('test-media', function() {
      config.getEsClient(function() {
        try {
          tvEngine.saveData('testData', function() {
            console.log('finished adding all files');
            done();
          });
        } catch (e) {
          console.log(e);
        }
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

  it('should run', () => {
    expect(1).to.be.a('number');
  });
});
