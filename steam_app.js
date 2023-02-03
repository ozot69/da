/*
    Project: Steam Hour Bot - NodeJS
    Note: By using this bot i will not be responsible if you edit the code for bad purposes.
    Created by SwayerPT with Love.
*/

//=============== CONFIGURATIONS  ===============//

const Steam = require('steam-user'), 
      fs = require('fs'), 
      readlineSync = require('readline-sync'), 
      chalk = require('chalk'),
      SteamCommunity = require('steamcommunity');
const client = new Steam();

//========== CONFIG > GAME SETTINGS ============//

const settings = {
  "acceptRandomFriendRequests": false,  
  "acceptItemNotify": true,  
  "acceptTradesNotify": true,  
  "acceptReplys": false,
  "limits": 25, //by default
  "restriction": 5, //restricted users (dont change)
  "games_id": [252490, 440, 730]  //add your gameIds by ","
}

//=============== VARIABLES  ===============//

var version = 'v1.4.3';
    console.log(chalk.white.bold.bgBlack('    Steam Hour [Bot]     '));
    console.log(chalk.gray.underline('                   ' + version));
    console.log(chalk.black.bold.bgWhite('      Steam Login        '));
var username = readlineSync.question(chalk.gray.bold(' Username ') + ': ');
var password = readlineSync.question(chalk.gray.bold(' Password ') + ': ', {hideEchoBack: true});
var mobileCode = readlineSync.question(chalk.gray.bold(' Steam Guard ') + ': ', {hideEchoBack: true});
var wstream;
var dtiming = new Date();
var tstamp = Math.floor(Date.now() / 1000);
var CountGamesUsed = function(array) {
  for (var i = array.Length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

//=============== SESSION START  ===============//

client.logOn({
  accountName: username,
  password: password,
  twoFactorCode: mobileCode
});

client.on("loggedOn", function() {
  client.setPersona(Steam.EPersonaState.Away);

    if (username === "" || password === "") {

        console.log(chalk.black.bold.bgWhite('    Connection Status    '));

        log((chalk.red("Login Denied - Empty fields.")));
        shutdown();        
    } else {
	console.log(chalk.black.bold.bgWhite('    Connection Status    '));
        
        client.on('accountInfo', function(steamID, accountName) {
             log((chalk.green("Logged in as "+steamID+".")));
            
             //=============== VACBAN VERIFY  ===============//
            
             client.on('vacBans', function(numBans, appids) {
               if(numBans > 0) {
                  log((chalk.red("Verified ("+ numBans + ") ban" + (numBans == 1 ? '' : 's') + "." + (appids.length == 0 ? '' : " in " + appids.join(', ')) )));
                      log((chalk.red("[BOT] not able to proceed with banned games."))); 
                      shutdown(); 
               }
            });
        });

        log((chalk.yellow("Tip: Use (CTRL + C) to Logout.")));           

        //=============== GAMES IN SESSION  ===============//
        
        client.gamesPlayed(CountGamesUsed(settings.games_id));        
    }   
});

//=============== CONNECT TO SERVERS  ===============//

if (fs.existsSync('servers')) {
    Steam.servers = JSON.parse(fs.readFileSync('servers'));
    log((chalk.green("Connecting ...")));   
}

client.on("connected", function() {
    log((chalk.green("Starting Bot...")));  
});

//=============== LIMITATIONS (PREVENT LIMITED ACCOUNTS WITH ONLY 5 GAMES)  ===============//

client.on('accountLimitations', function (limited, communityBanned, locked, canInviteFriends) {

console.log(chalk.black.bold.bgWhite('      Initializing       '));

    //=============== INVITE FRIENDS  ===============//
    
    if (canInviteFriends == 2){
        log((chalk.red("[Invite] canInviteFriends Banned.")));         
    } else {
        log((chalk.green("Checking Invite Friends ...")));       
    }

    //=============== COMM BANNED  ===============//
    
    if (communityBanned){
        log((chalk.red("[Community] Community Banned.")));         
    } else {
        log((chalk.green("Checking Community ...")));       
    }

    //=============== MARKET LOCKED  ===============//
    if(locked) {
        log((chalk.red("[Account] Locked Account."))); 
    } else {
        log((chalk.green("Checking Account ...")));    
    }       

    log((chalk.green("Initializing ...")));

    //=============== CHECK LIMITATIONS  ===============//
    
    if (limited) {  
        if(settings.games_id.length < settings.restriction) {
            log((chalk.blue("This Account is Limited.")));
            log((chalk.green("[Limited] Currently In-Game " + settings.games_id.length +".")));
        } else {
            error((chalk.red("Exceeded the limit 5 Games...")));
            shutdown(); 
        }      
    } else if(settings.games_id.length < settings.limits) {
        log((chalk.green("Currently In-Game " + settings.games_id +".")));
  
    } else {
        error((chalk.red("Exceeded the limit 25 Games.")));
	    shutdown();                   
    }  

});

//=============== FRIENDSHIP NOTIFY ===============//

client.on('friendRelationship', (steamID, relationship) => {

    if (relationship === 2 && settings.acceptRandomFriendRequests) {
	  client.addFriend(steamID);
      //client.removeFriend(steamID);  
      //client.chatMessage(steamID, "Thank you for Added me. We talk later.");        
      log(chalk.yellow('You have an invite from '+steamID+'.'));        
        
    } else {
       error((chalk.red("Unable to Accept Requests.")));
    }	
});

//=============== ITEMS NOTIFY  ===============//

client.on('newItems', function (count) {

    if(settings.acceptItemNotify) {
      if(count > 0) {
          log(chalk.yellow("You received ("+ count + ") items in your Inventory."));  
      } 
    } else {
        error((chalk.red("Unable to Drop.")));
    }	
});

//=============== TRADES NOTIFY  ===============//

client.on('tradeOffers', function (number, steamID) {

    if(settings.acceptTradesNotify) {
        if (number > 0) {
            log(chalk.yellow("You received ("+ number +") Trade Offer from "+steamID+"."));     
        }        
    } else {
        error((chalk.red("Unable to Trade.")));
    }	  
});


//=============== AUTO MSG REPLY  ===============//

client.on("friendMessage", function(steamID, message) {

    log((chalk.yellow("Received a message from " + steamID.getSteam3RenderedID() + " saying: " + message)));

    if(settings.acceptReplys) {
        if (message == "hello") {
            client.chatMessage(steamID, "Yoo, wait a moment. ;D");
        }
        if (message == "play") {
            client.chatMessage(steamID, "Not now... i'm making missions");
        }  
        if (message == "Why") {
            client.chatMessage(steamID, "Because i'm doing something");
        }
        if (message == "yo") {
            client.chatMessage(steamID, "Yoo, wait a moment ;D");
        }
        if (message == "Do you want to play?") {
            client.chatMessage(steamID, "Not now");
        }
        if (message == "Whatsup") {
            client.chatMessage(steamID, "hey");
        }
        if (message == "Are you there?") {
            client.chatMessage(steamID, "Yes, but i'm leaving... bye");
        }
        if (message == "...") {
            client.chatMessage(steamID, "Not now!");
        } 
        if (message == "yes") {
            client.chatMessage(steamID, "Not now!");
        }            
    } else {
        error((chalk.red("Unable to Auto-answer.")));
    }	
});


//=============== ERROR SYS  ===============//

client.on("error", function(err) {

console.log(chalk.white.bold.bgRed('    Connection Status    '));

    if (err.eresult == Steam.EResult.InvalidPassword)
    {
        error((chalk.red("User or Password Wrong."))); 
        shutdown();
    }
    else if (err.eresult == Steam.EResult.AlreadyLoggedInElsewhere)
    {
        error((chalk.red("Already logged in!")));         
        shutdown();
    }
    else if (err.eresult == Steam.EResult.AccountLogonDenied)
    {
        error((chalk.red("SteamGuard is required!")));        
        shutdown();
    }
});


//=============== SHUT DOWN SYS  ===============//

process.on('SIGINT', function() {
    shutdown();
});

/*
process.on('SIGHUP', function() {

    log((chalk.red("New Connection...")));
});*/

//=============== FUNCTIONS ===============//

function log(message) {
	var date = new Date();
	var time = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
	
	for(var i = 1; i < 6; i++) {
		if(time[i] < 10) {
			time[i] = '0' + time[i];
		}
	}
	console.log(' ' + time[3] + ':' + time[4] + ':' + time[5] + ' - \x1b[36m%s\x1b[0m', '[STEAM] ' + message);
}

function error(message) {
	var date = new Date();
	var time = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
	
	for(var i = 1; i < 6; i++) {
		if(time[i] < 10) {
			time[i] = '0' + time[i];
		}
	}
	console.log(' ' + time[3] + ':' + time[4] + ':' + time[5] + ' - \x1b[36m%s\x1b[0m', '[ERROR] ' + message);
}

function shutdown(code) {
    
    log((chalk.red("Connection Lost...")));
	client.logOff();
	client.once('disconnected', function() {
		process.exit(code);
	});

	setTimeout(function() {
		process.exit(code);
	}, 500);
}
