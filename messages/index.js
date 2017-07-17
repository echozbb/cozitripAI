/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-waterfall
-----------------------------------------------------------------------------*/
"use strict";
var loaded = require('dotenv-extended').load('./.env');
var format = require('string-format');
const LUISClient = require("./luis_sdk");

var LUIS_URL = "";
var NODE_ENV = "development";
var APPID="";
var APPKEY="";

if (loaded) {
    LUIS_URL = process.env.LUIS_MODEL_URL;
    NODE_ENV = process.env.NODE_ENV;
    APPID = process.env.APPID;
    APPKEY = process.env.APPKEY;
} else {
    LUIS_URL = process.env['LUIS_MODEL_URL'];
    NODE_ENV = process.env['BotEnv'];
    APPID = process.env['APPID'];
    APPKEY = process.env['APPKEY'];
}

var LUISclient = LUISClient({
 appId: APPID,
 appKey: APPKEY,
 verbose: true
});


console.log("Running under env :" + NODE_ENV);
console.log("Using LUIS URL: " + LUIS_URL);

var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var Store = require('./store');
var Hotel = require('./hotel-service');
var Domain = require('./domain');
var spellService = require('./spell-service');
var useEmulator = (NODE_ENV == 'development');
var functions = require('./functions');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

//var bot = new builder.UniversalBot(connector, [
//    function (session) {
//        session.send("Welcome to the cozitrip! What can I help you?");
//    }
//]);

var recognizer = new builder.LuisRecognizer(LUIS_URL);
bot.recognizer(recognizer);


bot.dialog('/', [
    function (session, args) {
        session.send('Welcome to cozitrip! You can say like this: 2017-10-20 - 2017-10-21 悉尼 Four Seasons 两卧室公寓 2间房 不含早.');
    }
]);

bot.dialog('AskPrice',[
    function (session, args, next){
        console.log('-------- askPrice --------1');
        functions.saveEntities(builder, args.intent, session);
        session.dialogData.messageContent = session.message.text;
        next({ response: true });
    },

    function (session, results, next) {
        console.log('-------- askPrice --------2');
         if (session.dialogData.cityEntity) {
            console.log("resolution.values:" + session.dialogData.cityEntity.resolution.values[0]);
            next({ response: true });
        } else {
            session.beginDialog('askForCity');
        }
    },
    function (session, results, next) {
        console.log('-------- askPrice --------3');
        if (session.dialogData.cityEntity) {
            
        } else {
            var cityName = results.response;
            session.dialogData.cityName = cityName;
        }
        next ({response: true});
    },
    function (session, results, next) {
        console.log('-------- askPrice --------4');
        if (session.dialogData.hotelEntity) {
             next({ response: true });
        } else {
            session.beginDialog('askForHotel');
        }
    },
    function (session, results, next) {
        console.log('-------- askPrice --------5');
         if (session.dialogData.hotelEntity) {
             next({ response: true });
         } else {
             var hotelName = results.reponse;
             console.log('User input hotel : ' + hotelName);
             session.dialogData.hotelName = hotelName;
             next ({response: true});
         }
    },
    function (session, results, next) {
        console.log('-------- askPrice --------6');
        var query = session.dialogData.messageContent;
        var isRemap = false;
        if (session.dialogData.hotelName) {
            query += ' ' + session.dialogData.hotelName;
            isRemap = true;
        }
        if (session.dialogData.cityName) {
            query += ' in ' + session.dialogData.cityName
            isRemap = true;
        }
        console.log('Full query is :' + query);
        if (isRemap) {
            //functions.extractLuis(query).then( functions.saveEntities(builder, response, session));
            extractLuis(query).then(function (response) {
                //console.log('got response: ' + JSON.stringify(response));
                //var agrs = response;
                functions.saveEntities(builder, response, session);
                console.log('DEBUG cityEntity.entity: ' + session.dialogData.cityEntity.entity)
                console.log('DEBUG session.dialogData.fromDate: ' + JSON.stringify(session.dialogData.fromDate ));
                next ({response: true});
            })
        } else {
            next ({response: true});
        }
        
        
    },
    function (session, results) {
            console.log('start to search hotels.....');
            var message = 'Looking for hotel in ' + session.dialogData.cityEntity.entity + ', please wait a while.';
            var hotelUuid = '';
            var hotelName = '';
            if (session.dialogData.hotelEntity) {
                hotelName = session.dialogData.hotelEntity.entity;
                message += '<br> Hotel Name: ' + hotelName;
                //TODO: check matched hotels
                hotelUuid = session.dialogData.hotelEntity.resolution.values[0];
            }
            message += '<br> Room number:' + session.dialogData.RoomNum;
            message += '<br> checkin at ' + session.dialogData.fromDate.entity;
            message += '<br> checkout at ' + session.dialogData.toDate.entity;
            var destination = session.dialogData.cityEntity.resolution.values[0];
            var checkin = session.dialogData.fromDate.entity;
            var checkout = session.dialogData.toDate.entity;
            
            session.send(message, destination);
        
        //******** get hotel information **********
//        Hotel.getHotelInfo('0a5612bb-d8a5-4577-9de2-c1ee80a4922a').then( function(hotelInfo) {
//           session.send(JSON.stringify(hotelInfo)); 
//        });
        var freeBreakfast = null;
        if (session.dialogData.indBreakfast) {
            if (session.dialogData.indBreakfast.resolution.values[0] == 'exBreakfast') {
                freeBreakfast = false;
            } else if (session.dialogData.indBreakfast.resolution.values[0] == 'inBreakfast') {
                freeBreakfast = true;
            }
        }
        var multiRequest = new Domain.multiRoomRequest(session.dialogData.cityCode, checkin, checkout, session.dialogData.RoomNum,freeBreakfast);
        
        Hotel.getRoomTypes(hotelUuid, multiRequest).then( function (rooms) {
            console.log('We find rooms: ' + JSON.stringify(rooms));
            console.log('total rooms size = ' + rooms.length);
            var message = '\n We found following price for ' + hotelName + ':';
            
            for (var i=0; i < rooms.length; i++) {
                console.log('processing ' + i + ': ' + rooms[i].roomName);
                message += '<br>' + rooms[i].roomName + ': ' + rooms[i].price + ', 是否免费取消：' + rooms[i].freeCancellation + ', 早餐：' + rooms[i].breakfast;
            }
            session.send(message);
            
//            var message = new builder.Message()
//                    .attachmentLayout(builder.AttachmentLayout.carousel)
//                    .attachments(rooms.map(roomAsAttachment));
//                session.send(message);
        });
        
        
//        Store.searchHotel(destination, checkin, checkout)
//            .then(function (hotels) {
//                var message = new builder.Message()
//                    .attachmentLayout(builder.AttachmentLayout.carousel)
//                    .attachments(hotels.map(hotelAsAttachment));
//                session.send(message);
//            });
         //End
        session.endDialog();

    }
]).triggerAction({
    matches: 'AskPrice'
});


