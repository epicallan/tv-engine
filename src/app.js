/**
 * run app
 * TODO use comander
 */
'use strict'

import tvEngine from './controllers/saveMedia'
import config from './config/config'
import path from 'path';

//connect to MongoDB
config.dbOpen('tv-test');

tvEngine.saveMedia(path.resolve(__dirname,'../testData'));
