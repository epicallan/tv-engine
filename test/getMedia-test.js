import {
  expect as expect
}
from 'chai';
import path from 'path';
import getMedia from '../src/controllers/getMedia.js';
import tvEngine from '../src/controllers/saveMedia.js';



describe('Get data from database', () => {

  before((done) => {
    //check that data exist
    getMedia.media.count({}, function(err, count) {
      if (err) console.log(err);
      if (count < 5) {
        console.log('inserting new records into DB');
        const promises = tvEngine.saveMedia(path.resolve(__dirname, '../testData'));
        promises[0].then((data)=>{
          console.log('*************');
          console.log(data);
          done();
        });
        /*Promise.all(promises).then(function(data) {

          console.log(data);
        });*/
      }
    });

  });

  it('should search for data of specific type from elastic search', (done) => {
    getMedia.search('ant man').then((data) => {

      console.log(data);
      expect(data).to.be.an('object');
      done();
    }).catch((err) => {
      console.log(err);
    })

  });

});
