var express = require('express');
var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

const app = express();


function initAirDrop(){
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		dbo.collection('snapshot0824').updateMany({},{$set : {drop : "false"}}, function(err, db){
			if(err) throw err;
			console.log("initial complete");
			db.close();
		});		
	});
}

const airdrop = async() => {
	console.log("do airdrop");
}

airdrop();
initAirDrop();
	







//register default listening port for heroku

var port = process.env.PORT || 5000;
console.log("port", port);
app.listen(port, function() {
	console.log("Listening on " + port);
});
