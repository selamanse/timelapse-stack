/*
* Timeline Timelapse Tool
* Purpose: Create timelapse with ffmpeg
* Author: Selamanse <selamanse@scheinfrei.info>
*
*/

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var config = require('config');
var log4js = require('log4js');
var moment = require('moment');
var fs = require('fs');

var now = moment();
var timeFormat = "YYYY-MM-DD HH:mm:ss";

var argv = require('yargs')
		.usage('Usage: $0 --start "YYYY-MM-DD HH:mm:ss" --stop "YYYY-MM-DD HH:mm:ss"')
    		.demand(['start', 'stop'])
    		.default('start', moment().subtract(1, 'minutes').format(timeFormat))
    		.default('stop', moment().format(timeFormat))
    		.argv;
   

var timeStart = moment(argv.start, timeFormat).unix();
var timeStop = moment(argv.stop, timeFormat).unix();

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
  
  	var tlQuery = {};

    tlQuery.unixtime = { '$gte': parseInt(timeStart), '$lte': parseInt(timeStop) };
    
    
    findDocuments(db, tlQuery, function(docs) {
    
    	var picPathsData = [];
    	
    	for (i = 0; i < docs.length; i++) { 
    		var tDoc = docs[i];
    		picPathsData.push("file '" + tDoc.fs_path + "'")    		
		}
		
		fs.writeFile('timelapse.txt', picPathsData.join("\r\n"), function (err) {
  			if (err) throw err;
  			console.log('It\'s saved!');
		});
    });
   

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
