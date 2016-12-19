/*
* Timeline Backend Service
* Purpose: Storing Pictures to MongoDb and Serve them
* Author: Selamanse <selamanse@scheinfrei.info>
*
*/

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var express = require('express');
var config = require('config');
var log4js = require('log4js');

var logger = log4js.getLogger();

logger.debug("Load App configuration");
var appSvc = config.get('app.service');
logger.debug(appSvc);

logger.debug("Load Database configuration");
var appDb = config.get('app.db');
logger.debug(appDb);

// Connection URL 
var url = 'mongodb://'+appDb.host+':'+appDb.port+'/'+appDb.name;
logger.debug("connecting to " + url);
// Use connect method to connect to the Server 
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  logger.info("Connected correctly to " + url);
    
  //create application
  var timeline = express();
  
  timeline.get('/', function (req, res) {
    findDocuments(db, {}, function(docs) {
          res.send(docs);
    });    
  })
    
  timeline.get('/getEvents', function (req, res) {
  
  	var tlQuery = {};
  	
  	tlQuery.idx_path = { '$exists': true };
  	tlQuery.idx_path_medium = { '$exists': true };
  	tlQuery.idx_path_small = { '$exists': true };
  	tlQuery.date = { '$exists': true };
  	tlQuery.time = { '$exists': true };
  	tlQuery.second = { '$exists': true };
    tlQuery.unixtime = { '$exists': true };
  	
  	if (!req.query.year && !req.query.max) {
  		var d = new Date();
        tlQuery.year = String(d.getFullYear());
    } else if(!req.query.max){
    	tlQuery.year = req.query.year;
    } else{
        if (!req.query.max) {
            req.query.max = req.query.min;
        }
        tlQuery.unixtime = { '$gte': parseInt(req.query.min), '$lte': parseInt(req.query.max) };
    }
    
    if (req.query.month) {
  		tlQuery.month = req.query.month;
    }
    
    if (req.query.day) {
  		tlQuery.day = req.query.day;
    }
    
    if (req.query.hour) {
  		tlQuery.hour = req.query.hour;
    }
    
    if (req.query.minute) {
  		tlQuery.minute = req.query.minute;
    }
    
    if (req.query.second) {
  		tlQuery.second = req.query.second;
    }
    
    findDocuments(db, tlQuery, function(docs) {
    
    	var tlData = {};
    	tlData.events = [];
    	
    	for (i = 0; i < docs.length; i++) { 
    		var tDoc = docs[i];
    		var event = {
                start_date:{
                    year: tDoc.year,
                    month: tDoc.month,
                    day: tDoc.day,
                    hour: tDoc.hour,
                    minute: tDoc.minute,
                    second: tDoc.second
                },
                media: {
                  url: "images/" + tDoc.idx_path_medium,
                  caption: '<a href="images/' + tDoc.idx_path + '">' +  tDoc.date + ' ' + tDoc.time + '</a>'
                },
                text: tDoc.date + " " + tDoc.time
            }
    		
    		tlData.events.push(event);
    		
		}
       	res.send(tlData);
    });
        
  })
  
  
  timeline.get('/add', function (req, res) {
    
    logger.debug(req.query)
    if (!req.query.unixtime) {
        res.send("cannot add, missing time param");
    }else{
        var qry = req.query;
        qry.unixtime = parseInt(req.query.unixtime);
        
        res.send("adding:" + qry);
        
        insertDocuments(db, qry);
    }
  })
   
  //listen port
  var listenport = appSvc.port;
  timeline.listen(listenport);
  logger.info("listening on port: " + listenport)

});

var findDocuments = function(db, query, callback) {
  // Get the documents collection 
  var collection = db.collection('timeline');
  // Find some documents 
  logger.debug("running query: ");
  logger.debug(query);
  collection.find(query).toArray(function(err, docs) {
    assert.equal(err, null);
    //assert.equal(2, docs.length);
    logger.debug("Found " + docs.length + " records");
    //console.dir(docs);
    callback(docs);
  });
}

var insertDocuments = function(db, params, callback) {
  // Get the documents collection 
  var collection = db.collection('timeline');
  // Insert some documents 
  collection.insert([
    params
  ], function(err, result) {
    assert.equal(err, null);
    //assert.equal(3, result.result.n);
    logger.debug("Inserted " + result.ops.length + " documents into the document collection");
    if (typeof callback == "function") {
       callback(result);
    }    
  });
}
