 // Invoke 'strict' JavaScript mode
 'use strict';
 /**
  * TODO should offer various configs depending on env variables
  */
 import mongoose from 'mongoose';
 import elasticsearch from 'elasticsearch';
 import settings from './settings'

 class configs {
   constructor() {
     this.connection = null;
     this.esClient = null;
     this.settings = settings;
     process.env.NODE_ENV = process.env.NODE_ENV || 'development'

   }

   getEsClient(callback) {
     this.esClient = new elasticsearch.Client({
       host: 'localhost:9200'
     });
     this.esClient.ping({
       requestTimeout: Infinity,
       hello: 'elasticsearch'
     }, function(error) {
       if (error) {
         console.trace('elasticsearch cluster is down!');
       } else {
         console.log('elasticsearch: All is well');
         callback()
       }
     });
     return this.esClient;
   }

   closeEsClient() {
     if (this.esClient) this.esClient.close();
   }

   deleteIndexIfExists(index, done) {
     this.esClient.indices.exists({
       index: index
     }, (err, exists) => {
       if (exists) {
         this.esClient.indices.delete({
           index: index
         }, done);
       } else {
         done();
       }
     });
   }

   dbOpen(db, callback) {
     mongoose.connect('mongodb://localhost/' + db, (err) => {
       if (err) {
         console.error(err);
         throw err;
       } else {
         console.log('connected to mongodb: ' + db)
         callback();
       }
     });
     this.connection = mongoose.connection;
   }

   dbClose() {
       if (this.connection) {
         mongoose.disconnect();
       } else {
         console.log('connection not available')
       }
     }
     /**
      * removeCollection
      * @return {[type]} [description]
      */
   removeCollection(collection, cb) {
     mongoose.connection.db.dropCollection(collection, function(err, result) {
       if (err) throw err;
       console.log(result);
       cb();
     });
   }

 }
 export default new configs();
