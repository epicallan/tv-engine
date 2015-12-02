var webpack = require('webpack');

module.exports = {
  target: 'node',
  entry: './src/module.js',
  output: {
    path: './dist',
    filename: 'module.js',
    libraryTarget: 'umd'
  },
  node: {
    console: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'stage-0']
      }
    }]
  }
};
