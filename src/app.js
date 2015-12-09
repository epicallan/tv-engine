/**
 * run app
 * TODO use comander
 */
'use strict'

import tvEngine from './controllers/saveMedia.js'
import config from '../config/config.js'
import path from 'path';

//connect to MongoDB
config.connect();

tvEngine.saveMedia(path.resolve(__dirname,'../testData'));

