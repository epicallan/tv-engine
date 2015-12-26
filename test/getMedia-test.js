import chai from 'chai';
import tvEngine from '../src/controllers/saveMedia';
import config from '../src/config/config';
import getMedia from '../src/controllers/getMedia'
import prettyjson from 'prettyjson';
import elasticsearch from 'elasticsearch';
const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

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
      config.closeEsClient();
      config.dbClose();
      done();
      /*  config.deleteIndexIfExists('media-tests', () => {
          config.closeEsClient();
          config.dbClose();
          console.log('exited');
          done();
        });*/
    });
  });

  it('should get media of movie type from mongoDB', (done) => {
    getMedia._getFromMongoB(1, 2, 7).then((results) => {
      results.forEach((res) => {
        console.log(res.title);
      })
      expect(results).to.be.an('array');
      expect(results).to.have.length.above(0);
      done();
    });
  });

  it.skip('should use elasticsearch cl', (done) => {
    client.search({
      index: 'media-tests',
      type: 'media-test',
      body: {
        query: {
          'fuzzy_like_this': {
            'fields': ['title'],
            'like_text': 'home',
            'max_query_terms': 12
          }
        }

      }
    }).then(function(resp) {
      const hits = resp.hits.hits;
      console.log(hits);
      expect(hits).to.be.an('array');
      done();
    }, function(err) {
      console.trace(err.message);
    });
  });

  it('should be able to search by name from elasticsearch', (done) => {
    getMedia._search('titanic').then((data) => {
      console.log(prettyjson.render(data));
      expect(data).to.be.an('object');
      done();
    }).catch((err) => {
      if (err) console.error(err);
    });
  });
});
