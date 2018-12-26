var express = require('express');



const fs = require('fs');
const winston = require('winston');
const SnapshotTools = require('./services/SnapshotTools');
const Prompter = require('./services/Prompter');
const EOSTools = require('./services/EOSTools');
const app = express();

let config = {};
let blacklist = {};
let capWhitelist = {};
let logger = null;
let db = null;

const setup = () => {
    // Setting configs
    config = require('./config.json');
    blacklist = require('./blacklist.json');
    capWhitelist = require('./capWhitelist.json')

    // Creating the logs directory
    if (!fs.existsSync('logs')) fs.mkdirSync('logs');
    if (!fs.existsSync('db')) fs.mkdirSync('db');

    const low = require('lowdb');
    const FileSync = require('lowdb/adapters/FileSync');
    const adapter = new FileSync('db/airdrop.json');
    const _db = low(adapter);

    _db.defaults({ failed: [], success:[], lastAccountDropped:'' }).write();

    const logFormat = winston.format.printf(info =>
        `${(new Date()).toLocaleString()} - ${info.message}`);

    const _logger = winston.createLogger({
        format: logFormat,
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({
                filename: `logs/${+new Date()}_airdrop.log`,
                level: 'silly'
            })
        ]
    });

    logger = _logger;
    db = _db;
    EOSTools.setLogger(_logger);
    EOSTools.setDB(_db);
}

const filterLists = async (snapshot) => {
    console.log("in filterLists", snapshot);
    // removes blacklisted addresses, all the accounts added to blacklist.json file
    // will be filtered out of the snapshot
    const filteredSnapshot = blacklist && blacklist.accounts && blacklist.accounts.length > 0 ?
        snapshot.filter(tuple => {
            if(blacklist.accounts.indexOf(tuple.account) < 0) {
                return true;
            } else {
                logger.warn(`Account ${tuple.account} was blacklisted - Amount: ${tuple.amount}`);
                return false;
            }
        }) : snapshot;
/*
    if(filteredSnapshot.length != snapshot.length && await Prompter.prompt(
        `\r\nPress enter if you agree with above blacklist and want to continue (these accounts will be removed from the airdrop)`
    ) !== '') process.exit();
    */

    // apply limit cap ignoring the white listed addresses
    if(config.limitCap && config.limitCap > 0) {

        const cappedSnapshot = filteredSnapshot.map(tuple => {
            const isWhite = capWhitelist.accounts.indexOf(tuple.account) > 0;

            let amount = tuple.amount;
            if (!isWhite && amount > config.limitCap) {
                amount = config.limitCap;
                logger.warn(`Account ${tuple.account} was capped - it had ${tuple.amount} before being capped to ${amount}`);
            } else if (isWhite) {
                logger.warn(`Account ${tuple.account} is whitelist, therefore not capped - it has a total amount of ${tuple.amount}`);
            }

            return Object.assign({}, tuple, {amount})
        });

        if(filteredSnapshot.length != snapshot.length) {
            logger.warn(`You are limitting token holders to receive a max airdrop corresponding to ${config.limitCap} EOS`);

            //if (await Prompter.prompt(`\r\nPress enter if you agree with above addresses tokens airdrop cap and whitelisted ones`) !== '')
            //    process.exit()
        }

        return cappedSnapshot;

    } else {
        return filteredSnapshot;
    }

}


