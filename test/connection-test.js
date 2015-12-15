import {
  expect as expect
}
from 'chai';
import Media from '../src/models/media'
import prettyjson from 'prettyjson';
var config = require('./config'),
  mongoose = require('mongoose'),
  _ = require('lodash');

String.prototype.lowerCaseFirstLetter = function() {
  return this.charAt(0).toLowerCase() + this.slice(1)
};

function getMediaGenre(genres) {
  //should be env virable
  let tags = ['comedy', 'animation', 'horror', 'crime', 'fantasy', 'romance', 'crime',
    'adventure', 'drama', 'action', 'sci-fi', 'family', 'thriller', 'war'
  ];
  let tag_index = null;
  //if the genre and tag arent an exact match we use a regular expression
  genres.forEach((genre) => {
    genre = genre.toLowerCase();
    genre = genre.trim();
    tags.forEach((tag, index) => {
      let tag_sub = tag.substring(0, 3);
      var regex = new RegExp('/^' + tag_sub + '.*$/');
      if (genre == tag) {
        tag_index = index;
      } else if (genre.match(regex)) {
        tag_index = index;
      }
    });
  });
  return tag_index;
}

function movieData() {
  let properties = {
    birthtime: ' Wed Dec 02 2015 12:10:46 GMT+0300',
    size: 121,
    blkSize: 2333,
    location: '/testData/antman.txt'
  }
  let imdb = {
    'Title': 'frozen',
    'Year': '2013',
    'Rated': 'PG',
    'Released': '27 Nov 2013',
    'Runtime': '102 min',
    'Genre': 'Animation, Adventure, Comedy',
    'Director': 'Chris Buck, Jennifer Lee',
    'Writer': 'Jennifer Lee (screenplay), Hans Christian Andersen (inspired by the story \'The Snow Queen\' by), Chris Buck (story), Jennifer Lee (story), Shane Morris (story), Dean Wellins (additional story)',
    'Actors': 'Kristen Bell, Idina Menzel, Jonathan Groff, Josh Gad',
    'Plot': 'When the newly crowned Queen Elsa accidentally uses her power to turn things into ice to curse her ' +
      ' home in infinite winter, her sister, Anna, teams up with a mountain man, his playful reindeer, and a snowman ' +
      'to change the weather condition.',
    'Language': 'English, Icelandic',
    'Country': 'USA',
    'Awards': 'Won 2 Oscars. Another 69 wins & 55 nominations.',
    'Poster': 'http://ia.media-imdb.com/images/M/MV5BMTQ1MjQwMTE5OF5BMl5BanBnXkFtZTgwNjk3MTcyMDE@._V1_SX300.jpg',
    'Metascore': '74',
    'imdbRating': '7.6',
    'imdbVotes': '378,442',
    'imdbID': 'tt2294629',
    'Type': 'testType',
    'Response': 'True'
  }
  const details = processMediaDetails(imdb);

  return _.assign({}, details, properties);
}

function processMediaDetails(imdb) {
  let details = {};
  for (var prop in imdb) {
    let key = prop.lowerCaseFirstLetter();
    let value = imdb[prop];
    details[key] = value;
  }
  //casting to number
  details.imdbRating = ~~details.imdbRating;
  //converting to array
  //console.log(prettyjson.render(details));
  if (details.actors !== undefined) details.actors = details.actors.split(',');
  //if (details.director !== undefined) details.director = details.diretor.split(',');
  if (details.genre !== undefined) {
    let tags = details.genre.split(',');
    details.genre = 2;
    details.tags = tags
  }
  if (details.writer) details.writer = details.writer.split(',');
  //console.log(prettyjson.render(details));
  return details;
}

describe('connection tests', () => {
  before(function(done) {
    mongoose.connect(config.mongoUrl, function(err) {
      if (err) {
        console.error(err);
      }
      var post = new Media({
        title: 'frozen',
        content: 'movie media test'
      })
      post.save(function() {
        post.on('es-indexed', function() {
          console.log('document indexed');
          done();
        });
      });
    });

  });

  after((done) => {
    Media.remove();
    mongoose.disconnect();
    done();
  });


  it('should be able to do a fuzzy search', (done) => {
    let query = {
      'fuzzy': {
        'title': 'frozen'
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
