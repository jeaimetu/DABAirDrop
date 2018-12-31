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
	const options = { authorization: [ `thebeantoekn@active` ] };
	await myaccount.transfer(from, to, amount + " " + "BEAN",memo, options);
}

function initAirDrop(){
	console.log("starting init");
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		dbo.collection('skyhook1226a').updateMany({},{$set : {drop : "false", claim : "false"}}, function(err, res){
			if(err) throw err;
			console.log("initial complete");
			db.close();
		});		
	});
}

function initAirDrop2(){
	console.log("starting init");
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		for(idx=0;idx<=5773;idx++){
		dbo.collection('skyhook1226a').updateOne({"idx" : idx},{$set : {drop : "true"}}, function(err, res){
			if(err) throw err;
			console.log("initial complete");
			db.close();
		});	
		}
	});
}

function initAirDrop3(){
	console.log("starting init");
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		for(idx=0;idx<=5773;idx++){
		dbo.collection('skyhook1226a').updateMany({"drop" : "error"},{$set : {drop : "false"}}, function(err, res){
			if(err) throw err;
			console.log("initial complete");
			db.close();
		});	
		}
	});
}


function getSum(){
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		dbo.collection('skyhook1226a').find({}).toArray((err,res)=>{
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
		dbo.collection('skyhook1226a').deleteMany({_id : {$gte: ObjectId("5b99b86568135e0014d9fbde")}}, function(err, res){
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
	const msg = "Please visit https://eos.cafe and find exciting things. You can trade BEAN at Chaince. https://eos.cafe를 방문하여 흥미로운 것들을 찾아보십시오! Chaince에서 BEAN을 거래하실 수 있습니다. 请访问https://eos.cafe并找到令人兴奋的事情. 你可以在Chaince兑换BEAN."
	MongoClient.connect(url, (err, db) => {
		const dbo = db.db("heroku_23gbks9t");
		const findQuery = { drop : "false" };
		dbo.collection('skyhook1226a').findOne(findQuery, function(err, res){
			if(res.length != 0){
				transfer2("thebeantoken", res.account, res.amount, msg).then((output)=>{
					//update db to true
					const findQuery = {_id : ObjectId(res._id)};
					const myObj = {$set : {drop : "true"}};
					dbo.collection('skyhook1226a').updateOne(findQuery, myObj, function(err, resUpdate){
						console.log(".");
						setTimeout(airdrop, 30);
						db.close();
					});
				}).catch((err) =>{					
					const findQuery = {_id : ObjectId(res._id)};
					const myObj = {$set : {drop : "error"}};
					dbo.collection('skyhook1226a').updateOne(findQuery, myObj, function(err, resUpdate){
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
					       
//initAirDrop();
//deleteDuplicated();
//getSum();


    if(process.env.action == "false"){
	    console.log("do nothing");
        process.exit();
    }else{
	setTimeout(airdrop, 30);	
    }
    

    
    

	







//register default listening port for heroku

var port = process.env.PORT || 5000;
console.log("port", port);
app.listen(port, function() {
	console.log("Listening on " + port);
});
