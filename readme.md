# tv-engine
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]

> Description

## Installation

```
$ npm install --save tv-engine
```

## Usage
```js
  TODO autocreate images and testData folder if not available
  TODO figure out why webpack not working
  TODO utility that looks through a movie folder and gets the movie in it excluding samples
  var tvEngine = require('tv-engine');
```
## Search

```
we are using elasticsearch for search, the search feature doesnt respect movie rating
the filter feature respects rating and its done by mongodb

```

## API

### `tvEngine(data, [options])`
Description

#### Parameters
- **Array** `data`: An array of data
- **Object** `options`: An object containing the following fields:

#### Return
- **Array** - Result

## License
MIT © [Allan](http://github.com/epicallan)

[travis-url]: https://travis-ci.org/epicallan/tv-engine
[travis-image]: https://img.shields.io/travis/epicallan/tv-engine.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/epicallan/tv-engine
[coveralls-image]: https://img.shields.io/coveralls/epicallan/tv-engine.svg?style=flat-square

[depstat-url]: https://david-dm.org/epicallan/tv-engine
[depstat-image]: https://david-dm.org/epicallan/tv-engine.svg?style=flat-square
