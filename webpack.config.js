var webpack = require('webpack');


module.exports = {
  target: 'node',
  entry: './src/index.js',
  output: {
    path: './dist',
    filename: 'bundle.js',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel',
      resolve: {
          extensions: ['.js']
      },
      query: {
        presets: ['es2015', 'stage-0']
      },
      plugins: ['transform-runtime']
    }]
  }
};
