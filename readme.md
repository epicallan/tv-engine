# tv-engine
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]

> Description
```npm run app``` will start a nodejs process that iterates through a movie or media
folder to retrieve movie data (poster image, actor etc) from a movie database
It will finally save the data in mongodb and elasticsearch.
```npm start``` will start an express server that has routes/api end points for serving movie data
to the client app [tv-chicken]: https://github.com/epicallan/tv-chicken  

## Installation

```
$ npm install
```

## Usage
```
  run npm run app to add media to database
  TODO move movies to the media folder if not in media folder;
  TODO autocreate images and testData folder if not available
  TODO figure out why webpack is not working
  TODO sci-fi genre needs to be worked on
  TODO utility that looks through a movie folder and gets the movie in it excluding samples
```
## Search

```
we are using elasticsearch for search, the search feature doesn't respect movie rating
the filter feature respects rating and its done by mongodb

```
## License
MIT © [Allan](http://github.com/epicallan)

[travis-url]: https://travis-ci.org/epicallan/tv-engine
[travis-image]: https://img.shields.io/travis/epicallan/tv-engine.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/epicallan/tv-engine
[coveralls-image]: https://img.shields.io/coveralls/epicallan/tv-engine.svg?style=flat-square

[depstat-url]: https://david-dm.org/epicallan/tv-engine
[depstat-image]: https://david-dm.org/epicallan/tv-engine.svg?style=flat-square
