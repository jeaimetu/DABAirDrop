var express = require('express');
var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

const app = express();

config = {
  chainId: "038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca", // 32 byte (64 char) hex string
  keyProvider: process.env.key, // WIF string or array of keys..
  httpEndpoint: 'http://193.93.219.219:8888',
  expireInSeconds: 60,
  broadcast: true,
  verbose: false, // API activity
  sign: true
}

eos = Eos(config);

async function transfer2(from, to, amount, memo){
	const myaccount = await eos.contract(from);
	await myaccount.transfer(from, to, amount + " " + "DAB",memo);
}

function initAirDrop(){
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		dbo.collection('snapshot0824').updateMany({},{$set : {drop : "false"}}, function(err, res){
			if(err) throw err;
			console.log("initial complete");
			db.close();
		});		
	});
}

const airdrop = async() => {
	console.log("do airdrop");
	const msg = "Dabble(https://dabble.cafe) is a social Dapp which rewards users for writings. You can trade DAB token at ********** ********** *****. This airdrop is supported by ********** ********** *******."
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		const findQuery = { drop : "false" };
		dbo.collection('snapshot0824').findOne(findquery, function(err, res){
			if(res.length != 0){
				transfer2("eoscafekorea", res.account, "1000.0000", msg).then((output)=>{
					//update db to true
					const findQuery = {_id : ObjectId(res._id)};
					const myObj = {$set : {drop : true}};
					dbo.collection('snapshot0824').updateOne(findQuery, myObj, function(err, resUpdate){
						console.log("airdrop completed for", res.account);
						db.close();
					});
				});					
			}else{
				console.log("nothing remaining airdrop");
			}
		});
	});
}
eos.transaction(tr => {
	  tr.buyrambytes({
    payer: 'eoscafekorea',
    receiver: 'eoscafekorea',
    bytes: 20000*1024
  })
});
	
//airdrop();
setInterval(airdrop, 30);						       
//initAirDrop();
	







//register default listening port for heroku

var port = process.env.PORT || 5000;
console.log("port", port);
app.listen(port, function() {
	console.log("Listening on " + port);
});