// Dialog to ask for city
bot.dialog('askForCity', [
    function (session) {
        console.log("Starting in askForCity");
        builder.Prompts.text(session, "Please tell me where do you want go?");
    },
    function (session, results) {
        session.send("ok, you want to go to " + results.response);
        //var cityEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'city');
        var cityName = results.response;
        //session.dialogData.cityName = results.response;
        //session.userData.cityName = results.response;
        session.endDialogWithResult(results);
    }
]);

bot.dialog('askForHotel', [
      function (session) {
        console.log("Starting in askForHotel");
        builder.Prompts.text(session, "Please tell me which hotel you want to stay?");
    },
    function (session, results) {
        session.send("ok, you want to stay in " + results.response);
        //var cityEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'city');
        
        //session.dialogData.cityName = results.response;
        //session.userData.cityName = results.response;
        session.endDialogWithResult(results);
    }
]);

bot.dialog('Help', function (session) {
    session.endDialog('Hi! Try asking me things like /2017-10-20 to 2017-10-22 in Sydney, 2 rooms/');
}).triggerAction({
    matches: 'Help'
});

// Spell Check
if (process.env.IS_SPELL_CORRECTION_ENABLED === 'true') {
    bot.use({
        botbuilder: function (session, next) {
            spellService
                .getCorrectedText(session.message.text)
                .then(function (text) {
                    session.message.text = text;
                    next();
                })
                .catch(function (error) {
                    console.error(error);
                    next();
                });
        }
    });
}

// Helpers
function hotelAsAttachment(hotel) {
    return new builder.HeroCard()
        .title(hotel.name)
        .subtitle('%d stars. %d reviews. From $%d per night.', hotel.rating, hotel.numberOfReviews, hotel.priceStarting)
        //.images([new builder.CardImage().url(hotel.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://b2bweb-uat.cozitrip.com/#/home')
        ]);
}

function roomAsAttachment(room) {
    return '<br>' + room.roomName + ': ' + room.price;
//    return new builder.HeroCard()
//        .title(room.roomName)
//        .subtitle('From $%d.', room.price)
//        .images([new builder.CardImage().url(room.image)])
//        .buttons([
//            new builder.CardAction()
//                .title('Book')
//                .type('openUrl')
//                .value('https://b2bweb-uat.cozitrip.com/#/home')
//        ]);
}

function reviewAsAttachment(review) {
    return new builder.ThumbnailCard()
        .title(review.title)
        .text(review.text)
        .images([new builder.CardImage().url(review.image)]);
}


function printOnSuccess (response) {
  console.log("Query: " + response.query);
  console.log("Top Intent: " + response.topScoringIntent.intent);
  console.log("Entities:");
  for (var i = 1; i <= response.entities.length; i++) {
    console.log(i + "- " + response.entities[i-1].entity);
  }
  if (typeof response.dialog !== "undefined" && response.dialog !== null) {
    console.log("Dialog Status: " + response.dialog.status);
    if(!response.dialog.isFinished()) {
      console.log("Dialog Parameter Name: " + response.dialog.parameterName);
      console.log("Dialog Prompt: " + response.dialog.prompt);
    }
  }
}

function extractLuis (query) {
        return new Promise (function (resolve){
            var response = LUISclient.predict(query, {
                 onSuccess: function (response) {
                     console.log('LUIS RESPONSE: ' + JSON.stringify(response));
                     setTimeout(function () { resolve(response); }, 1000);
                 },
                 onFailure: function (err) {console.error(err);}
            });
            
        })    
}

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
