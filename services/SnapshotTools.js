const fs = require('fs');
const EOSTools = require('./EOSTools');


var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;


/***
 * Pulls CSV from file system at a given path
 * @param pathToCSV
 * @returns {Promise}
 */
exports.getCSV = (pathToCSV) => {
    return new Promise((resolve, reject) => {
        const stream = fs.readFile(pathToCSV, 'utf8', (err,data) => {
            if(err) return reject(err);
            resolve(data);
        });
    })
};


const checkAccountVote = async(account) => {
    const accountInfo = await EOSTools.getAccount(account); // replace this to eostool?
    console.log("checkAccountVote", accountInfo, accountInfo.voter_info.producers.length, 
                accountInfo.voter_info.producers.length.proxy);
    if (accountInfo.voter_info.producers.length == 0 || typeof accountInfo.voter_info.producers.length.proxy === undefined)
        return false;
    else
        return true;
};

const test = async(tupled) => {
    for(let i = 0; i < tupled.length; i++){
        const isVote = await checkAccountVote(tupled[i].account);
        console.log("processing account", tupled[i].account, i, isVote);
        if(isVote == true){
            finalResult.push({account : tupled[i].account, amount : tupled[i].amount});
            MongoClient.connect(url, (err, db) => {
                const dbo = db.db("heroku_23gbks9t");
                const myObj = {account : tupled[i].account, amount :  tupled[i].amount};
                dbo.collection('snapshot').insertOne(myObj,(err, res) => {
                    db.close();
                });
            });                
        }
    }
    //return tupled;
    return finalResult;
};

/***
 * Converts a .csv snapshot into an array of JSON objects in the format {account, amount}
 * @param csv
 * @returns {Array}
 */
exports.csvToJson = (csv) => {
    const arr = csv
        .replace(/["]/g, '')
        .replace(/\n/g,',')
        .split(',');

    let tupled = [];

    // Removing Ethereum and EOS keys
    arr.map(e => {
        if(e.indexOf('0x') !== 0 && e.indexOf('EOS') !== 0) tupled.push(e);
    });

    // Formatting to {account, amount}
    tupled = tupled.reduce((acc, e, i) => {
        if(i % 2 === 0) acc.push({account:e, amount:tupled[i+1]});
        return acc;
    }, []);    
    
    //after formatting, filter account who vote producers
    let finalResult = [];
    
    test(tupled);

}
