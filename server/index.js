// Import required modules and the config file
const Discord = require("discord.js"); 
const config = require("./config.json");
const contract = require("./smart_contract");
const { Deta } = require("deta")

// add your Project Key
const deta = Deta(config.deta_key)
// name your DB
const dbase = deta.Base("pockets")


// Define our Client 
const client = new Discord.Client();

// All commands start with the prefix $
const prefix = "$";

// Tipping function
const tip = async(sender, receiver, amount, message) => {
    console.log(receiver)

    // Checking if the receiver's Discord ID is valid
    

    // Search for the sender's eth address from the db
    const senderAddr = await dbase.get(sender);

    if(!senderAddr){
        message.reply("No wallet attached to your Discord ID.");
        return 0;
    }

    let senderBalance = await contract.balance(senderAddr.address);
    console.log("bal",senderBalance);

    if(senderBalance < amount){
        // console.log(senderParsed[0]["balance"]);
        message.reply("Error: Insufficient fund.");
        return 0;
    }

    // Search for the receiver's eth address from the db
    const receiverAddr = await dbase.get(receiver);

    if(!receiverAddr){
        message.reply("No wallet attached to your recipient's Discord ID.");
        return 0;
    }

    try{
        contract.tip(senderAddr.address, receiverAddr.address, amount, message);
    } catch(e){
        console.log(`Error: ${err}`);
    }
   
}


// Function used to find the user's balance
const findBalance = async(user, message) => {

    const res = await dbase.get(user);

    if(!res){
        message.reply("No wallet attached to your Discord ID.");
        return 0;
    }

    // pass the control to balance fn defined in smart_contract.js
    let bal = await contract.balance(res.address);
    message.reply(`Your balance: ${bal} tokens`);

}



const AddWallet = async(user, addr, message) => {
    let exist = 1;

    try {
        const checkExistence = await dbase.get(user);
        console.log("result",checkExistence)

        if(await checkExistence === null){
            exist = 0;
        }
        else{
            message.reply("Wallet already added!");
        }

    } catch (e) {
        console.log(e);
    }

    if(exist == 0){
        switch(addr.length) {
            case 40:
                addr = "0x" + addr;

            case 42: {
                    const regExCheck = new RegExp('^0x[a-fA-F0-9]{40}$');
                    const result = regExCheck.exec(addr);

                    if(result != null){         
                        try { 
                            dbase.put({
                                key: user,
                                address: addr
                            })
                            message.reply("Wallet Added!");
                            contract.airdrop(addr, message);
                        } catch (e) {
                            message.reply(`Transaction failed :(  ${err}`)
                        }
                    }
                }
                break;
            default:
                message.reply("Please provide a valid ethereum address");
        }
    }
}



// When a new message is recieved
client.on("message", function(message){

    // If a bot sends a message, ignore
    if(message.author.bot) return;

    // Look for messages with the prefix $
    if(!message.content.startsWith(prefix)) return;

    // Slice the command to get arguments 
    const commandBody = message.content.slice(prefix.length);
    let args = commandBody.split(' ');
    args = args.filter(element => {
        return element!=''
    });
    const command = args.shift().toLowerCase();
    console.log(args);


    if(command == "ping"){
        const timeTaken = Date.now()  
        message.reply(`Pong! Latency of ${timeTaken}ms.`)
    }

    if(command == "test"){
        const embed = new Discord.MessageEmbed()
            .setTitle("Title")
            .setColor(0xff0000)
            .setDescription("desc");

            message.channel.send(embed);
    }


    if(command == 'initwallet'){
        user = message.author['id'];
        addr = args[0];
        if(!addr){
            message.reply('Invalid Address');
        } else {
            AddWallet(user, addr, message);
        }
    }

    if(command == 'tip'){
        const user = message.author['id'];
        if(!args[0]){
            message.reply('Please tag a person to recieve the tokens');
        } else if (!args[1] || isNaN(args[1])){
            message.reply('Please provide a proper float value for the amount');
        } else {
            const receiver = args[0];
            const validRegex = new RegExp('<@!{0,1}([0-9]{18})>');
            const res = validRegex.exec(receiver);

            // If not valid, return error
            if (res === null){
                message.reply("Error: Invalid receipient.");
                return 0;
            }
            const receiverID = receiver.match(validRegex)[1];
            
            amount = parseFloat(args[1],8);
            console.log(`Reciever: s${receiver}e \nAmount: s${amount}e`);
            console.log(typeof(amount));
            tip(user, receiverID, amount, message);
        }
    }

    if(command == 'balance'){
        user = message.author['id'];
        console.log(`User s${user}e`);
        findBalance(user, message);
    }

    if(command == 'help'){
        
    }

})

// Discord secret token
client.login(config.BOT_TOKEN);