const run = async () => {
    const getRatio = (tuple) => (tuple.amount * config.ratio).toFixed(config.decimals);

    logger.warn(`Started EOSDrops at ${new Date().toLocaleString()}`);


    const asserter = (condition, msg) => {
        if(!condition){
            throw new Error(msg);
            process.exit();
        }
    };

    asserter(config.network !== '', 'Network must be a fully qualified URL ( example: http://domain.com:8888 )');
    asserter(config.tokenAccount !== '', 'Token account must not be empty');
    asserter(config.symbol !== '', 'Symbol must not be empty');
    asserter(config.privateKey !== '', 'Issuer\'s private key must not be empty');
    asserter(config.ratio > 0, 'Ratio can not be less than 0');
    asserter(config.batchSize > 0, 'Batch size must be greater than 0');

    await EOSTools.setNetwork(config.network);
    if (!await EOSTools.fillTokenStats(config)) {
        logger.error(`\r\nCould not find ${config.symbol} token on the eosio.token contract at ${config.tokenAccount}!`);
        process.exit();
    }
    


    if(process.env.action == "false"){
        console.log("do nothing");
        process.exit();
    }
    
    console.log("calling snapshot");
    const snapshot = await SnapshotTools.getCSV('20181224_account_snapshot.csv');
    console.log("calling filter");
    const initialAccountBalances = SnapshotTools.csvToJson(snapshot);
    
    for(k=1;k<=14;k++){
		fname = "./chintai20181225/" + "s" + k + ".json";
		console.log("calling chintai list", fname);
		chintai = require(fname);
		console.log("chintai length", chintai.length, chintai.rows.length);
	}
	process.exit();
		
    
    //adding chintai amount to initial list
    //chintai testing(S)
    console.log("calling chintai list");
    chintai = require('./chintai/s1.json');
    console.log("chintai length", chintai.length, chintai.rows.length);
    for(i = 0;i<chintai.rows.length;i++){
        console.log("chintai", chintai.rows[i].user, chintai.rows[i].quantity);
        let findflag = 0;
        for(j=0;j < initialAccountBalances.length;j++){
            findflag = 0;
            if(initialAccountBalances[j].account == chintai.rows[i].user){
                temp = chintai.rows[i].quantity.split(" ");
                initialAccountBalances[j].amount = parseFloat(initialAccountBalances[j].amount) + parseFloat(temp[0]);
                console.log("matched", chintai.rows[i].user, initialAccountBalances[j].amount);
                findflag = 1;
                break;
            }
        }
        if(findflag == 0)
              console.log("can not find", chintai.rows[i].user);
    }
    //chintai testing (E)
    
        //chintai testing(S)
    console.log("calling chintai list");
    chintai = require('./chintai/s2.json');
    console.log("chintai length", chintai.length, chintai.rows.length);
    for(i = 0;i<chintai.rows.length;i++){
        console.log("chintai", chintai.rows[i].user, chintai.rows[i].quantity);
        let findflag = 0;
        for(j=0;j < initialAccountBalances.length;j++){
            findflag = 0;
            if(initialAccountBalances[j].account == chintai.rows[i].user){
                temp = chintai.rows[i].quantity.split(" ");
                initialAccountBalances[j].amount = parseFloat(initialAccountBalances[j].amount) + parseFloat(temp[0]);
                console.log("matched", chintai.rows[i].user, initialAccountBalances[j].amount);
                findflag = 1;
                break;
            }
        }
        if(findflag == 0)
              console.log("can not find", chintai.rows[i].user);
    }
    //chintai testing (E)
    
        //chintai testing(S)
    console.log("calling chintai list");
    chintai = require('./chintai/s3.json');
    console.log("chintai length", chintai.length, chintai.rows.length);
    for(i = 0;i<chintai.rows.length;i++){
        console.log("chintai", chintai.rows[i].user, chintai.rows[i].quantity);
        let findflag = 0;
        for(j=0;j < initialAccountBalances.length;j++){
            findflag = 0;
            if(initialAccountBalances[j].account == chintai.rows[i].user){
                temp = chintai.rows[i].quantity.split(" ");
                initialAccountBalances[j].amount = parseFloat(initialAccountBalances[j].amount) + parseFloat(temp[0]);
                console.log("matched", chintai.rows[i].user, initialAccountBalances[j].amount);
                findflag = 1;
                break;
            }
        }
        if(findflag == 0)
              console.log("can not find", chintai.rows[i].user);
    }
    //chintai testing (E)
    
        //chintai testing(S)
    console.log("calling chintai list");
    chintai = require('./chintai/u1.json');
    console.log("chintai length", chintai.length, chintai.rows.length);
    for(i = 0;i<chintai.rows.length;i++){
        console.log("chintai", chintai.rows[i].user, chintai.rows[i].quantity);
        let findflag = 0;
        for(j=0;j < initialAccountBalances.length;j++){
            findflag = 0;
            if(initialAccountBalances[j].account == chintai.rows[i].user){
                temp = chintai.rows[i].quantity.split(" ");
                initialAccountBalances[j].amount = parseFloat(initialAccountBalances[j].amount) + parseFloat(temp[0]);
                console.log("matched", chintai.rows[i].user, initialAccountBalances[j].amount);
                findflag = 1;
                break;
            }
        }
        if(findflag == 0)
              console.log("can not find", chintai.rows[i].user);
    }
    //chintai testing (E)
    
    console.log("calling balance");
    const accountBalances = await filterLists(initialAccountBalances);
    //const ratioBalances = accountBalances.map(tuple => Object.assign(tuple, {amount:getRatio(tuple)}))
    const ratioBalances = accountBalances.map(tuple => Object.assign(tuple, {amount:getRatio(tuple)}))
                          .filter(tuple => tuple.amount >= 0.5); //check DB later
    
    //console.log("ratioBalances", ratioBalances);

    //check voting info and set amount in accordance with that
    //calling test(ratioBalances)
    console.log("calling voting check");
    SnapshotTools.test(ratioBalances);
    
    const ram = await EOSTools.estimateRAM(accountBalances, config);
    if(await Prompter.prompt(
            `\r\nThis airdrop will require that ${config.issuer} has an estimated minimum of ${ram[0]}KB of RAM, at the cost of ${ram[1]} at the current price of ${ram[2]}. \r\nPress enter to continue`
    ) !== '') process.exit();

    const total = (ratioBalances.reduce((acc, e) => acc += parseFloat(e.amount), 0)).toFixed(config.decimals);

    if(await Prompter.prompt(
        `\r\nYou are about to airdrop ${total} ${config.symbol} tokens on ${accountBalances.length} accounts. \r\nPress enter to continue`
    ) !== '') process.exit();
    
    //force exit for testing
    process.exit();

    logger.warn('\r\n\------------------------------------------------------------------\r\n');
    const lastAccountDropped = db.get('lastAccountDropped').value();
    logger.warn(`Starting to airdrop from account '${lastAccountDropped.length ? lastAccountDropped : ratioBalances[0].account}'`);
    logger.warn('\r\n\------------------------------------------------------------------\r\n');

    // Shutting off IO
    Prompter.donePrompting();

    await EOSTools.dropTokens(ratioBalances, config);

    logger.warn(`Finished EOSDrops at ${new Date().toLocaleString()}`);
    process.exit();
};


 var port = process.env.PORT || 5000;
console.log("port", port);

 app.listen(port, function() {
   console.log("Listening on " + port);
 });


setup();
run();

