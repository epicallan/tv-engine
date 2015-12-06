import { expect as expect } from 'chai';
import tvEngine from '../src/module.js';
import {download} from '../src/models/media.js';

describe('tvEngine unit tests', () => {
  it('should be able to access a files in a provided folder', () => {
    const fileReader = tvEngine.getFiles('testData');
    fileReader.then(function(files){
      //console.log(files)
      expect(files).to.not.be.empty;
    })
  });

  it('should return promise with properties of the movie files',()=>{
    let promises = tvEngine.getFileProperties(['ant man.txt','shrek.txt'])
    promises['ant man'].then(function(data){
      //console.log(data);
      expect(data).to.be.an('object');
      expect(data).to.not.be.empty;
    })

  });

  it('should return promises with movie details from IMDB',() =>{
    let promises = tvEngine.getMovieDetails(['ant man','shrek','terminator']);
    promises['ant man'].then(function(data){
      //console.log(data);
      expect(data).to.be.an('object');
      expect(data).to.not.be.empty;
    })
  });

  it('should be able to save media image to disk',()=>{
    let image_path = '/home/allan/tv-engine/images/frozen.jpg';
    let url = 'http://ia.media-imdb.com/images/M/MV5BMTQ1MjQwMTE5OF5BMl5BanBnXkFtZTgwNjk3MTcyMDE@._V1_SX300.jpg';
    download(url,image_path).then((path)=>{
      expect(path).to.be.a('string');
      expect(path).to.not.be.empty;
    });

  });

  it('should be able to save to mongoDB',()=>{
    let properties = {
      birthtime:' Wed Dec 02 2015 12:10:46 GMT+0300',
      size:121,
      blkSize:2333,
      location:'/testData/antman.txt'
      }
    let imdb_details ={'Title':'Frozen','Year':'2013','Rated':'PG','Released':'27 Nov 2013',
    'Runtime':'102 min','Genre':'Animation, Adventure, Comedy','Director':'Chris Buck, Jennifer Lee',
    'Writer':'Jennifer Lee (screenplay), Hans Christian Andersen (inspired by the story \'The Snow Queen\' by), Chris Buck (story), Jennifer Lee (story), Shane Morris (story), Dean Wellins (additional story)',
    'Actors':'Kristen Bell, Idina Menzel, Jonathan Groff, Josh Gad',
    'Plot':'When the newly crowned Queen Elsa accidentally uses her power to turn things into ice to curse her '+
    ' home in infinite winter, her sister, Anna, teams up with a mountain man, his playful reindeer, and a snowman '+
    'to change the weather condition.',
    'Language':'English, Icelandic','Country':'USA','Awards':'Won 2 Oscars. Another 69 wins & 55 nominations.',
    'Poster':'http://ia.media-imdb.com/images/M/MV5BMTQ1MjQwMTE5OF5BMl5BanBnXkFtZTgwNjk3MTcyMDE@._V1_SX300.jpg',
    'Metascore':'74','imdbRating':'7.6',
    'imdbVotes':'378,442','imdbID':'tt2294629','Type':'movie','Response':'True'}
    let saved = tvEngine.mediaObjectSave(properties,imdb_details);
    expect(saved).to.not.be.empty;
  });

  it('should be able to save file properties to redis',()=>{
    let props ={
      'size':1000,
      'name':'antman',
      'genre':'action'
    };
    let obj = {id:'antman',data:props}
    tvEngine.saveToRedis(obj).then(function(res){
      console.log(res);
      expect(res).to.be.a('string');
      expect(res).to.not.be.empty;
    })

  });
});

/**
 * TODO this test is not comprehensive
 */
describe('tvEngine integration test',()=>{
  it('should be able to get files from folder and save to db',()=>{
    const promises = tvEngine.saveMedia('../testData')
    Promise.all(promises).then(function(objs){
      expect(objs).to.be.an('object');
      expect(objs).to.not.be.empty;
    });
  });
});
