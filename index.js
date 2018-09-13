var express = require('express');
var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

const Eos = require('eosjs');

const app = express();

//airdrop suspend


config = {
  chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906", // 32 byte (64 char) hex string
  keyProvider: process.env.key, // WIF string or array of keys..
  httpEndpoint: 'https://mainnet.eoscalgary.io',
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
		dbo.collection('dexeos_airdrop').updateMany({},{$set : {drop : "false"}}, function(err, res){
			if(err) throw err;
			console.log("initial complete");
			db.close();
		});		
	});
}

function deleteDuplicated(){
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		dbo.collection('dexeos_airdrop').deleteMany({"_id" : {"$gt": ObjectId("5b99b86568135e0014d9fbde")}}, function(err, res){
			if(err) throw err;
			console.log(err);
			console.log(res);
			console.log("delete complete");
			db.close();
		});		
	});
}


const airdrop = async() => {
	console.log("do airdrop");
	const msg = "Dabble X DEXEOS Airdrop Event reward. Please visit Dabble and DEXEOS. Staking your DAB and get more reward."
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		const findQuery = { drop : "false" };
		dbo.collection('dexeos_airdrop').findOne(findQuery, function(err, res){
			if(res.length != 0){
				transfer2("eoscafekorea", res.account, res.amount, msg).then((output)=>{
					//update db to true
					const findQuery = {_id : ObjectId(res._id)};
					const myObj = {$set : {drop : true}};
					dbo.collection('dexeos_airdrop').updateOne(findQuery, myObj, function(err, resUpdate){
						console.log("airdrop completed for", res.account);
						setTimeout(airdrop, 30);
						db.close();
					});
				}).catch((err) =>{
					console.log("trasnfer error", res.account);
					setTimeout(airdrop, 30);
					db.close();
				});
			}else{
				console.log("nothing remaining airdrop");
				db.close();
			}
		});
	});
}

//airdrop();
//setTimeout(airdrop, 30);						       
//initAirDrop();
deleteDuplicated();
	
	







//register default listening port for heroku

var port = process.env.PORT || 5000;
console.log("port", port);
app.listen(port, function() {
	console.log("Listening on " + port);
});
