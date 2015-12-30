/**
 * run app
 * TODO use comander
 */
'use strict'

import tvEngine from './controllers/saveMedia'
import config from './config/config'
import path from 'path';

const movie_file_path = path.resolve(__dirname, '../movies');

config.dbOpen(config.db, function() {
  config.getEsClient(function() {
    try {
      tvEngine.saveData(movie_file_path, function() {
        console.log('finished adding all files');
      });
    } catch (e) {
      console.log(e);
    }
  });
});
