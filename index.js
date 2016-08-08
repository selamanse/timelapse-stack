/*
* Timeline Backend Service
* Purpose: Storing Pictures to Cassandra and Serve them
* Author: Selamanse <selamanse@scheinfrei.info>
* Revision: 2016-04-20
*
*/

var cassandra = require('cassandra-driver');
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

const dbClient = new cassandra.Client({ contactPoints: [appDb.host], keyspace: appDb.keyspace});


// Connection URL 
logger.debug("connecting to " + url);
// Use connect method to connect to the Server 
dbClient.connect(function(err, db) {
  assert.equal(null, err);
  logger.info("Connected correctly to " + appDb.host + "/" + appDb.keyspace);
    
  //create application
  var timeline = express();
  
  timeline.get('/', function (req, res) {
    res.send("timelapse-stack service")    
  })
    
  timeline.get('/getEvents', function (req, res) {
  
  	var tlQuery = {};
  	
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
    
    
    tlData.events = [];


    dbClient.eachRow('SELECT * from ' + appDb.keyspace + '.' + appDb.table + 
    				' WHERE unixtime >= ' + parseInt(req.query.min) + 
    				' AND unixtime <= ' + parseInt(req.query.max) + ';',
  					function(n, row) {
  					
    		var event = {
                start_date:{
                    year: row.year,
                    month: row.month,
                    day: row.day,
                    hour: row.hour,
                    minute: row.minute,
                    second: row.second
                },
                media: {
                  url: "images/" + row.idx_path_medium,
                  caption: '<a href="images/' + row.idx_path + '">' +  row.date + ' ' + row.time + '</a>'
                },
                text: row.date + " " + row.time
            }
    		
    		tlData.events.push(event);
    
  			},
  			function (err) {
    			if(err){
    				console.log
    			}
  			}
	);
	
        
	res.json(tlData);
        
  })
  
  
  timeline.get('/add', function (req, res) {
    
    if (!req.query.unixtime) {
        res.send("cannot add, missing time param");
    }else{
        var qry = req.query;
        qry.unixtime = parseInt(req.query.unixtime);
        
        res.send("adding:" + qry);
        
        const updateQry = 'UPDATE' + appDb.keyspace + '.' + appDb.table + 
				' SET date=?,day=?,fs_path=?,idx_path=?,idx_path_medium=?,idx_path_small=?,hour=?,
minute=?,month=?,second=?,time=?,tz=?,week=?,year=? WHERE device=? AND capturetime=?;'; 

		const params = [qry.date,
qry.day,qry.fs_path,qry.idx_path,qry.idx_path_medium,qry.idx_path_small,qry.hour,qry.minute,qry.month,qry.second,qry.time,qry.tz,qry.week,qry.year,qry.dev,qry.unixtime];

		client.execute(updateQry, params, { prepare: true }, function(err) {
  		if(err){
  			console.log(JSON.stringify(err));
 			return true;
  		}
  			console.log('Row updated on the cluster');
		});
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

