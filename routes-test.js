import {
  expect as expect
}
from 'chai';
import request from 'supertest';
import path from 'path';
import  '../server';
import tvEngine from '../src/controllers/saveMedia.js';



describe('Get data from database', () => {
  const url  = 'http://localhost:300';

  before(() => {
    //put data in database
    const promises = tvEngine.saveMedia(path.resolve(__dirname, '../testData'));
    promises[0].then((data) => {
      console.log(data);
    }).catch((err) => {
      console.log(err)
    });

  });

  after(() => {
    //delete collection from database
    tvEngine.media.removeCollection();
    
  });

  it('should search for data of specific type from elastic search', (done) => {
    let payload = {
      query: 'frozen'
    }
    request(url)
      .post('/api/search')
      .set('Accept', 'application/json')
      .send(payload)
      .end(function(err, res) {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log(res);
        expect(res.body).to.be.an('object');
        done();
      });
  });

});
