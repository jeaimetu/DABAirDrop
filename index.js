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
	await myaccount.transfer(from, to, amount + " " + "TOOK",memo);
}

function initAirDrop(){
	console.log("starting init");
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		dbo.collection('snapshot1128b').updateMany({},{$set : {drop : "false"}}, function(err, res){
			if(err) throw err;
			console.log("initial complete");
			db.close();
		});		
	});
}


function getSum(){
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		dbo.collection('snapshot1128b').find({}).toArray((err,res)=>{
			if(err) throw err;
			var sum = 0;
			for(i = 0;i < res.length;i++)
			    sum += parseFloat(res[i].amount);
			db.close();
			console.log("total distribution ", sum);
		});		
	});
}

function deleteDuplicated(){
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		dbo.collection('snapshot1128b').deleteMany({_id : {$gte: ObjectId("5b99b86568135e0014d9fbde")}}, function(err, res){
		//dbo.collection('dexeos_airdrop').findOne({idx : 0}, function(err, res){
			if(err) throw err;
			console.log(err);
			console.log(res);
			console.log("delete complete");
			db.close();
		});		
	});
}


const airdrop = async() => {
	//console.log("do airdrop");
	const msg = "Congratulations to those who have received TOOKTOOK Snowdrop (Airdrop). TOOKTOOK is the 3(sec) Visual Message Platform based on blockchain. TOOKTOOK will be listed on CHAINCE(chaince.com) on Dec. 7, 2018. You can meet TOOKTOOK(tooktook.io) in Q1.2019."
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		const findQuery = { drop : "false" };
		dbo.collection('snapshot1128b').findOne(findQuery, function(err, res){
			if(res.length != 0){
				transfer2("taketooktook", res.account, res.amount, msg).then((output)=>{
					//update db to true
					const findQuery = {_id : ObjectId(res._id)};
					const myObj = {$set : {drop : "true"}};
					dbo.collection('snapshot1128b').updateOne(findQuery, myObj, function(err, resUpdate){
						console.log(".");
						setTimeout(airdrop, 30);
						db.close();
					});
				}).catch((err) =>{					
					const findQuery = {_id : ObjectId(res._id)};
					const myObj = {$set : {drop : "error"}};
					dbo.collection('snapshot1128b').updateOne(findQuery, myObj, function(err, resUpdate){
						console.log("trasnfer error", res.account);						
						setTimeout(airdrop, 30);
						db.close();
					});
				});
			}else{
				console.log("nothing remaining airdrop");
				db.close();
			}
		});
	});
}

//airdrop();
					       
initAirDrop();
//deleteDuplicated();
//getSum();

/*
    if(process.env.action == "false"){
	    console.log("do nothing");
        process.exit();
    }else{
	setTimeout(airdrop, 30);	
    }
    
    */

	







//register default listening port for heroku

var port = process.env.PORT || 5000;
console.log("port", port);
app.listen(port, function() {
	console.log("Listening on " + port);
});
