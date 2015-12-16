 // Invoke 'strict' JavaScript mode
 'use strict';
 /**
  * TODO should offer various configs depending on env variables
  */
 import mongoose from 'mongoose';
 import elasticsearch from 'elasticsearch';
 import async from 'async';

 class configs {
   constructor() {
     this.connection = null;
     this.esClient = new elasticsearch.Client({
       host: 'localhost:9200'
     });
   }

   getEsClient() {
     return this.esClient;
   }

   closeEsClient() {
     if (this.esClient) this.esClient.close();
   }

   deleteIndexIfExists(indexes, done) {
     async.forEach(indexes, (index, cb) => {
       this.esClient.indices.exists({
         index: index
       }, (err, exists) => {
         if (exists) {
           this.esClient.indices.delete({
             index: index
           }, cb);
         } else {
           cb();
         }
       });
     }, done);
   }

   dbOpen(db) {
     mongoose.connect('mongodb://localhost/' + db);
     this.connection = mongoose.connection;
     this.connection.on('error', (err) => {
       console.log(err);
     });
   }

   dbClose() {
       if (this.connection) {
         this.connection.close();
       } else {
         console.log('connection not available')
       }
     }
     /**
      * removeCollection
      * @return {[type]} [description]
      */
   removeCollection(collection,cb) {
     mongoose.connection.db.dropCollection(collection, function(err, result) {
       if (err) throw err;
       console.log(result);
       cb();
     });
   }

 }
 export default new configs();
