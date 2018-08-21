const fs = require('fs');
const EOSTools = require('./EOSTools');

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
    if (accountInfo.voter_info.producers.length == 0 || accountInfo.voter_info.producers.length.proxy != null)
        return false;
    else
        return true;
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
    //for(i = 0; i < tupled.length; i++){
    for(i = 0; i < 1000; i++){
        const idx = i;
        checkAccountVote(tupled[idx].account).then(isVote=> {
        console.log("processing account", tupled[idx].account, idx, isVote);
        if(isVote == true)
            finalResult.push({account : tupled[idx].account, amount : tupled[idx].amount});
        });
    }

    //return tupled;
    return finalResult;
};

