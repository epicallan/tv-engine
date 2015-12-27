var webpack = require('webpack');
var path = require('path');
console.log('PATH is : '+path.resolve(__dirname, 'src'))
module.exports = {
  target: 'node',
  entry: './src/app.js',
  output: {
    path: './dist',
    filename: 'bundle.js',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      include: path.resolve(__dirname, 'src'),
      loader: 'babel',
      query: {
        presets: ['es2015', 'stage-0']
      }
    }]
  }
};
