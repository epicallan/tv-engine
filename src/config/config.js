 // Invoke 'strict' JavaScript mode
 'use strict';
 /**
  * TODO should offer various configs depending on env variables
  */
 import mongoose from 'mongoose';

 class configs {
   constructor() {
     this.connection = null;
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
   removeCollection(collection) {
     mongoose.connection.db.dropCollection(collection, function(err, result) {
       if (err) throw err;
       console.log(result);
     });
   }

 }
 export default new configs();
