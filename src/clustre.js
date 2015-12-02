'use strict'
var os  = require('os');
var cluster =  require('cluster');
var _ = require('lodash');

const num_cpus = os.cpus().length;


function createWorkers(){
    var clusters = [];
    if (cluster.isMaster) {
      // Fork workers.
      for (var i = 0; i < num_cpus; i++) {
        clusters[i] = cluster.fork();
        console.log('clustre id : '+clusters[i].process.pid);
      }
      cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died: '+ signal);
      });
    }
    return clusters;
}

function workOnFiles(files,clusters){
    //split into chacks by number of cpus
    let promises = [];
    const chunks= _.chunk(files,num_cpus)
    //const clusters = this.clusters;
    chunks.forEach((chunk,index) =>{

      let promise = new Promise((resolve,reject)=>{

        clusters[index].on('listening',(worker,address)=>{
          //add up all the values in this chunk
          let new_val = _.reduce(chunk,(total,n)=>{ return total + n*55000});
          console.log('value : '+new_val + ' from: '+clusters[index].process.pid);
          console.log(worker.id+ '--' +address);
          resolve(new_val);
          reject('unknown error');
          return new_val;
        });

      });

      promises.push(promise);

    });

    return promises;
  }

var promises = workOnFiles([221,3231,3423,342,1,323,1231,1231,13,131,2313,131],createWorkers());
promises.forEach((promise)=>{
    promise.then((data)=>{
        console.log('promise: '+ data);
    });
 });
