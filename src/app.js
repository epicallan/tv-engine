/**
 * run app
 * TODO use comander
 */
'use strict'

import tvEngine from './controllers/saveMedia'
import config from './config/config'
import path from 'path';

const PUBLIC_PATH = path.resolve(__dirname, `../${config.MEDIA_FOLDER}`);

config.dbOpen(config.db, function() {
  config.getEsClient(function() {
    try {
      tvEngine.saveData(PUBLIC_PATH, function() {
        console.log('finished adding all files');
      });
    } catch (e) {
      console.log(e);
    }
  });
});
