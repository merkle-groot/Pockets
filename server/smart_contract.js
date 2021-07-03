//library
var Web3 = require('web3')
var Contract = require('web3-eth-contract');
var Tx = require('ethereumjs-tx');
const config = require("./config.json");
const Discord = require("discord.js"); 
    
//infura config
const rpcURL = config.rpc_url;
var web3 = new Web3(rpcURL);

//account related
const account = config.address;
const privateKey = config.private_key;
const privateKeyBuffer = Buffer.from(privateKey, 'hex');
const contractAddress = config.contract_address;
const contractABI = config.abi;

//init contract
var contract = new Contract(contractABI,contractAddress);

const tip = async(senderAddress, receiverAddress, amount, message) => {
     //function ABI
     const myData = contract.methods.transferFromServer(senderAddress, receiverAddress, amount).encodeABI();
     console.log(myData)
 
     // transaction count
     const transactionCount = await web3.eth.getTransactionCount(account);
     console.log(transactionCount);
 
     // Transaction Object
     const txObject = {
         nonce:    web3.utils.toHex(transactionCount),
         to:       contractAddress,
         value:    web3.utils.toHex(web3.utils.toWei('0', 'ether')),
         gasLimit: web3.utils.toHex(2100000),
         gasPrice: web3.utils.toHex(web3.utils.toWei('6', 'gwei')),
         data: myData  
     }
 
     // sign
     const tx = new Tx.Transaction(txObject, {chain:'goerli', hardfork: 'petersburg'});
     tx.sign(privateKeyBuffer);
 
     const serializedTx = tx.serialize();
     const raw = '0x' + serializedTx.toString('hex');
 
     // Broadcast the transaction
     try {
         const transaction = await web3.eth.sendSignedTransaction(raw);
         console.log(transaction);
         console.log(transaction['transactionHash']);
         message.reply(`Tipped! \nTx link: https://goerli.etherscan.io/tx/${transaction['transactionHash']}`);
     } catch(e) {
         message.reply("Transaction error!")
     }
 
     return 0;
}

const airdrop = async (airdrop_addr, message) => {

    //function ABI
    const myData = contract.methods.airdrop(airdrop_addr).encodeABI();
    console.log(myData)

    // transaction count
    const transactionCount = await web3.eth.getTransactionCount(account);
    console.log(transactionCount);

    // Transaction Object
    const txObject = {
        nonce:    web3.utils.toHex(transactionCount),
        to:       contractAddress,
        value:    web3.utils.toHex(web3.utils.toWei('0', 'ether')),
        gasLimit: web3.utils.toHex(2100000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('6', 'gwei')),
        data: myData  
    }

    // sign
    const tx = new Tx.Transaction(txObject, {chain:'goerli', hardfork: 'petersburg'});
    tx.sign(privateKeyBuffer);

    const serializedTx = tx.serialize();
    const raw = '0x' + serializedTx.toString('hex');

    // Broadcast the transaction
    try {
        const transaction = await web3.eth.sendSignedTransaction(raw);
        console.log(transaction);
        console.log(transaction['transactionHash']);
        message.reply(`Airdropped 100 tokens to your address! \nTx link: https://goerli.etherscan.io/tx/${transaction['transactionHash']}`);
    } catch(e) {
        message.reply("Airdrop tx error!")
    }

    return 0;
}

const balance = async (address) => {
    var MyContract = new web3.eth.Contract(config.abi,config.contract_address);
    const res = await MyContract.methods.balanceOf(address).call();
    console.log(res);
    return res;
    // MyContract.methods.balanceOf(address).call().then(console.log);
    // const res = await contract.methods.balanceOf(address).call({
    //     from: '0xbA3a9d03C0d2E330279f5ca92E2aD5af7083BB26'
    // });
    // console.log(contract.methods);
}



module.exports = { airdrop, tip, balance };

