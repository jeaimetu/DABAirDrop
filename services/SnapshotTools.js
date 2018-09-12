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
    //console.log("checkAccountVote", accountInfo, accountInfo.voter_info.producers.length, 
    //           accountInfo.voter_info.producers.length.proxy);
    //console.log("checkAccountVote", accountInfo);
    if(!accountInfo.voter_info)
        return false;
    if ( accountInfo.voter_info.proxy == "" && accountInfo.voter_info.producers.length == 0)
        return false;
    else
        return true;
};

const checkAccountVote2 = async(account) => {
    const accountInfo = await EOSTools.getAccount(account); // replace this to eostool?
    console.log("checkAccountVote", accountInfo, accountInfo.voter_info.producers.length, 
                accountInfo.voter_info.producers.length.proxy);
    if (accountInfo.voter_info.producers || typeof accountInfo.voter_info.producers.length.proxy === undefined)
        return false;
    else
        return true;
};



    const dbsync = async (tupled) => {
        console.log("in test async");
        const client = await MongoClient.connect(url);

        const db = client.db('heroku_23gbks9t');
        
        for(let i = 0; i < tupled.length; i++){
            //const isVote = await checkAccountVote(tupled[i].account);
            const isVote = false;
            //console.log("processing account", tupled[i].account, i, isVote);
            var amount = 0;
            if(isVote == true)
                amount = (2 * tupled[i].amount).toFixed(4);
            else
                amount = (1 * tupled[i].amount).toFixed(4);
        

            //finalResult.push({account : tupled[i].account, amount : amount});

             
            const myObj = {account : tupled[i].account, amount :  amount, idx : i};
            const res = await db.collection('dexeos_airdrop').insertOne(myObj);
            console.log("capturing", tupled[i].account, amount, i);
 
        }
        client.close();  
    };  

exports.test = async(tupled) => {
    let finalResult = [];
    console.log("in test");
    finalResult = await dbsync(tupled);
       
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
        if(i % 3 === 0 && tupled[i] != "") acc.push({account:tupled[i+1], amount:tupled[i+2]});
        //console.log("reduce : ", i, tupled[i]);
        return acc;
    }, []);    
    
    //after formatting, filter account who vote producers
    //console.log(tupled);
    return tupled;
    //test(tupled);

}
