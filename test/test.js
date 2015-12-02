import { expect as expect } from 'chai';
import tvEngine from '../src/module.js';

describe('tvEngine', () => {

  it('should be able to access a files in a provided folder', () => {
    const fileReader = tvEngine.getFiles('testData');
    fileReader.then(function(files){
      console.log(files)
      expect(files).to.not.be.empty;
    })
  });

  it('should return properties of the movie files',()=>{
    let promises = tvEngine.getFileProperties(['ant man.txt','shrek.txt'])
    promises.forEach(function(promise){
      promise.then(function(data){
        //console.log(data);
        expect(data).to.be.an('object');
        expect(data).to.not.be.empty;
      })
    });
  });

  it('should return promises with movie details from IMDB',() =>{
    let promises = tvEngine.getMovieDetails(['ant man','shrek','terminator']);
    promises.forEach(function(promise){
      promise.then(function(data){
        //console.log(data);
        expect(data).to.be.an('object');
        expect(data).to.not.be.empty;
      })
    });
  });


});
