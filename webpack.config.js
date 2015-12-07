var webpack = require('webpack');
var path = require('path');

module.exports = {
  target: 'node',
  entry: './src/index.js',
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
      include: [
        path.resolve(__dirname, 'src')
      ],
      loader: 'babel',
      resolve: {
          extensions: ['', '.js']
      },
      query: {
        presets: ['es2015', 'stage-0']
      },
      plugins: ['transform-runtime']
    }]
  }
};
